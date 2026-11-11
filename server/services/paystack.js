import crypto from "node:crypto";
import { AdminRecord } from "../models/AdminRecord.js";
import { User } from "../models/userSchema.js";
import { Product } from "../models/Product.js";
import { sendPaymentReceiptEmail } from "../config/email.js";

const paystackRequest = async (path, options = {}) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not configured");
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.status) {
    throw new Error(result.message || "Paystack request failed");
  }
  return result.data;
};

export const initializePaystackTransaction = (
  email,
  amount,
  reference,
  callbackUrl,
  metadata,
) =>
  paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email,
      amount,
      currency: "NGN",
      reference,
      callback_url: callbackUrl,
      metadata,
    }),
  });

export const verifyPaystackTransaction = (reference) =>
  paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);

export const isValidPaystackSignature = (rawBody, signature) => {
  if (
    !rawBody ||
    typeof signature !== "string" ||
    !process.env.PAYSTACK_SECRET_KEY
  )
    return false;
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest();
  let received;
  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

// Conditional decrements prevent concurrent orders from reserving the same units.
export const reserveInventory = async (items) => {
  const reserved = [];
  for (const item of items) {
    const product = await Product.findOne({
      _id: item.product,
      status: "Active",
    }).lean();

    if (!product) {
      await releaseInventory(reserved);
      return false;
    }

    const quantity = Number(item.quantity) || 0;
    const currentStock = Number(product.stock) || 0;
    const deducted = Math.min(quantity, currentStock);
    const nextStock = Math.max(0, currentStock - quantity);

    item.stockDeducted = deducted;

    const result = await Product.updateOne(
      {
        _id: item.product,
        status: "Active",
      },
      { $set: { stock: nextStock } },
    );

    if (result.matchedCount !== 1) {
      await releaseInventory(reserved);
      return false;
    }

    reserved.push(item);
  }
  return true;
};

export const releaseInventory = async (items) => {
  await Promise.all(
    (items ?? []).map((item) => {
      const restoreAmount = Number(item?.stockDeducted) || 0;
      if (restoreAmount <= 0) return null;

      return Product.updateOne(
        { _id: item.product },
        { $inc: { stock: restoreAmount } },
      );
    }),
  );
};

export const releaseExpiredReservations = async () => {
  const now = new Date();
  let released = 0;
  while (true) {
    const order = await AdminRecord.findOneAndUpdate(
      {
        resource: "order",
        $or: [
          { "payload.inventoryReserved": true },
          { "payload.tailoringRequestId": { $exists: true } },
        ],
        "payload.reservationExpiresAt": { $lte: now },
        "payload.paymentStatus": { $ne: "Paid" },
      },
      {
        $set: {
          "payload.inventoryReserved": false,
          "payload.paymentStatus": "Expired",
          "payload.status": "Cancelled",
        },
      },
      { returnDocument: "after" },
    );
    if (!order) break;
    await releaseInventory(order.payload.items);
    await restoreLoyaltyRedemption(order);
    released += 1;
  }
  return released;
};

export const restoreLoyaltyRedemption = async (order) => {
  const amountKobo = Number(order?.payload?.loyaltyPointsRedeemedKobo) || 0;
  if (!order || amountKobo <= 0 || order.payload.loyaltyPointsRestoredAt) {
    return;
  }

  const claimed = await AdminRecord.findOneAndUpdate(
    {
      _id: order._id,
      resource: "order",
      "payload.status": "Cancelled",
      "payload.loyaltyPointsRedeemedKobo": amountKobo,
      "payload.loyaltyPointsRestoredAt": { $exists: false },
    },
    {
      $set: { "payload.loyaltyPointsRestoredAt": new Date().toISOString() },
    },
    { returnDocument: "after" },
  );
  if (!claimed) return;

  try {
    const result = await User.updateOne(
      { _id: claimed.createdBy },
      { $inc: { loyaltyBalanceKobo: amountKobo } },
    );
    if (result.matchedCount !== 1) {
      throw new Error("Customer account for loyalty refund was not found");
    }
  } catch (error) {
    await AdminRecord.updateOne(
      { _id: claimed._id },
      { $unset: { "payload.loyaltyPointsRestoredAt": "" } },
    );
    throw error;
  }
};

const awardLoyaltyForPaidOrder = async (order) => {
  const claimingOrder = await AdminRecord.findOneAndUpdate(
    {
      _id: order._id,
      resource: "order",
      "payload.paymentStatus": "Paid",
      "payload.loyaltyAwardStatus": "Pending",
    },
    {
      $set: { "payload.loyaltyAwardStatus": "Processing" },
    },
    { returnDocument: "after" },
  );
  if (!claimingOrder) return order;

  const pointsKobo = Math.round(
    (Number(claimingOrder.payload.total) || 0) * 100 * 0.01,
  );
  try {
    if (pointsKobo > 0) {
      const result = await User.updateOne(
        { _id: claimingOrder.createdBy },
        { $inc: { loyaltyBalanceKobo: pointsKobo } },
      );
      if (result.matchedCount !== 1) {
        throw new Error("Customer account for loyalty award was not found");
      }
    }
    const awardedOrder = await AdminRecord.findOneAndUpdate(
      {
        _id: claimingOrder._id,
        resource: "order",
        "payload.loyaltyAwardStatus": "Processing",
      },
      {
        $set: {
          "payload.loyaltyPointsEarnedKobo": pointsKobo,
          "payload.loyaltyAwardedAt": new Date().toISOString(),
          "payload.loyaltyAwardStatus": "Awarded",
        },
      },
      { returnDocument: "after" },
    );
    return awardedOrder || claimingOrder;
  } catch (error) {
    await AdminRecord.updateOne(
      {
        _id: claimingOrder._id,
        "payload.loyaltyAwardStatus": "Processing",
      },
      { $set: { "payload.loyaltyAwardStatus": "Pending" } },
    );
    throw error;
  }
};

export const generateReceiptNumber = (orderDate) => {
  const date = orderDate ? new Date(orderDate) : new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const seq = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `RCP-${yy}${mm}${dd}-${seq}`;
};

export const markOrderPaid = async (transaction) => {
  if (
    !transaction ||
    transaction.status !== "success" ||
    transaction.currency !== "NGN"
  )
    return null;
  let order = await AdminRecord.findOne({
    resource: "order",
    "payload.paymentReference": transaction.reference,
  });
  if (
    !order ||
    Number(transaction.amount) !== Math.round(Number(order.payload.total) * 100)
  )
    return null;

  if (order.payload.paymentStatus !== "Paid") {
    // Atomically claim the reservation so callbacks and webhooks cannot sell twice.
    order = await AdminRecord.findOneAndUpdate(
      {
        _id: order._id,
        resource: "order",
        "payload.paymentReference": transaction.reference,
        "payload.paymentStatus": { $ne: "Paid" },
        "payload.status": { $ne: "Cancelled" },
        $or: [
          { "payload.inventoryReserved": true },
          { "payload.tailoringRequestId": { $exists: true } },
        ],
      },
      {
        $set: {
          "payload.payment": "Paid",
          "payload.paymentStatus": "Paid",
          "payload.paymentMethod": order.payload.paymentMethod || "Paystack",
          "payload.status": "Processing",
          "payload.paidAt": transaction.paid_at || new Date().toISOString(),
          "payload.paystackTransactionId": String(transaction.id),
          "payload.receiptNumber": generateReceiptNumber(),
          "payload.inventoryReserved": false,
          "payload.loyaltyAwardStatus": "Pending",
        },
      },
      { returnDocument: "after" },
    );
    if (!order) return null;
    await User.updateOne({ _id: order.createdBy }, { $set: { cart: [] } });
  }

  if (order.payload.loyaltyAwardStatus === "Pending") {
    order = await awardLoyaltyForPaidOrder(order);
  }

  if (!order.payload.receiptSentAt) {
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
  }
  return order;
};

export const confirmBankTransferPayment = async (
  order,
  transactionReference,
  adminUserId,
) => {
  if (!order || order.resource !== "order") return null;

  if (order.payload.paymentStatus === "Paid") {
    return order.payload.loyaltyAwardStatus === "Pending"
      ? awardLoyaltyForPaidOrder(order)
      : order;
  }

  const confirmedOrder = await AdminRecord.findOneAndUpdate(
    {
      _id: order._id,
      resource: "order",
      "payload.paymentStatus": { $ne: "Paid" },
      "payload.status": { $ne: "Cancelled" },
      ...(order.payload.inventoryReserved
        ? { "payload.inventoryReserved": true }
        : {}),
    },
    {
      $set: {
        "payload.payment": "Paid",
        "payload.paymentStatus": "Paid",
        "payload.paymentMethod": "Bank Transfer",
        "payload.status": "Processing",
        "payload.paidAt": new Date().toISOString(),
        "payload.transactionReference":
          typeof transactionReference === "string" &&
          transactionReference.trim()
            ? transactionReference.trim().slice(0, 200)
            : "",
        "payload.paymentConfirmedBy": adminUserId?.toString() ?? "",
        "payload.paymentConfirmationDate": new Date().toISOString(),
        "payload.receiptNumber": generateReceiptNumber(),
        "payload.inventoryReserved": false,
        "payload.loyaltyAwardStatus": "Pending",
      },
    },
    { returnDocument: "after" },
  );

  if (!confirmedOrder) return null;

  await User.updateOne(
    { _id: confirmedOrder.createdBy },
    { $set: { cart: [] } },
  );
  const orderWithLoyalty = await awardLoyaltyForPaidOrder(confirmedOrder);

  if (!orderWithLoyalty.payload.receiptSentAt) {
    try {
      await sendPaymentReceiptEmail({
        ...orderWithLoyalty.payload,
        id: orderWithLoyalty.id,
      });
      orderWithLoyalty.payload = {
        ...orderWithLoyalty.payload,
        receiptSentAt: new Date().toISOString(),
      };
      await orderWithLoyalty.save();
    } catch (error) {
      console.error("Payment receipt email could not be sent:", error.message);
    }
  }

  return orderWithLoyalty;
};
