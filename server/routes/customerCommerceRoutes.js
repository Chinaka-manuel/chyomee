import express from "express";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import auth from "../middlewares/auth.js";
import admin from "../middlewares/adminMiddleware.js";
import { AdminRecord } from "../models/AdminRecord.js";
import { Product } from "../models/Product.js";
import { User } from "../models/userSchema.js";
import {
  confirmBankTransferPayment,
  initializePaystackTransaction,
  isValidPaystackSignature,
  generateReceiptNumber,
  markOrderPaid,
  releaseInventory,
  restoreLoyaltyRedemption,
  reserveInventory,
  verifyPaystackTransaction,
} from "../services/paystack.js";

import {
    sendOrderConfirmationEmail,
    sendOrderNotificationEmail,
    sendPaymentReceiptEmail,
} from "../config/email.js";
const router = express.Router();
const MINIMUM_LOYALTY_REDEMPTION_KOBO = 500000;
const tailoringProfiles = {
  dress: ["fullHeight", "neckCircumference", "bustChest", "underBust", "waist", "highHip", "fullHip", "shoulderWidth", "acrossBack", "acrossChest", "frontWaistLength", "backWaistLength", "shoulderToBustPoint", "bustPointDistance", "armhole", "bicep", "sleeveLength", "wrist", "shoulderToWaist", "dressLength", "waistToFloor"],
  shirt: ["fullHeight", "neckCircumference", "bustChest", "waist", "fullHip", "shoulderWidth", "acrossBack", "acrossChest", "armhole", "bicep", "sleeveLength", "wrist", "shirtLength"],
  suit: ["fullHeight", "neckCircumference", "bustChest", "waist", "highHip", "fullHip", "shoulderWidth", "acrossBack", "acrossChest", "frontWaistLength", "backWaistLength", "armhole", "bicep", "sleeveLength", "wrist", "jacketLength", "trouserWaist", "crotchDepth", "frontRise", "backRise", "thigh", "knee", "calf", "ankle", "inseam", "outseam"],
  trousers: ["fullHeight", "trouserWaist", "highHip", "fullHip", "crotchDepth", "frontRise", "backRise", "thigh", "knee", "calf", "ankle", "inseam", "outseam"],
  skirt: ["naturalWaist", "highHip", "fullHip", "skirtLength", "waistToFloor"],
  jacket: ["fullHeight", "neckCircumference", "bustChest", "waist", "fullHip", "shoulderWidth", "acrossBack", "acrossChest", "armhole", "bicep", "sleeveLength", "wrist", "jacketLength"],
  jumpsuit: ["fullHeight", "neckCircumference", "bustChest", "underBust", "waist", "fullHip", "shoulderWidth", "frontWaistLength", "backWaistLength", "armhole", "bicep", "sleeveLength", "trouserWaist", "crotchDepth", "thigh", "knee", "inseam", "outseam", "jumpsuitLength"],
  kaftan: ["fullHeight", "neckCircumference", "bustChest", "waist", "fullHip", "shoulderWidth", "armhole", "bicep", "sleeveLength", "wrist", "garmentLength"],
  children: ["ageYears", "fullHeight", "bustChest", "waist", "fullHip", "shoulderWidth", "sleeveLength", "armhole", "garmentLength", "inseam"],
};
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const ownedOrder = (id, userId) => ({
  _id: id,
  resource: "order",
  createdBy: userId,
});

const presentOrder = (record) => ({
  ...record.payload,
  id: record._id.toString(),
});

const sendOrderEmails = async (order) => {
    const results = await Promise.allSettled([
        sendOrderConfirmationEmail(order),
        sendOrderNotificationEmail(order),
    ]);
    for (const result of results) {
        if (result.status === "rejected") {
            console.error("Order email could not be sent:", result.reason.message);
        }
    }
};

const priceCheckout = (items, subtotalKobo, loyaltyBalanceKobo, redeemLoyalty) => {
  const balanceKobo = Number.isSafeInteger(loyaltyBalanceKobo)
    ? Math.max(0, loyaltyBalanceKobo)
    : 0;
  const loyaltyPointsRedeemedKobo =
    redeemLoyalty && balanceKobo >= MINIMUM_LOYALTY_REDEMPTION_KOBO
      ? Math.min(balanceKobo, subtotalKobo)
      : 0;

  return {
    items,
    subtotal: subtotalKobo / 100,
    deliveryFee: 0,
    loyaltyBalance: balanceKobo / 100,
    loyaltyBalanceKobo: balanceKobo,
    loyaltyEligible: balanceKobo >= MINIMUM_LOYALTY_REDEMPTION_KOBO,
    loyaltyDiscount: loyaltyPointsRedeemedKobo / 100,
    loyaltyPointsRedeemedKobo,
    total: (subtotalKobo - loyaltyPointsRedeemedKobo) / 100,
  };
};

const validateProductOptions = (product, selection) => {
  const optionGroups = [
    ["size", "sizes"],
    ["color", "colors"],
    ["style", "styles"],
  ];
  for (const [selectionKey, productKey] of optionGroups) {
    const selected = selection[selectionKey] || "";
    const available = Array.isArray(product[productKey])
      ? product[productKey]
      : [];
    if (
      (available.length > 0 &&
        !available.some(
          (option) => option.toLowerCase() === selected.toLowerCase(),
        )) ||
      (available.length === 0 && selected)
    ) {
      return available.length
        ? `Choose an available ${selectionKey} for ${product.name}`
        : `${product.name} does not have ${selectionKey} options`;
    }
  }
  return "";
};

const getCartData = async (user) => {
  const cart = [];
  for (const entry of user.cart ?? []) {
    const product = await Product.findOne({
      _id: entry.product,
      status: "Active",
    }).lean();
    if (product) {
      cart.push({
        product,
        quantity: entry.quantity,
        size: entry.size || "",
        color: entry.color || "",
        style: entry.style || "",
      });
    }
  }
  const subtotal = cart.reduce(
    (sum, entry) => sum + entry.product.price * entry.quantity,
    0,
  );
  return { cart, subtotal };
};

const getCheckout = async (user, redeemLoyalty = false) => {
  const { cart } = await getCartData(user);
  for (const { product, size, color, style } of cart) {
    const optionError = validateProductOptions(product, { size, color, style });
    if (optionError) {
      const error = new Error(optionError);
      error.statusCode = 400;
      throw error;
    }
  }
  const items = cart.map(({ product, quantity, size, color, style }) => ({
    product: product._id.toString(),
    name: product.name,
    image: product.image,
    price: product.price,
    quantity,
    ...(size ? { size } : {}),
    ...(color ? { color } : {}),
    ...(style ? { style } : {}),
  }));
  const subtotalKobo = items.reduce(
    (sum, item) => sum + Math.round(Number(item.price) * 100) * item.quantity,
    0,
  );
  return priceCheckout(
    items,
    subtotalKobo,
    user.loyaltyBalanceKobo,
    redeemLoyalty,
  );
};

const getCheckoutFromItems = async (
  items,
  loyaltyBalanceKobo = 0,
  redeemLoyalty = false,
) => {
  if (!Array.isArray(items) || !items.length || items.length > 100) {
    const error = new Error("Your cart is empty or invalid");
    error.statusCode = 400;
    throw error;
  }
  const cart = [];
  const seenProductVariants = new Set();
  for (const item of items) {
    const productId = item?.productId || item?.id;
    const quantity = Number(item?.quantity);
    const size = typeof item?.size === "string" ? item.size.trim() : "";
    const color = typeof item?.color === "string" ? item.color.trim() : "";
    const style = typeof item?.style === "string" ? item.style.trim() : "";
    if (
      !mongoose.isValidObjectId(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 1000
    ) {
      const error = new Error("Invalid product or quantity in checkout");
      error.statusCode = 400;
      throw error;
    }
    const variantKey = `${String(productId)}::${size.toLowerCase()}::${color.toLowerCase()}::${style.toLowerCase()}`;
    if (seenProductVariants.has(variantKey)) {
      const error = new Error("Combine quantities for identical product variants");
      error.statusCode = 400;
      throw error;
    }
    seenProductVariants.add(variantKey);
    const product = await Product.findOne({
      _id: productId,
      status: "Active",
    }).lean();
    if (!product) {
      const error = new Error(
        `${product?.name || "A product"} is unavailable in the requested quantity`,
      );
      error.statusCode = 409;
      throw error;
    }
    const optionError = validateProductOptions(product, { size, color, style });
    if (optionError) {
      const error = new Error(optionError);
      error.statusCode = 400;
      throw error;
    }
    cart.push({ product, quantity, size, color, style });
  }
  const checkoutItems = cart.map(({ product, quantity, size, color, style }) => ({
    product: product._id.toString(),
    name: product.name,
    image: product.image,
    price: product.price,
    quantity,
    ...(size ? { size } : {}),
    ...(color ? { color } : {}),
    ...(style ? { style } : {}),
  }));
  const subtotalKobo = checkoutItems.reduce(
    (sum, item) =>
      sum + Math.round(Number(item.price) * 100) * item.quantity,
    0,
  );
  return priceCheckout(
    checkoutItems,
    subtotalKobo,
    loyaltyBalanceKobo,
    redeemLoyalty,
  );
};

const createReservedOrder = async (user, checkout, payload) => {
  if (!(await reserveInventory(checkout.items))) {
    const error = new Error(
      "Some items are no longer available in the requested quantity",
    );
    error.statusCode = 409;
    throw error;
  }
  const loyaltyPointsRedeemedKobo =
    checkout.loyaltyPointsRedeemedKobo ?? 0;
  let loyaltyReserved = false;
  try {
    if (loyaltyPointsRedeemedKobo > 0) {
      const result = await User.updateOne(
        {
          _id: user._id,
          loyaltyBalanceKobo: { $gte: loyaltyPointsRedeemedKobo },
        },
        { $inc: { loyaltyBalanceKobo: -loyaltyPointsRedeemedKobo } },
      );
      if (result.modifiedCount !== 1) {
        const error = new Error(
          "Your loyalty balance changed. Refresh checkout and try again.",
        );
        error.statusCode = 409;
        throw error;
      }
      loyaltyReserved = true;
    }

    const paidWithLoyalty = payload.paymentStatus === "Paid";
    return await AdminRecord.create({
      resource: "order",
      createdBy: user._id,
      payload: {
        ...payload,
        items: checkout.items,
        loyaltyBalanceAtCheckoutKobo: checkout.loyaltyBalanceKobo,
        loyaltyDiscount: checkout.loyaltyDiscount,
        loyaltyPointsRedeemedKobo,
        loyaltyPointsEarnedKobo: 0,
        inventoryReserved: !paidWithLoyalty,
        ...(!paidWithLoyalty && {
          reservationExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
        }),
      },
    });
  } catch (error) {
    await releaseInventory(checkout.items);
    if (loyaltyReserved) {
      await User.updateOne(
        { _id: user._id },
        { $inc: { loyaltyBalanceKobo: loyaltyPointsRedeemedKobo } },
      );
    }
    throw error;
  }
};

const createOrderNumber = () =>
  `NA-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

const updateCartItem = async (req, res) => {
  const productId = req.params.productId || req.body?.productId;
  if (!mongoose.isValidObjectId(productId)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid product id" });
  }
  const quantity = req.body?.quantity;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
    return res
      .status(400)
      .json({
        status: "failed",
        message: "Quantity must be between 1 and 1000",
      });
  }
  const product = await Product.findOne({
    _id: productId,
    status: "Active",
  });
  if (!product)
    return res
      .status(404)
      .json({ status: "failed", message: "Product not found" });
  const size = typeof req.body?.size === "string" ? req.body.size.trim() : "";
  const color = typeof req.body?.color === "string" ? req.body.color.trim() : "";
  const style = typeof req.body?.style === "string" ? req.body.style.trim() : "";
  const optionError = validateProductOptions(product, { size, color, style });
  if (optionError) {
    return res.status(400).json({
      status: "failed",
      message: optionError,
    });
  }
  const user = await User.findById(req.user._id);
  const item = user.cart.find(
    (entry) =>
      entry.product.toString() === productId &&
      (entry.size || "") === size &&
      (entry.color || "") === color &&
      (entry.style || "") === style,
  );
  if (item) item.quantity = quantity;
  else user.cart.push({ product: product._id, quantity, size, color, style });
  await user.save();
  return res
    .status(200)
    .json({ status: "success", data: (await getCartData(user)).cart });
};

router.get("/cart", auth, async (req, res) => {
  const { cart } = await getCartData(req.user);
  return res.status(200).json({ status: "success", data: cart });
});
router.get("/cart/summary", auth, async (req, res) => {
  const { cart, subtotal } = await getCartData(req.user);
  return res.status(200).json({
    status: "success",
    data: { items: cart.length, subtotal },
  });
});
router.post("/cart", auth, updateCartItem);
router.put("/cart/:productId", auth, updateCartItem);
router.delete("/cart/:productId", auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.productId)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid product id" });
  }
  const size = typeof req.query.size === "string" ? req.query.size.trim() : "";
  const color = typeof req.query.color === "string" ? req.query.color.trim() : "";
  const style = typeof req.query.style === "string" ? req.query.style.trim() : "";
  const optionMatch = (field, value) =>
    value
      ? { [field]: value }
      : { $or: [{ [field]: "" }, { [field]: { $exists: false } }] };
  const pullCriteria = {
    product: req.params.productId,
    $and: [
      optionMatch("size", size),
      optionMatch("color", color),
      optionMatch("style", style),
    ],
  };
  await User.updateOne({ _id: req.user._id }, { $pull: { cart: pullCriteria } });
  return res
    .status(200)
    .json({ status: "success", message: "Cart item removed" });
});
router.delete("/cart", auth, async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $set: { cart: [] } });
  return res.status(200).json({ status: "success", message: "Cart cleared" });
});

router.post("/checkout/calculate", auth, checkoutLimiter, async (req, res) => {
  const redeemLoyalty = req.body?.redeemLoyalty === true;
  const checkout = Array.isArray(req.body?.items)
    ? await getCheckoutFromItems(
        req.body.items,
        req.user.loyaltyBalanceKobo,
        redeemLoyalty,
      )
    : await getCheckout(req.user, redeemLoyalty);
  return res.status(200).json({ status: "success", data: checkout });
});
router.get("/checkout/summary", auth, async (req, res) => {
  const checkout = await getCheckout(req.user);
  return res.status(200).json({ status: "success", data: checkout });
});
router.post(
  "/checkout/delivery-fee",
  auth,
  checkoutLimiter,
  async (_req, res) =>
    res.status(200).json({ status: "success", data: { deliveryFee: 0 } }),
);
router.post("/checkout/order", auth, checkoutLimiter, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user)
    return res
      .status(401)
      .json({ status: "failed", message: "Please sign in to check out" });
  const checkout = await getCheckoutFromItems(
    req.body?.items,
    user.loyaltyBalanceKobo,
    req.body?.redeemLoyalty === true,
  );
  const details = req.body?.customer ?? {};
  const customerName =
    [details.firstName, details.lastName]
      .filter((value) => typeof value === "string")
      .join(" ")
      .trim() || user.userName;
  const email =
    typeof details.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)
      ? details.email
      : user.email;
  if (
    ![details.address, details.city, details.state, details.phone].every(
      (value) => typeof value === "string" && value.trim(),
    )
  ) {
    return res
      .status(400)
      .json({
        status: "failed",
        message: "Enter valid delivery contact details and address",
      });
  }
  const paidWithLoyalty =
    checkout.total === 0 && checkout.loyaltyPointsRedeemedKobo > 0;
  const order = await createReservedOrder(user, checkout, {
    customer: { name: customerName, email, phone: details.phone || "" },
    email,
    deliveryAddress: {
      address: details.address || "",
      city: details.city || "",
      state: details.state || "",
    },
    notes:
      typeof details.notes === "string" ? details.notes.slice(0, 1000) : "",
    orderNumber: createOrderNumber(),
    subtotal: checkout.subtotal,
    total: checkout.total,
    deliveryFee: checkout.deliveryFee,
    payment: paidWithLoyalty ? "Paid" : "Pending",
    paymentStatus: paidWithLoyalty ? "Paid" : "Pending",
    paymentMethod: paidWithLoyalty ? "Loyalty Points" : undefined,
    paidAt: paidWithLoyalty ? new Date().toISOString() : undefined,
    receiptNumber: paidWithLoyalty ? generateReceiptNumber() : undefined,
    status: paidWithLoyalty ? "Processing" : "Pending",
    date: new Date().toISOString(),
  });
  await sendOrderEmails(order.payload);
  if (paidWithLoyalty) {
    try {
      await sendPaymentReceiptEmail({
        ...order.payload,
        id: order.id,
      });
      order.payload = {
        ...order.payload,
        receiptSentAt: new Date().toISOString(),
      };
      await order.save();
    } catch (error) {
      console.error("Payment receipt email could not be sent:", error.message);
    }
    await User.updateOne({ _id: user._id }, { $set: { cart: [] } });
  }
  return res.status(201).json({ status: "success", data: presentOrder(order) });
});

router.get("/orders/my-orders", auth, async (req, res) => {
  const orders = await AdminRecord.find({
    resource: "order",
    createdBy: req.user._id,
  }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json({ status: "success", data: orders.map(presentOrder) });
});
router.post("/tailoring-requests", auth, checkoutLimiter, async (req, res) => {
  const body = req.body ?? {};
  const profile = tailoringProfiles[body.garmentType];
  if (
    !profile ||
    typeof body.style !== "string" ||
    !body.style.trim() ||
    body.style.trim().length > 500 ||
    !["cm", "in"].includes(body.measurementUnit) ||
    !body.measurements ||
    typeof body.measurements !== "object" ||
    Array.isArray(body.measurements)
  ) {
    return res.status(400).json({
      status: "failed",
      message: "Choose a garment, describe the style, and provide measurements.",
    });
  }
  const measurements = {};
  for (const field of profile) {
    const raw = body.measurements[field];
    const value = Number(raw);
    if (
      raw === undefined ||
      raw === null ||
      (typeof raw !== "number" && typeof raw !== "string") ||
      (typeof raw === "string" && !raw.trim()) ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 400 ||
      (field !== "ageYears" && value === 0) ||
      (field === "ageYears" && (!Number.isInteger(value) || value > 18))
    ) {
      return res.status(400).json({
        status: "failed",
        message: `Enter a valid ${field === "ageYears" ? "age (0–18 years)" : `${field} measurement`} to continue.`,
      });
    }
    measurements[field] = value;
  }
  const productId = body.productId || "";
  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ status: "failed", message: "Choose an available made-to-measure garment." });
  }
  if (
    (body.productStyle !== undefined && typeof body.productStyle !== "string") ||
    (body.color !== undefined && typeof body.color !== "string") ||
    (typeof body.color === "string" && body.color.length > 60)
  ) {
    return res.status(400).json({ status: "failed", message: "Invalid garment color or style selection." });
  }
  let garment = null;
  if (productId) {
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ status: "failed", message: "Invalid garment selection." });
    }
    garment = await Product.findOne({ _id: productId, status: "Active", madeToMeasure: true }).lean();
    if (!garment) {
      return res.status(404).json({ status: "failed", message: "This garment is not available for made-to-measure orders." });
    }
  }
  const fabricSource = body.fabricSource;
  let fabric = { source: "customer", description: "" };
  if (fabricSource === "catalog") {
    if (!mongoose.isValidObjectId(body.fabricProductId)) {
      return res.status(400).json({ status: "failed", message: "Choose an available catalog fabric." });
    }
    const fabricProduct = await Product.findOne({
      _id: body.fabricProductId,
      status: "Active",
      isFabric: true,
    }).select("name image").lean();
    if (!fabricProduct) {
      return res.status(404).json({ status: "failed", message: "The selected catalog fabric is unavailable." });
    }
    fabric = {
      source: "catalog",
      productId: fabricProduct._id.toString(),
      name: fabricProduct.name,
      image: fabricProduct.image,
    };
  } else if (fabricSource === "customer") {
    const description = typeof body.fabricDescription === "string" ? body.fabricDescription.trim() : "";
    if (!description || description.length > 1000) {
      return res.status(400).json({ status: "failed", message: "Describe the fabric you will provide (up to 1,000 characters)." });
    }
    fabric.description = description;
  } else {
    return res.status(400).json({ status: "failed", message: "Choose catalog fabric or customer-provided fabric." });
  }
  const styleOptions = garment?.styles ?? [];
  if (body.productStyle && !styleOptions.some((style) => style.toLowerCase() === body.productStyle.toLowerCase())) {
    return res.status(400).json({ status: "failed", message: "Choose an available garment style." });
  }
  const colorOptions = garment?.colors ?? [];
  if (
    (colorOptions.length > 0 && !body.color) ||
    (body.color && !colorOptions.some((color) => color.toLowerCase() === body.color.toLowerCase()))
  ) {
    return res.status(400).json({ status: "failed", message: "Choose an available garment color." });
  }
  const request = await AdminRecord.create({
    resource: "tailoring-request",
    createdBy: req.user._id,
    payload: {
      status: "Submitted",
      garmentType: body.garmentType,
      garmentName: garment?.name || tailoringProfiles[body.garmentType].label,
      productId: garment?._id?.toString() || "",
      productStyle: typeof body.productStyle === "string" ? body.productStyle : "",
      color: typeof body.color === "string" ? body.color.trim().slice(0, 60) : "",
      style: body.style.trim(),
      fabric,
      measurementUnit: body.measurementUnit,
      measurements,
      customer: { name: req.user.userName || "", email: req.user.email || "" },
    },
  });
  return res.status(201).json({
    status: "success",
    data: { id: request._id.toString(), ...request.payload },
  });
});
router.get("/tailoring-requests/mine", auth, async (req, res) => {
  const requests = await AdminRecord.find({
    resource: "tailoring-request",
    createdBy: req.user._id,
  }).sort({ createdAt: -1 }).lean();
  return res.status(200).json({
    status: "success",
    data: requests.map((record) => ({ id: record._id.toString(), ...record.payload })),
  });
});
router.post("/tailoring-requests/:id/accept-quote", auth, checkoutLimiter, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ status: "failed", message: "Invalid tailoring request." });
  }
  const address = req.body?.deliveryAddress;
  if (
    !address ||
    typeof address.address !== "string" ||
    !address.address.trim() ||
    address.address.trim().length > 300 ||
    typeof address.city !== "string" ||
    !address.city.trim() ||
    address.city.trim().length > 100 ||
    typeof address.state !== "string" ||
    !address.state.trim() ||
    address.state.trim().length > 100 ||
    typeof address.country !== "string" ||
    !address.country.trim() ||
    address.country.trim().length > 100 ||
    (address.phone !== undefined && (typeof address.phone !== "string" || address.phone.length > 32))
  ) {
    return res.status(400).json({ status: "failed", message: "Enter a complete delivery address before accepting the quote." });
  }
  const request = await AdminRecord.findOneAndUpdate(
    {
      _id: req.params.id,
      resource: "tailoring-request",
      createdBy: req.user._id,
      "payload.status": "Quoted",
      "payload.quote": { $gte: 0.01 },
    },
    { $set: { "payload.status": "Preparing order" } },
    { returnDocument: "after" },
  );
  if (!request) {
    return res.status(409).json({ status: "failed", message: "This request has no active quote to accept." });
  }
  const quote = Number(request.payload.quote);
  let order;
  try {
    order = await AdminRecord.create({
      resource: "order",
      createdBy: req.user._id,
      payload: {
        orderNumber: createOrderNumber(),
        customer: {
          name: req.user.userName || "",
          email: req.user.email || "",
          phone: address.phone || "",
        },
        email: req.user.email || "",
        items: [{
          name: `${request.payload.garmentName} — made to measure`,
          quantity: 1,
          price: quote,
          image: request.payload.fabric?.image || "",
          tailoringRequestId: request._id.toString(),
          garmentType: request.payload.garmentType,
          style: request.payload.style,
          productStyle: request.payload.productStyle,
          color: request.payload.color,
          fabric: request.payload.fabric,
          measurementUnit: request.payload.measurementUnit,
          measurements: request.payload.measurements,
        }],
        subtotal: quote,
        total: quote,
        deliveryFee: 0,
        paymentStatus: "Pending",
        payment: "Pending",
        status: "Pending",
        paymentMethod: "",
        deliveryAddress: {
          address: address.address.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          country: address.country.trim(),
          phone: address.phone || "",
        },
        inventoryReserved: false,
        tailoringRequestId: request._id.toString(),
        date: new Date().toISOString(),
      },
    });
    const updatedRequest = await AdminRecord.updateOne(
      { _id: request._id, resource: "tailoring-request", "payload.status": "Preparing order" },
      { $set: { "payload.orderId": order._id.toString(), "payload.status": "Order created" } },
    );
    if (updatedRequest.modifiedCount !== 1) {
      throw new Error("The tailoring request changed while preparing the order.");
    }
    await sendOrderEmails(order.payload);
    return res.status(201).json({ status: "success", data: presentOrder(order) });
  } catch (error) {
    if (order) {
      await AdminRecord.deleteOne({
        _id: order._id,
        resource: "order",
        createdBy: req.user._id,
      });
    }
    await AdminRecord.updateOne(
      { _id: request._id, resource: "tailoring-request", "payload.status": "Preparing order" },
      { $set: { "payload.status": "Quoted" } },
    );
    throw error;
  }
});
router.get("/orders/my-orders/:id", auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid order id" });
  }
  const order = await AdminRecord.findOne(
    ownedOrder(req.params.id, req.user._id),
  );
  if (!order)
    return res
      .status(404)
      .json({ status: "failed", message: "Order not found" });
  return res.status(200).json({ status: "success", data: presentOrder(order) });
});
router.post("/orders", auth, checkoutLimiter, async (req, res) => {
  const user = await User.findById(req.user._id);
  const submittedItems = req.body?.items;
  const useSubmittedItems = Array.isArray(submittedItems);
  if (!useSubmittedItems && !user?.cart.length) {
    return res
      .status(400)
      .json({ status: "failed", message: "Your cart is empty" });
  }
  const checkout = useSubmittedItems
    ? await getCheckoutFromItems(
        submittedItems,
        user.loyaltyBalanceKobo,
        req.body?.redeemLoyalty === true,
      )
    : await getCheckout(user, req.body?.redeemLoyalty === true);
  if (!useSubmittedItems && checkout.items.length !== user.cart.length) {
    return res
      .status(409)
      .json({
        status: "failed",
        message: "One or more cart products are unavailable",
      });
  }
  const paidWithLoyalty =
    checkout.total === 0 && checkout.loyaltyPointsRedeemedKobo > 0;
  const order = await createReservedOrder(user, checkout, {
    customer: user.userName,
    email: user.email,
    orderNumber: createOrderNumber(),
    subtotal: checkout.subtotal,
    total: checkout.total,
    deliveryFee: checkout.deliveryFee,
    payment: paidWithLoyalty ? "Paid" : "Pending",
    paymentStatus: paidWithLoyalty ? "Paid" : "Pending",
    paymentMethod: paidWithLoyalty ? "Loyalty Points" : undefined,
    paidAt: paidWithLoyalty ? new Date().toISOString() : undefined,
    receiptNumber: paidWithLoyalty ? generateReceiptNumber() : undefined,
    status: paidWithLoyalty ? "Processing" : "Pending",
    date: new Date().toISOString(),
  });
  await sendOrderEmails(order.payload);
  if (paidWithLoyalty) {
    try {
      await sendPaymentReceiptEmail({
        ...order.payload,
        id: order.id,
      });
      order.payload = {
        ...order.payload,
        receiptSentAt: new Date().toISOString(),
      };
      await order.save();
    } catch (error) {
      console.error("Payment receipt email could not be sent:", error.message);
    }
    await User.updateOne({ _id: user._id }, { $set: { cart: [] } });
  }
  return res.status(201).json({ status: "success", data: presentOrder(order) });
});
router.post("/orders/:id/cancel", auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid order id" });
  }
  const order = await AdminRecord.findOne(
    ownedOrder(req.params.id, req.user._id),
  );
  if (!order)
    return res
      .status(404)
      .json({ status: "failed", message: "Order not found" });
  if (
    order.payload.status !== "Pending" ||
    order.payload.paymentStatus === "Paid" ||
    order.payload.paymentReference
  ) {
    return res
      .status(409)
      .json({
        status: "failed",
        message: "Only pending orders can be cancelled",
      });
  }
  const cancelled = await AdminRecord.findOneAndUpdate(
    {
      _id: order._id,
      resource: "order",
      "payload.status": "Pending",
      "payload.paymentStatus": { $ne: "Paid" },
      "payload.paymentReference": { $exists: false },
    },
    {
      $set: {
        "payload.status": "Cancelled",
        "payload.inventoryReserved": false,
      },
    },
    { returnDocument: "after" },
  );
  if (!cancelled)
    return res
      .status(409)
      .json({
        status: "failed",
        message: "This order can no longer be cancelled",
      });
  if (order.payload.inventoryReserved)
    await releaseInventory(order.payload.items);
  await restoreLoyaltyRedemption(cancelled);
  order.payload = cancelled.payload;
  return res.status(200).json({ status: "success", data: presentOrder(order) });
});
router.get("/orders/:id/track", auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid order id" });
  }
  const order = await AdminRecord.findOne(
    ownedOrder(req.params.id, req.user._id),
  ).select("payload.status payload.date");
  if (!order)
    return res
      .status(404)
      .json({ status: "failed", message: "Order not found" });
  return res
    .status(200)
    .json({
      status: "success",
      data: { id: order._id.toString(), ...order.payload },
    });
});
router.get("/orders", auth, admin, async (_req, res) => {
  const orders = await AdminRecord.find({ resource: "order" }).sort({
    createdAt: -1,
  });
  return res
    .status(200)
    .json({ status: "success", data: orders.map(presentOrder) });
});
router.get("/orders/:id", auth, admin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid order id" });
  }
  const order = await AdminRecord.findOne({
    _id: req.params.id,
    resource: "order",
  });
  if (!order)
    return res
      .status(404)
      .json({ status: "failed", message: "Order not found" });
  return res.status(200).json({ status: "success", data: presentOrder(order) });
});
router.post("/orders/:id/status", auth, admin, async (req, res) => {
  if (
    !mongoose.isValidObjectId(req.params.id) ||
    !["Pending", "Processing", "Delivered", "Cancelled"].includes(
      req.body?.status,
    )
  ) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid order status" });
  }
  const current = await AdminRecord.findOne({
    _id: req.params.id,
    resource: "order",
  });
  if (!current)
    return res
      .status(404)
      .json({ status: "failed", message: "Order not found" });
  if (
    req.body.status === "Cancelled" &&
    current.payload.paymentStatus === "Paid"
  ) {
    return res
      .status(409)
      .json({
        status: "failed",
        message: "Paid orders require a refund before cancellation",
      });
  }
  const order = await AdminRecord.findOneAndUpdate(
    {
      _id: req.params.id,
      resource: "order",
      ...(req.body.status === "Cancelled" && {
        "payload.paymentStatus": { $ne: "Paid" },
      }),
    },
    {
      $set: {
        "payload.status": req.body.status,
        ...(req.body.status === "Cancelled" && {
          "payload.inventoryReserved": false,
        }),
      },
    },
    { returnDocument: "after" },
  );
  if (!order)
    return res
      .status(409)
      .json({ status: "failed", message: "Order could not be updated" });
  if (req.body.status === "Cancelled" && current.payload.inventoryReserved)
    await releaseInventory(current.payload.items);
  if (req.body.status === "Cancelled")
    await restoreLoyaltyRedemption(order);
  return res.status(200).json({ status: "success", data: presentOrder(order) });
});

router.get("/customers/profile", auth, async (req, res) =>
  res.status(200).json({ status: "success", data: req.user }),
);
router.put("/customers/profile", auth, async (req, res) => {
  const { userName, image, phone } = req.body ?? {};
  if (
    (userName !== undefined &&
      (typeof userName !== "string" || userName.length > 100)) ||
    (image !== undefined &&
      (typeof image !== "string" || image.length > 2048)) ||
    (phone !== undefined && (typeof phone !== "string" || phone.length > 32))
  ) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid profile data" });
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...(userName !== undefined && { userName }),
        ...(image !== undefined && { image }),
        ...(phone !== undefined && { phone }),
      },
    },
    { returnDocument: "after", runValidators: true },
  ).select(
    "-password -verificationToken -passwordResetToken -passwordResetExpires",
  );
  return res.status(200).json({ status: "success", data: user });
});
router.get("/customers/orders", auth, async (req, res) => {
  const orders = await AdminRecord.find({
    resource: "order",
    createdBy: req.user._id,
  }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json({ status: "success", data: orders.map(presentOrder) });
});
router.get("/customers/orders/:orderId", auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.orderId)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid order id" });
  }
  const order = await AdminRecord.findOne(
    ownedOrder(req.params.orderId, req.user._id),
  );
  if (!order)
    return res
      .status(404)
      .json({ status: "failed", message: "Order not found" });
  return res.status(200).json({ status: "success", data: presentOrder(order) });
});
router.get("/customers/addresses", auth, async (req, res) =>
  res.status(200).json({ status: "success", data: req.user.addresses ?? [] }),
);
router.put("/customers/addresses", auth, async (req, res) => {
  const { label, address, city, state, postalCode, country } = req.body ?? {};
  const values = { label, address, city, state, postalCode, country };
  if (
    typeof address !== "string" ||
    !address.trim() ||
    Object.values(values).some(
      (value) =>
        value !== undefined &&
        (typeof value !== "string" || value.length > 500),
    )
  ) {
    return res
      .status(400)
      .json({
        status: "failed",
        message: "A valid delivery address is required",
      });
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { addresses: values } },
    { returnDocument: "after", runValidators: true },
  );
  return res.status(200).json({ status: "success", data: user.addresses });
});
router.delete("/customers/addresses/:addressId", auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.addressId)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid address id" });
  }
  await User.updateOne(
    { _id: req.user._id },
    { $pull: { addresses: { _id: req.params.addressId } } },
  );
  return res
    .status(200)
    .json({ status: "success", message: "Address deleted" });
});
router.delete("/customers/account", auth, async (req, res) => {
  await User.deleteOne({ _id: req.user._id, role: "user" });
  res.clearCookie("accessToken", {
    path: "/api/v1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.clearCookie("refreshToken", {
    path: "/api/v1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res
    .status(200)
    .json({ status: "success", message: "Account deleted" });
});

const getBankDetails = () => ({
  accountName: process.env.BANK_ACCOUNT_NAME || "Niceman Agro and Farm",
  bankName: process.env.BANK_NAME || "Wema Bank",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || "0125362805",
});

router.post(
  "/payments/bank-transfer/reference",
  auth,
  checkoutLimiter,
  async (req, res) => {
    const orderId = req.body?.orderId;
    if (!mongoose.isValidObjectId(orderId))
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid order" });
    const order = await AdminRecord.findOne(ownedOrder(orderId, req.user._id));
    if (!order)
      return res
        .status(404)
        .json({ status: "failed", message: "Order not found" });
    if (
      order.payload.paymentStatus === "Paid" ||
      order.payload.status === "Cancelled" ||
      !order.payload.inventoryReserved ||
      (order.payload.paymentMethod &&
        order.payload.paymentMethod !== "Bank Transfer")
    ) {
      return res
        .status(409)
        .json({
          status: "failed",
          message: "This order is no longer available for payment",
        });
    }
    let updatedOrder = await AdminRecord.findOneAndUpdate(
      {
        _id: order._id,
        resource: "order",
        "payload.paymentStatus": "Pending",
        "payload.status": { $ne: "Cancelled" },
        "payload.inventoryReserved": true,
        ...(!order.payload.paymentReference && {
          "payload.paymentReference": { $exists: false },
        }),
      },
      {
        $set: {
          ...(!order.payload.paymentReference && {
            "payload.paymentReference": `BT-${crypto.randomUUID()}`,
          }),
          "payload.paymentMethod": "Bank Transfer",
          "payload.reservationExpiresAt": new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ),
        },
      },
      { returnDocument: "after" },
    );
    if (!updatedOrder && !order.payload.paymentReference) {
      updatedOrder = await AdminRecord.findOne({
        ...ownedOrder(order.id, req.user._id),
        "payload.paymentStatus": "Pending",
        "payload.status": { $ne: "Cancelled" },
        "payload.inventoryReserved": true,
        "payload.paymentReference": { $exists: true },
      });
    }
    if (!updatedOrder?.payload.paymentReference) {
      return res
        .status(409)
        .json({
          status: "failed",
          message: "This order is no longer available for bank transfer",
        });
    }
    const paymentReference = updatedOrder.payload.paymentReference;
    const bankDetails = getBankDetails();
    return res.status(200).json({
      status: "success",
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.payload.orderNumber,
        paymentReference,
        total: updatedOrder.payload.total,
        deliveryFee: updatedOrder.payload.deliveryFee,
        bankDetails,
        customerName:
          updatedOrder.payload.customer?.name || updatedOrder.payload.customer,
        customerEmail: updatedOrder.payload.email,
      },
    });
  },
);

router.post(
  "/orders/:id/payment-submitted",
  auth,
  checkoutLimiter,
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid order id" });
    }
    const order = await AdminRecord.findOne(
      ownedOrder(req.params.id, req.user._id),
    );
    if (!order) {
      return res
        .status(404)
        .json({ status: "failed", message: "Order not found" });
    }
    if (
      order.payload.paymentMethod !== "Bank Transfer" ||
      !order.payload.paymentReference ||
      order.payload.paymentStatus === "Paid" ||
      order.payload.status === "Cancelled" ||
      !order.payload.inventoryReserved
    ) {
      return res.status(409).json({
        status: "failed",
        message: "This order is not awaiting a bank transfer payment",
      });
    }
    const updatedOrder = await AdminRecord.findOneAndUpdate(
      {
        ...ownedOrder(order.id, req.user._id),
        "payload.paymentMethod": "Bank Transfer",
        "payload.paymentReference": { $exists: true },
        "payload.paymentStatus": "Pending",
        "payload.status": { $ne: "Cancelled" },
        "payload.inventoryReserved": true,
        "payload.paymentSubmittedAt": { $exists: false },
      },
      { $set: { "payload.paymentSubmittedAt": new Date().toISOString() } },
      { returnDocument: "after" },
    );
    if (updatedOrder) {
      return res
        .status(200)
        .json({ status: "success", data: presentOrder(updatedOrder) });
    }
    const latestOrder = await AdminRecord.findOne(
      ownedOrder(order.id, req.user._id),
    );
    if (latestOrder?.payload.paymentSubmittedAt) {
      return res
        .status(200)
        .json({ status: "success", data: presentOrder(latestOrder) });
    }
    return res.status(409).json({
      status: "failed",
      message: "This order is no longer awaiting payment confirmation",
    });
  },
);

router.get("/payments/bank-transfer/details", auth, async (_req, res) => {
  const bankDetails = getBankDetails();
  return res.status(200).json({ status: "success", data: bankDetails });
});

router.post("/orders/:id/confirm-payment", auth, admin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid order id" });
  }
  const { transactionReference } = req.body ?? {};
  const order = await AdminRecord.findOne({
    _id: req.params.id,
    resource: "order",
  });
  if (!order)
    return res
      .status(404)
      .json({ status: "failed", message: "Order not found" });
  if (order.payload.paymentStatus === "Paid") {
    return res
      .status(409)
      .json({
        status: "failed",
        message: "This order is already marked as paid",
      });
  }
  if (order.payload.status === "Cancelled") {
    return res
      .status(409)
      .json({ status: "failed", message: "Cancelled orders cannot be paid" });
  }
  const confirmedOrder = await confirmBankTransferPayment(
    order,
    transactionReference,
    req.user._id,
  );
  if (!confirmedOrder)
    return res
      .status(500)
      .json({ status: "failed", message: "Unable to confirm payment" });
  return res
    .status(200)
    .json({ status: "success", data: presentOrder(confirmedOrder) });
});

router.get("/orders/:id/receipt", auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid order id" });
  }
  const order = await AdminRecord.findOne(
    ownedOrder(req.params.id, req.user._id),
  );
  if (!order)
    return res
      .status(404)
      .json({ status: "failed", message: "Order not found" });
  if (order.payload.paymentStatus !== "Paid") {
    return res
      .status(409)
      .json({
        status: "failed",
        message: "Receipt is only available after payment is confirmed",
      });
  }
  return res.status(200).json({ status: "success", data: presentOrder(order) });
});

router.post("/payments/initialize", auth, checkoutLimiter, async (req, res) => {
  const orderId = req.body?.orderId;
  if (!mongoose.isValidObjectId(orderId))
    return res.status(400).json({ status: "failed", message: "Invalid order" });
  const order = await AdminRecord.findOne(ownedOrder(orderId, req.user._id));
  if (!order)
    return res
      .status(404)
      .json({ status: "failed", message: "Order not found" });
  if (
    order.payload.paymentStatus === "Paid" ||
    order.payload.status === "Cancelled" ||
    (!order.payload.inventoryReserved && !order.payload.tailoringRequestId)
  ) {
    return res
      .status(409)
      .json({
        status: "failed",
        message: "This order is no longer available for payment",
      });
  }
  if (!process.env.CLIENT_URL)
    return res
      .status(503)
      .json({ status: "failed", message: "Client URL is not configured" });
  const reference = `NA-${crypto.randomUUID()}`;
  const callbackState = jwt.sign(
    { purpose: "paystack-callback", orderId: order.id, reference },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
  const claimedOrder = await AdminRecord.findOneAndUpdate(
    {
      _id: order._id,
      resource: "order",
      "payload.status": "Pending",
      "payload.paymentStatus": { $ne: "Paid" },
      $or: [
        { "payload.inventoryReserved": true },
        { "payload.tailoringRequestId": { $exists: true } },
      ],
      "payload.paymentReference": { $exists: false },
    },
    {
      $set: {
        "payload.paymentReference": reference,
        "payload.paymentMethod": "Paystack",
        "payload.reservationExpiresAt": new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ),
      },
    },
    { returnDocument: "after" },
  );
  if (!claimedOrder)
    return res
      .status(409)
      .json({
        status: "failed",
        message: "This order is no longer available for payment",
      });
  let transaction;
  try {
    transaction = await initializePaystackTransaction(
      claimedOrder.payload.email,
      Math.round(Number(claimedOrder.payload.total) * 100),
      reference,
      `${process.env.CLIENT_URL.replace(/\/$/, "")}/payment/success?state=${encodeURIComponent(callbackState)}`,
      { order_id: claimedOrder.id, user_id: req.user._id.toString() },
    );
  } catch (error) {
    await AdminRecord.updateOne(
      {
        _id: claimedOrder._id,
        "payload.paymentReference": reference,
        "payload.paymentStatus": { $ne: "Paid" },
      },
      {
        $unset: { "payload.paymentReference": "", "payload.paymentMethod": "" },
      },
    );
    throw error;
  }
  return res
    .status(200)
    .json({
      status: "success",
      data: { authorizationUrl: transaction.authorization_url, reference },
    });
});

router.get("/payments/verify/:reference", async (req, res) => {
  if (
    typeof req.params.reference !== "string" ||
    req.params.reference.length > 100
  )
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid payment reference" });
  let callback;
  try {
    callback = jwt.verify(req.query.state, process.env.JWT_SECRET);
  } catch {
    return res
      .status(401)
      .json({
        status: "failed",
        message: "Invalid or expired payment confirmation",
      });
  }
  if (
    callback.purpose !== "paystack-callback" ||
    callback.reference !== req.params.reference ||
    !mongoose.isValidObjectId(callback.orderId)
  ) {
    return res
      .status(401)
      .json({ status: "failed", message: "Invalid payment confirmation" });
  }
  const order = await AdminRecord.findOne({
    _id: callback.orderId,
    resource: "order",
    "payload.paymentReference": req.params.reference,
  });
  if (!order)
    return res
      .status(404)
      .json({ status: "failed", message: "Payment not found" });
  const transaction = await verifyPaystackTransaction(req.params.reference);
  const paidOrder = await markOrderPaid(transaction);
  if (!paidOrder || paidOrder.id !== callback.orderId) {
    return res
      .status(402)
      .json({ status: "failed", message: "Payment has not been confirmed" });
  }
  return res
    .status(200)
    .json({ status: "success", data: presentOrder(paidOrder) });
});

router.post("/payments/webhook", async (req, res) => {
  if (!isValidPaystackSignature(req.rawBody, req.get("x-paystack-signature"))) {
    return res
      .status(401)
      .json({ status: "failed", message: "Invalid webhook signature" });
  }
  const event = req.body;
  if (event?.event !== "charge.success" || !event?.data?.reference)
    return res.sendStatus(200);
  const transaction = await verifyPaystackTransaction(event.data.reference);
  await markOrderPaid(transaction);
  return res.sendStatus(200);
});
router.get("/payments/:paymentId", auth, async (_req, res) =>
  res
    .status(501)
    .json({ status: "failed", message: "Payment lookup is not supported" }),
);
router.post("/payments/:paymentId/cancel", auth, async (_req, res) =>
  res
    .status(501)
    .json({
      status: "failed",
      message: "Payment cancellation is not supported",
    }),
);
router.post("/payments/cancel", auth, async (_req, res) =>
  res
    .status(501)
    .json({
      status: "failed",
      message: "Payment cancellation is not supported",
    }),
);
router.get("/payments/my-payments", auth, async (_req, res) =>
  res
    .status(501)
    .json({ status: "failed", message: "Payment history is not supported" }),
);
router.get("/payments", auth, admin, async (_req, res) =>
  res
    .status(501)
    .json({ status: "failed", message: "Payment listing is not supported" }),
);

export default router;
