import express from "express";
import auth from "../middlewares/auth.js";
import admin from "../middlewares/adminMiddleware.js";
import {
  getAdminDashboard,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  signupAdmin,
} from "../controllers/adminController.js";
import {
  createAdminRecord,
  deleteAdminRecord,
  hasUnuploadedAdminImage,
  getAdminRecord,
  listAdminRecords,
  listCustomers,
  getCustomer,
  updateCustomer,
  updateAdminRecord,
  deleteCustomer,
} from "../controllers/adminResourceController.js";
import {
  addProducts,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/productController.js";
import { validateAdminPayload } from "../controllers/adminResourceController.js";
import { AdminRecord } from "../models/AdminRecord.js";
import rateLimit from "express-rate-limit";

const router = express.Router();
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      status: "failed",
      message:
        "Too many admin login attempts. Please wait 15 minutes before trying again.",
    }),
});
const adminSignupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      status: "failed",
      message:
        "Too many admin registration attempts. Please wait 15 minutes before trying again.",
    }),
});
const adminWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      status: "failed",
      message:
        "Too many admin write requests. Please wait 15 minutes before trying again.",
    }),
});

router.post("/login", adminLoginLimiter, loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/me", auth, admin, getCurrentAdmin);
router.get("/dashboard", auth, admin, getAdminDashboard);
router
  .route("/products")
  .get(auth, admin, (req, res, next) => {
    req.admin = true;
    return getAllProducts(req, res, next);
  })
  .post(auth, admin, adminWriteLimiter, addProducts);
router
  .route("/products/:id")
  .get(auth, admin, (req, res, next) => {
    req.admin = true;
    return getProductById(req, res, next);
  })
  .put(auth, admin, adminWriteLimiter, updateProduct)
  .patch(auth, admin, adminWriteLimiter, updateProduct)
  .delete(auth, admin, adminWriteLimiter, deleteProduct);

const registerResource = (path, resource) => {
  router
    .route(path)
    .get(auth, admin, listAdminRecords(resource))
    .post(auth, admin, adminWriteLimiter, createAdminRecord(resource));
  router
    .route(`${path}/:id`)
    .get(auth, admin, getAdminRecord(resource))
    .put(auth, admin, adminWriteLimiter, updateAdminRecord(resource))
    .patch(auth, admin, adminWriteLimiter, updateAdminRecord(resource))
    .delete(auth, admin, adminWriteLimiter, deleteAdminRecord(resource));
};

registerResource("/categories", "category");
registerResource("/orders", "order");
registerResource("/reviews", "review");
registerResource("/promotions", "promotion");
registerResource("/blog", "article");
router.get(
  "/tailoring-requests",
  auth,
  admin,
  listAdminRecords("tailoring-request"),
);
router.get(
  "/tailoring-requests/:id",
  auth,
  admin,
  getAdminRecord("tailoring-request"),
);
router
  .route("/tailoring-requests/:id")
  .put(auth, admin, adminWriteLimiter, updateAdminRecord("tailoring-request"))
  .patch(auth, admin, adminWriteLimiter, updateAdminRecord("tailoring-request"));

router.get("/customers", auth, admin, listCustomers);
router.get("/customers/:id", auth, admin, getCustomer);
router.put("/customers/:id", auth, admin, adminWriteLimiter, updateCustomer);
router.delete("/customers/:id", auth, admin, adminWriteLimiter, deleteCustomer);
router.get("/website-content", auth, admin, async (_req, res) => {
  const record = await AdminRecord.findOne({
    resource: "website-content",
  }).sort({ updatedAt: -1 });
  return res
    .status(200)
    .json({ status: "success", data: record?.payload ?? {} });
});
router.put(
  "/website-content",
  auth,
  admin,
  adminWriteLimiter,
  async (req, res) => {
    const existingRecord = await AdminRecord.findOne({
      resource: "website-content",
    }).sort({ updatedAt: -1 });
    const payload = validateAdminPayload(
      "website-content",
      req.body,
      false,
      existingRecord?.payload,
    );
    if (!payload) {
      if (hasUnuploadedAdminImage(req.body, existingRecord?.payload, true)) {
        return res.status(400).json({
          status: "failed",
          message:
            "Upload images through the admin image uploader before saving.",
        });
      }
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid website content" });
    }
    const existing = await AdminRecord.findOneAndUpdate(
      { resource: "website-content" },
      {
        $set: { payload },
        $setOnInsert: { createdBy: req.user._id },
      },
      { returnDocument: "after", upsert: true, runValidators: true },
    );
    return res.status(200).json({ status: "success", data: existing.payload });
  },
);

router.post("/signup", adminSignupLimiter, signupAdmin);

export default router;
