import mongoose from "mongoose";
import { AdminRecord } from "../models/AdminRecord.js";
import { Product } from "../models/Product.js";
import { User } from "../models/userSchema.js";
import { releaseInventory } from "../services/paystack.js";

const fields = {
  category: ["name", "description", "image", "status", "products", "slug"],
  order: [
    "customer",
    "email",
    "items",
    "total",
    "payment",
    "paymentMethod",
    "paymentStatus",
    "deliveryFee",
    "status",
    "date",
    "address",
  ],
  review: [
    "type",
    "product",
    "customer",
    "location",
    "email",
    "rating",
    "comment",
    "review",
    "status",
    "date",
  ],
  promotion: [
    "name",
    "title",
    "description",
    "code",
    "type",
    "value",
    "discount",
    "usage",
    "startDate",
    "endDate",
    "status",
  ],
  article: [
    "title",
    "category",
    "author",
    "excerpt",
    "content",
    "image",
    "status",
    "featuredOnHomepage",
    "date",
  ],
  "tailoring-request": ["status", "quote", "tailorNotes"],
};

const slugifyCategory = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "category";

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isCloudinaryImageUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      /^\/[^/]+\/image\/upload\//.test(url.pathname)
    );
  } catch {
    return false;
  }
};

export const hasUnuploadedAdminImage = (
  value,
  previousValue = null,
  allowWebsiteDefaults = false,
) => {
  if (!value || typeof value !== "object") return false;

  return Object.entries(value).some(([key, child]) => {
    const previousChild = previousValue?.[key];
    if (key.toLowerCase().includes("image")) {
      if (child === "" || child === undefined || child === null) return false;
      return (
        !isCloudinaryImageUrl(child) &&
        child !== previousChild &&
        !(
          allowWebsiteDefaults &&
          previousValue == null &&
          ["hero-bg.jpg", "about.jpg", "1.png", "2.png"].some(
            (name) => typeof child === "string" && child === `/images/${name}`,
          )
        )
      );
    }
    return child && typeof child === "object"
      ? hasUnuploadedAdminImage(child, previousChild, allowWebsiteDefaults)
      : false;
  });
};

const normalizeCategoryPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  const categoryName =
    typeof payload.name === "string" ? payload.name.trim() : "";
  const categorySlug =
    typeof payload.slug === "string" ? payload.slug.trim() : "";

  if (categoryName) {
    payload.name = categoryName;
  }
  payload.slug = slugifyCategory(
    categorySlug || categoryName || payload.slug || "",
  );

  if (typeof payload.description === "string") {
    payload.description = payload.description.trim();
  }
  if (typeof payload.image === "string") {
    payload.image = payload.image.trim();
  }
  return payload;
};

const categoryConflict = async (payload, excludeId = null) => {
  if (!payload || typeof payload !== "object") return null;
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const slug = typeof payload.slug === "string" ? payload.slug.trim() : "";
  if (!name && !slug) return null;

  const query = {
    resource: "category",
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    $or: [],
  };

  if (name) {
    query.$or.push({
      "payload.name": { $regex: `^${escapeRegExp(name)}$`, $options: "i" },
    });
  }
  if (slug) {
    query.$or.push({ "payload.slug": slug });
  }

  return query.$or.length ? AdminRecord.findOne(query).lean() : null;
};

const inputPayload = (
  resource,
  value,
  partial = false,
  existingPayload = null,
) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  if (resource === "website-content") {
    const serialized = JSON.stringify(value);
    return serialized.length <= 20000 &&
      hasSafeKeys(value) &&
      !hasUnuploadedAdminImage(value, existingPayload, true)
      ? value
      : null;
  }

  const allowed = fields[resource];
  if (!allowed) return null;

  const payload = Object.fromEntries(
    Object.entries(value).filter(([key]) => allowed.includes(key)),
  );
  if (!Object.keys(payload).length) return null;
  if (!hasSafeKeys(payload)) return null;
  if (resource === "category") normalizeCategoryPayload(payload);
  if (hasUnuploadedAdminImage(payload, existingPayload)) return null;
  if (
    !partial &&
    resource === "category" &&
    (typeof payload.name !== "string" || !payload.name.trim())
  )
    return null;
  if (
    !partial &&
    resource === "article" &&
    (typeof payload.title !== "string" || !payload.title.trim())
  )
    return null;
  const stringLimits = {
    name: 120,
    description: 3000,
    image: 2048,
    status: 32,
    customer: 120,
    email: 254,
    payment: 32,
    date: 64,
    address: 1000,
    product: 120,
    comment: 3000,
    title: 200,
    code: 64,
    startDate: 64,
    endDate: 64,
    category: 80,
    author: 120,
    content: 20000,
    type: 32,
    value: 32,
    usage: 32,
    slug: 120,
    tailorNotes: 3000,
  };
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string" && value.length > (stringLimits[key] ?? 500))
      return null;
  }
  if (
    resource === "tailoring-request" &&
    payload.tailorNotes !== undefined &&
    typeof payload.tailorNotes !== "string"
  )
    return null;
  if (
    payload.image !== undefined &&
    payload.image !== "" &&
    !(payload.image.startsWith("/") && !payload.image.startsWith("//")) &&
    !/^https?:\/\/[^\s]+$/i.test(payload.image)
  )
    return null;
  if (
    resource === "tailoring-request" &&
    payload.status !== undefined &&
    !["Submitted", "Quoted", "Rejected"].includes(payload.status)
  )
    return null;
  if (
    resource === "tailoring-request" &&
    payload.quote !== undefined &&
    (!Number.isFinite(Number(payload.quote)) || Number(payload.quote) < 0.01)
  )
    return null;
  if (resource === "tailoring-request" && payload.quote !== undefined) {
    payload.quote = Math.round(Number(payload.quote) * 100) / 100;
  }
  if (resource === "order" && Array.isArray(payload.items)) {
    if (
      payload.items.length > 100 ||
      !payload.items.every(
        (item) =>
          item &&
          typeof item === "object" &&
          typeof item.name === "string" &&
          Number.isFinite(Number(item.quantity)) &&
          Number(item.quantity) > 0 &&
          Number.isFinite(Number(item.price)) &&
          Number(item.price) >= 0,
      )
    )
      return null;
    payload.items = payload.items.map((item) => ({
      name: item.name.slice(0, 120),
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));
  }
  for (const field of [
    "products",
    "items",
    "total",
    "rating",
    "discount",
    "deliveryFee",
    "value",
    "usage",
  ]) {
    if (field === "items" && Array.isArray(payload.items)) continue;
    if (
      payload[field] !== undefined &&
      (!Number.isFinite(Number(payload[field])) || Number(payload[field]) < 0)
    )
      return null;
    if (payload[field] !== undefined) payload[field] = Number(payload[field]);
  }
  const validStatuses = {
    category: ["Active", "Inactive"],
    order: ["Pending", "Processing", "Delivered", "Cancelled"],
    review: ["Pending", "Approved", "Rejected"],
    promotion: ["Active", "Inactive", "Expired"],
    article: ["Draft", "Published"],
  };
  if (
    payload.status !== undefined &&
    !validStatuses[resource]?.includes(payload.status)
  )
    return null;
  return payload;
};

const hasSafeKeys = (value, depth = 0) => {
  if (depth > 5) return false;
  if (Array.isArray(value))
    return value.every((item) => hasSafeKeys(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.entries(value).every(
      ([key, nested]) =>
        !key.startsWith("$") &&
        !key.includes(".") &&
        !["__proto__", "prototype", "constructor"].includes(key) &&
        hasSafeKeys(nested, depth + 1),
    );
  }
  return typeof value !== "string" || value.length <= 20000;
};

export const validateAdminPayload = inputPayload;

const present = (record) => ({
  ...record.payload,
  ...(record.resource === "promotion" && {
    name: record.payload.name ?? record.payload.title ?? "",
    value: record.payload.value ?? record.payload.discount ?? 0,
  }),
  id: record._id.toString(),
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

export const listAdminRecords = (resource) => async (_req, res) => {
  const records = await AdminRecord.find({ resource }).sort({ createdAt: -1 });

  if (resource === "category") {
    const productCounts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countByCategory = new Map(
      productCounts.map(({ _id, count }) => [_id, count]),
    );
    return res.status(200).json({
      status: "success",
      data: records.map((record) => ({
        ...present(record),
        products: countByCategory.get(record.payload.name) ?? 0,
      })),
    });
  }

  if (resource === "review") {
    // Resolve product names for review payloads to make admin UI friendlier
    const productIds = records
      .map((r) => r.payload?.product)
      .filter((p) => p)
      .map((p) => String(p));
    const uniqueIds = [...new Set(productIds)];
    const products = uniqueIds.length
      ? await Product.find({ _id: { $in: uniqueIds } })
          .select("name")
          .lean()
      : [];
    const productMap = Object.fromEntries(
      products.map((p) => [String(p._id), p.name || ""]),
    );

    const data = records.map((record) => {
      const base = present(record);
      const prodId = record.payload?.product;
      return {
        ...base,
        product: prodId
          ? productMap[String(prodId)] || String(prodId)
          : base.product,
        productId: prodId ? String(prodId) : base.productId,
      };
    });
    return res.status(200).json({ status: "success", data });
  }

  return res
    .status(200)
    .json({ status: "success", data: records.map(present) });
};

export const getAdminRecord = (resource) => async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid record id" });
  }
  const record = await AdminRecord.findOne({ _id: req.params.id, resource });
  if (!record)
    return res
      .status(404)
      .json({ status: "failed", message: "Record not found" });
  // If this is a review, include resolved product name
  if (resource === "review") {
    const base = present(record);
    const prodId = record.payload?.product;
    if (prodId) {
      try {
        const product = await Product.findById(prodId).select("name").lean();
        return res.status(200).json({
          status: "success",
          data: {
            ...base,
            product: product?.name || String(prodId),
            productId: String(prodId),
          },
        });
      } catch (err) {
        return res.status(200).json({ status: "success", data: base });
      }
    }
    return res.status(200).json({ status: "success", data: base });
  }
  return res.status(200).json({ status: "success", data: present(record) });
};

export const createAdminRecord = (resource) => async (req, res) => {
  const payload = inputPayload(resource, req.body, false);
  if (!payload) {
    if (hasUnuploadedAdminImage(req.body)) {
      return res.status(400).json({
        status: "failed",
        message:
          "Upload images through the admin image uploader before saving.",
      });
    }
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid or empty request data" });
  }
  if (resource === "category") {
    const existingCategory = await categoryConflict(payload);
    if (existingCategory) {
      return res.status(409).json({
        status: "failed",
        message: "A category with this name or slug already exists.",
      });
    }
  }
  // Enforce max 3 featured published articles
  if (resource === "article" && payload.featuredOnHomepage === true) {
    // only count already-published featured articles
    if (payload.status === "Published") {
      const count = await AdminRecord.countDocuments({
        resource: "article",
        "payload.status": "Published",
        "payload.featuredOnHomepage": true,
      });
      if (count >= 3) {
        return res.status(409).json({
          status: "failed",
          message:
            "Homepage can display a maximum of three published articles. Deselect another article before featuring this one.",
        });
      }
    }
  }
  const record = await AdminRecord.create({
    resource,
    payload,
    createdBy: req.user._id,
  });
  return res.status(201).json({ status: "success", data: present(record) });
};

export const updateAdminRecord = (resource) => async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid record id" });
  }
  const existing = await AdminRecord.findOne({ _id: req.params.id, resource });
  if (!existing)
    return res
      .status(404)
      .json({ status: "failed", message: "Record not found" });
  const payload = inputPayload(resource, req.body, true, existing.payload);
  if (!payload) {
    if (hasUnuploadedAdminImage(req.body, existing.payload)) {
      return res.status(400).json({
        status: "failed",
        message:
          "Upload images through the admin image uploader before saving.",
      });
    }
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid or empty request data" });
  }
  if (resource === "category") {
    const conflict = await categoryConflict(payload, existing._id);
    if (conflict) {
      return res.status(409).json({
        status: "failed",
        message: "A category with this name or slug already exists.",
      });
    }
  }
  if (
    resource === "order" &&
    payload.status === "Cancelled" &&
    existing.payload.paymentStatus === "Paid"
  ) {
    return res.status(409).json({
      status: "failed",
      message: "Paid orders require a refund before cancellation",
    });
  }
  if (
    resource === "order" &&
    existing.payload.inventoryReserved &&
    payload.items !== undefined
  ) {
    return res.status(409).json({
      status: "failed",
      message: "Reserved order items cannot be edited",
    });
  }
  // Enforce featured-on-homepage constraints for articles on update
  if (resource === "article") {
    // If attempting to set featuredOnHomepage = true on an article that is (or will be) published,
    // ensure there are fewer than 3 other published featured articles.
    const wantsFeatured = payload.featuredOnHomepage === true;
    const willBePublished =
      payload.status === "Published" ||
      (existing.payload.status === "Published" && payload.status === undefined);

    if (wantsFeatured && willBePublished) {
      const count = await AdminRecord.countDocuments({
        resource: "article",
        "payload.status": "Published",
        "payload.featuredOnHomepage": true,
        _id: { $ne: existing._id },
      });
      if (count >= 3) {
        return res.status(409).json({
          status: "failed",
          message:
            "Homepage can display a maximum of three published articles. Deselect another article before featuring this one.",
        });
      }
    }

    // If attempting to publish an article that is featured, ensure limit is preserved
    if (
      payload.status === "Published" &&
      (existing.payload.featuredOnHomepage === true ||
        payload.featuredOnHomepage === true)
    ) {
      const count = await AdminRecord.countDocuments({
        resource: "article",
        "payload.status": "Published",
        "payload.featuredOnHomepage": true,
        _id: { $ne: existing._id },
      });
      if (count >= 3) {
        return res.status(409).json({
          status: "failed",
          message:
            "Publishing this article would exceed the homepage limit of three featured articles. Deselect another featured article first.",
        });
      }
    }
  }
  const updatedPayload = { ...existing.payload, ...payload };
  if (
    resource === "category" &&
    payload.name &&
    payload.name !== existing.payload.name
  ) {
    await Product.updateMany(
      { category: existing.payload.name },
      { $set: { category: payload.name } },
    );
  }
  if (resource === "order" && payload.status === "Cancelled")
    updatedPayload.inventoryReserved = false;
  const filter = { _id: req.params.id, resource };
  if (resource === "order" && payload.status === "Cancelled") {
    filter["payload.paymentStatus"] = { $ne: "Paid" };
    filter["payload.status"] = existing.payload.status;
  }
  const record = await AdminRecord.findOneAndUpdate(
    filter,
    { $set: { payload: updatedPayload } },
    { returnDocument: "after", runValidators: true },
  );
  if (!record)
    return res.status(409).json({
      status: "failed",
      message: "Record changed; reload and try again",
    });
  if (
    resource === "order" &&
    existing.payload.inventoryReserved &&
    payload.status === "Cancelled"
  ) {
    await releaseInventory(existing.payload.items);
  }
  return res.status(200).json({ status: "success", data: present(record) });
};

export const deleteAdminRecord = (resource) => async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid record id" });
  }
  const record = await AdminRecord.findOne({ _id: req.params.id, resource });
  if (!record)
    return res
      .status(404)
      .json({ status: "failed", message: "Record not found" });

  if (resource === "category") {
    const productUsingCategory = await Product.findOne({
      category: {
        $regex: `^${escapeRegExp(record.payload.name ?? "")}$`,
        $options: "i",
      },
    }).lean();
    if (productUsingCategory) {
      return res.status(409).json({
        status: "failed",
        message:
          "Cannot delete this category because it is still assigned to one or more products.",
      });
    }
  }

  const deleted = await AdminRecord.findOneAndDelete({
    _id: req.params.id,
    resource,
  });
  if (!deleted)
    return res
      .status(404)
      .json({ status: "failed", message: "Record not found" });
  if (resource === "order" && record.payload.inventoryReserved) {
    await releaseInventory(record.payload.items);
  }
  return res.status(200).json({ status: "success", message: "Record deleted" });
};

export const listCustomers = async (_req, res) => {
  const customers = await User.find({ role: "user" })
    .select("userName email phone image isVerified isActive createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const data = await Promise.all(
    customers.map(async (user) => {
      const orders = await AdminRecord.find({
        resource: "order",
        $or: [
          { "payload.email": user.email },
          { "payload.customer": user.userName },
          { "payload.customer.name": user.userName },
        ],
      }).lean();
      const totalSpent = orders.reduce(
        (total, order) => total + Number(order.payload?.total ?? 0),
        0,
      );
      return {
        id: user._id.toString(),
        name: user.userName,
        email: user.email,
        phone: user.phone ?? "",
        image: user.image,
        status: user.isActive ? "Active" : "Inactive",
        createdAt: user.createdAt,
        orders: orders.length,
        orderCount: orders.length,
        totalSpent,
      };
    }),
  );

  return res.status(200).json({ status: "success", data });
};

export const getCustomer = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid customer id" });
  }
  const user = await User.findOne({ _id: req.params.id, role: "user" }).select(
    "userName email phone image addresses isVerified isActive createdAt",
  );
  if (!user)
    return res
      .status(404)
      .json({ status: "failed", message: "Customer not found" });
  const orders = await AdminRecord.find({
    resource: "order",
    $or: [
      { "payload.email": user.email },
      { "payload.customer": user.userName },
      { "payload.customer.name": user.userName },
    ],
  }).sort({ createdAt: -1 });
  return res.status(200).json({
    status: "success",
    data: {
      id: user._id.toString(),
      name: user.userName,
      email: user.email,
      phone: user.phone ?? "",
      address: (user.addresses ?? [])
        .map((entry) =>
          [
            entry.address,
            entry.city,
            entry.state,
            entry.postalCode,
            entry.country,
          ]
            .filter(Boolean)
            .join(", "),
        )
        .filter(Boolean)
        .join("; "),
      image: user.image,
      status: user.isActive ? "Active" : "Inactive",
      createdAt: user.createdAt,
      orderCount: orders.length,
      totalSpent: orders.reduce(
        (total, order) => total + Number(order.payload.total ?? 0),
        0,
      ),
      orders: orders.map(present),
    },
  });
};

export const deleteCustomer = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid customer id" });
  }
  const user = await User.findOneAndDelete({
    _id: req.params.id,
    role: "user",
  });
  if (!user)
    return res
      .status(404)
      .json({ status: "failed", message: "Customer not found" });
  return res
    .status(200)
    .json({ status: "success", message: "Customer deleted" });
};

export const updateCustomer = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid customer id" });
  }
  const { userName, image, status } = req.body ?? {};
  if (
    (userName !== undefined && typeof userName !== "string") ||
    (image !== undefined && typeof image !== "string") ||
    (status !== undefined && !["Active", "Inactive"].includes(status))
  ) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid customer data" });
  }
  const update = {
    ...(userName !== undefined && { userName }),
    ...(image !== undefined && { image }),
    ...(status !== undefined && { isActive: status === "Active" }),
  };
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "user" },
    { $set: update },
    { returnDocument: "after", runValidators: true },
  ).select("userName email image isVerified isActive createdAt");
  if (!user)
    return res
      .status(404)
      .json({ status: "failed", message: "Customer not found" });
  return res.status(200).json({
    status: "success",
    data: {
      id: user._id.toString(),
      name: user.userName,
      email: user.email,
      image: user.image,
      status: user.isActive ? "Active" : "Inactive",
      createdAt: user.createdAt,
    },
  });
};
