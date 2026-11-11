import express from "express";
import auth from "../middlewares/auth.js";
import upload, { saveUpload } from "../middlewares/uploadMiddleware.js";
import {
  addUser,
  loginUser,
  profile,
  getAllUsers,
  updateUser,
  deleteUser,
  verifyEmail,
  refreshTokenRoute,
  logoutUser,
  forgotPassword,
  resetPassword,
  changePassword,
  getLimitedUser,
  getFilteredUsers,
  sortUsers,
  getPage,
} from "../controllers/userController.js";
import admin from "../middlewares/adminMiddleware.js";
import rateLimit from "express-rate-limit";

const Router = express.Router();
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      status: "failed",
      message: "Too many attempts. Please wait 15 minutes before trying again.",
    }),
});

Router.route("/users").get(auth, admin, getAllUsers);

Router.route("/users/limit").get(auth, admin, getLimitedUser);

Router.route("/users/filter").get(auth, admin, getFilteredUsers);

Router.route("/users/sort").get(auth, admin, sortUsers);

Router.route("/users/page").get(auth, admin, getPage);

Router.route("/register").post(
  credentialLimiter,
  upload.single("image"),
  saveUpload,
  addUser,
);

Router.route("/login").post(credentialLimiter, loginUser);

Router.route("/logout").post(logoutUser);

Router.route("/forgot-password").post(credentialLimiter, forgotPassword);

Router.route("/reset-password/:token").post(credentialLimiter, resetPassword);

Router.route("/change-password").post(auth, changePassword);

Router.route("/profile").get(auth, profile);

Router.route("/verify-email/:token").get(credentialLimiter, verifyEmail);

Router.route("/:email").patch(auth, updateUser).delete(auth, deleteUser);

Router.route("/refresh-token").post(credentialLimiter, refreshTokenRoute);

export default Router;
