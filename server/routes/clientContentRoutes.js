import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import auth from "../middlewares/auth.js";
import { AdminRecord } from "../models/AdminRecord.js";
import { validateAdminPayload } from "../controllers/adminResourceController.js";
import { sendContactMessageEmail } from "../config/email.js";

const router = express.Router();
const publicReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 250,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "failed",
    message: "Too many public requests. Please wait a moment and try again.",
  },
});
const reviewWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "failed",
    message:
      "Too many review submissions. Please wait 15 minutes before trying again.",
  },
});
const contactMessageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "failed",
    message: "Too many messages sent. Please wait before trying again.",
  },
});

router.get("/categories", publicReadLimiter, async (_req, res) => {
  const records = await AdminRecord.find({
    resource: "category",
    "payload.status": { $ne: "Inactive" },
  }).sort({ createdAt: -1 });
  return res.status(200).json({
    status: "success",
    data: records.map((record) => ({
      ...record.payload,
      id: record._id.toString(),
    })),
  });
});

router.get("/categories/slug/:slug", publicReadLimiter, async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const records = await AdminRecord.find({
    resource: "category",
    "payload.status": { $ne: "Inactive" },
  });
  const record = records.find(
    (item) =>
      item.payload.slug?.toLowerCase() === slug ||
      item.payload.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") === slug,
  );
  if (!record)
    return res
      .status(404)
      .json({ status: "failed", message: "Category not found" });
  return res.status(200).json({
    status: "success",
    data: { ...record.payload, id: record._id.toString() },
  });
});

router.get("/categories/:id", publicReadLimiter, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid category id" });
  }
  const record = await AdminRecord.findOne({
    _id: req.params.id,
    resource: "category",
    "payload.status": { $ne: "Inactive" },
  });
  if (!record)
    return res
      .status(404)
      .json({ status: "failed", message: "Category not found" });
  return res.status(200).json({
    status: "success",
    data: { ...record.payload, id: record._id.toString() },
  });
});

router.get("/website-content", publicReadLimiter, async (_req, res) => {
  const record = await AdminRecord.findOne({
    resource: "website-content",
  }).sort({ updatedAt: -1 });

  return res.status(200).json({
    status: "success",
    data: record?.payload ?? {},
  });
});

router.post("/contact", contactMessageLimiter, async (req, res) => {
  const body = req.body ?? {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const subject =
    typeof body.subject === "string"
      ? body.subject.trim().replace(/[\r\n]+/g, " ")
      : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (
    !name ||
    name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    phone.length > 40 ||
    !subject ||
    subject.length > 160 ||
    !message ||
    message.length > 5000
  ) {
    return res.status(400).json({
      status: "failed",
      message: "Enter a valid name, email, subject, and message.",
    });
  }

  await sendContactMessageEmail({ name, email, phone, subject, message });
  return res.status(200).json({
    status: "success",
    message: "Your message was sent successfully. We will be in touch soon.",
  });
});

router.get("/blog", publicReadLimiter, async (req, res) => {
  const query = { resource: "article", "payload.status": "Published" };
  if (
    typeof req.query.category === "string" &&
    req.query.category.length <= 80
  ) {
    query["payload.category"] = req.query.category;
  }
  if (req.query.featured === "true") {
    query["payload.featuredOnHomepage"] = true;
  }
  const posts = await AdminRecord.find(query).sort({ createdAt: -1 });
  return res.status(200).json({
    status: "success",
    data: posts.map((post) => ({ ...post.payload, id: post._id.toString() })),
  });
});

router.get("/blog/:id", publicReadLimiter, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid article id" });
  }
  const post = await AdminRecord.findOne({
    _id: req.params.id,
    resource: "article",
    "payload.status": "Published",
  });
  if (!post)
    return res
      .status(404)
      .json({ status: "failed", message: "Article not found" });
  return res.status(200).json({
    status: "success",
    data: { ...post.payload, id: post._id.toString() },
  });
});

router.get("/reviews", publicReadLimiter, async (_req, res) => {
  const reviews = await AdminRecord.find({
    resource: "review",
    "payload.status": "Approved",
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    status: "success",
    data: reviews.map((review) => ({
      ...review.payload,
      id: review._id.toString(),
    })),
  });
});

router.get(
  "/reviews/product/:productId",
  publicReadLimiter,
  async (req, res) => {
    const reviews = await AdminRecord.find({
      resource: "review",
      "payload.product": req.params.productId,
      "payload.type": "product",
      "payload.status": "Approved",
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      status: "success",
      data: reviews.map((review) => ({
        ...review.payload,
        id: review._id.toString(),
      })),
    });
  },
);

router.get("/reviews/my-reviews", auth, publicReadLimiter, async (req, res) => {
  const reviews = await AdminRecord.find({
    resource: "review",
    createdBy: req.user._id,
  }).sort({ createdAt: -1 });
  return res.status(200).json({
    status: "success",
    data: reviews.map((review) => ({
      ...review.payload,
      id: review._id.toString(),
    })),
  });
});

router.post("/reviews", auth, reviewWriteLimiter, async (req, res) => {
  const body = req.body ?? {};
  const type = body.type === "product" ? "product" : "general";
  const cleanedLocation =
    typeof body.location === "string" ? body.location.trim() : "";
  const payload = validateAdminPayload("review", {
    ...body,
    type,
    location: cleanedLocation,
    comment: body.comment ?? body.review ?? "",
    customer: body.customer ?? req.user.userName,
    email: body.email ?? req.user.email,
    status: "Pending",
    date: body.date ?? new Date().toISOString(),
  });

  if (!payload) {
    return res.status(400).json({
      status: "failed",
      message: "Invalid review data",
    });
  }

  if (type === "product") {
    if (
      typeof payload.product !== "string" ||
      !mongoose.isValidObjectId(payload.product) ||
      typeof payload.comment !== "string" ||
      !payload.comment.trim() ||
      !Number.isInteger(payload.rating) ||
      payload.rating < 1 ||
      payload.rating > 5
    ) {
      return res.status(400).json({
        status: "failed",
        message:
          "Product review requires a valid product ID, comment, and rating from 1 to 5",
      });
    }

    const product = await mongoose
      .model("Product")
      .findOne({ _id: payload.product, status: "Active" })
      .select("_id");

    if (!product) {
      return res.status(404).json({
        status: "failed",
        message: "Product not found",
      });
    }
  } else {
    if (
      typeof payload.customer !== "string" ||
      !payload.customer.trim() ||
      typeof payload.comment !== "string" ||
      !payload.comment.trim() ||
      !Number.isInteger(payload.rating) ||
      payload.rating < 1 ||
      payload.rating > 5
    ) {
      return res.status(400).json({
        status: "failed",
        message:
          "Website review requires a customer name, comment, and rating from 1 to 5",
      });
    }
  }

  const review = await AdminRecord.create({
    resource: "review",
    createdBy: req.user._id,
    payload: {
      ...payload,
      type,
      customer: payload.customer || req.user.userName,
      email: payload.email || req.user.email,
      location: cleanedLocation || payload.location || "",
      status: "Pending",
      date: payload.date || new Date().toISOString(),
      comment: payload.comment || payload.review || "",
    },
  });

  return res.status(201).json({
    status: "success",
    data: { ...review.payload, id: review._id.toString() },
  });
});

router.get("/reviews/:id", publicReadLimiter, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid review id" });
  }
  const review = await AdminRecord.findOne({
    _id: req.params.id,
    resource: "review",
    "payload.status": "Approved",
  });
  if (!review)
    return res
      .status(404)
      .json({ status: "failed", message: "Review not found" });
  return res.status(200).json({
    status: "success",
    data: { ...review.payload, id: review._id.toString() },
  });
});

router.put("/reviews/:id", auth, reviewWriteLimiter, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid review id" });
  }

  const review = await AdminRecord.findOne({
    _id: req.params.id,
    resource: "review",
    createdBy: req.user._id,
  });
  if (!review)
    return res
      .status(404)
      .json({ status: "failed", message: "Review not found" });

  const body = req.body ?? {};
  const nextPayload = validateAdminPayload("review", {
    ...review.payload,
    ...body,
    location:
      typeof body.location === "string"
        ? body.location.trim()
        : review.payload.location || "",
    comment:
      body.comment ??
      body.review ??
      review.payload.comment ??
      review.payload.review,
    review:
      body.review ??
      body.comment ??
      review.payload.review ??
      review.payload.comment,
    type:
      body.type === "product"
        ? "product"
        : review.payload.type === "product"
          ? "product"
          : "general",
    status: "Pending",
  });

  if (!nextPayload) {
    return res.status(400).json({
      status: "failed",
      message: "Invalid review data",
    });
  }

  review.payload = nextPayload;
  await review.save();
  return res.status(200).json({
    status: "success",
    data: { ...review.payload, id: review._id.toString() },
  });
});

router.delete("/reviews/:id", auth, reviewWriteLimiter, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid review id" });
  }
  const review = await AdminRecord.findOneAndDelete({
    _id: req.params.id,
    resource: "review",
    createdBy: req.user._id,
  });
  if (!review)
    return res
      .status(404)
      .json({ status: "failed", message: "Review not found" });
  return res.status(200).json({ status: "success", message: "Review deleted" });
});

export default router;
