import express from "express";
import rateLimit from "express-rate-limit";
import {
  getAllProducts,
  addProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import auth from "../middlewares/auth.js";
import admin from "../middlewares/adminMiddleware.js";
// import customMiddleware from "../utils/customMiddleware.js";

// initialize  Router using express.Router method
const Router = express.Router();
const publicReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 250,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "failed",
    message:
      "Too many public product requests. Please wait a moment and try again.",
  },
});

//from the router create the different routes
Router.route("/products").get(publicReadLimiter, getAllProducts);

Router.route("/products/:id")
  .get(publicReadLimiter, getProductById)
  .patch(auth, admin, updateProduct)
  .put(auth, admin, updateProduct)
  .delete(auth, admin, deleteProduct);

export default Router;
