import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import { sendVerificationEmail } from "../config/email.js";
import {
  accessToken as generateAccessToken,
  refreshToken as generateRefreshToken,
} from "../utils/jwt.js";
import bcrypt from "bcrypt";
import validator from "validator";
import {
  clearAuthCookies,
  getAuthCookieOptions,
  setAuthCookies,
} from "../utils/authCookies.js";
import { createHash, randomBytes } from "node:crypto";
import { sendPasswordResetEmail } from "../config/email.js";
import { emailVerificationEnabled } from "../utils/verification.js";

const verificationTokenFor = (payload) =>
  jwt.sign({ ...payload, tokenType: "verification" }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

export const addUser = async (req, res) => {
  let stage = "validating request";
  try {
    const { userName, email, password, confirmPassword, phone } =
      req.body ?? {};
    const image =
      req.file?.secure_url || req.file?.path || req.body?.image || "";

    if (
      typeof userName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Name, email and password are required",
        });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ status: "fail", message: "Passwords do not match" });
    }

    stage = "checking for an existing account";
    const findUser = await User.findOne({ email: email.trim().toLowerCase() });

    if (findUser) {
      return res
        .status(409)
        .json({
          status: "fail",
          message: "An account already exists for this email address.",
        });
    }

    stage = "creating the account";
    const user = await User.create({
      image,
      userName,
      email: email.trim().toLowerCase(),
      phone,
      role: "user",
      password,
      ...(emailVerificationEnabled() ? {} : { isVerified: true }),
    });

    if (emailVerificationEnabled()) {
      stage = "creating the verification token";
      const verificationToken = verificationTokenFor({
        id: user._id,
        email: user.email,
      });
      const verificationLink = `${process.env.API_URL || "http://localhost:5000/api/v1"}/user/verify-email/${verificationToken}`;

      stage = "saving the verification token";
      await User.findByIdAndUpdate(user._id, {
        verificationToken: createHash("sha256")
          .update(verificationToken)
          .digest("hex"),
      });

      try {
        stage = "sending the verification email";
        await sendVerificationEmail(user, verificationLink);
      } catch (error) {
        console.error("[registration] verification email failed", {
          name: error.name,
          code: error.code,
          message: error.message,
        });
        stage = "cleaning up after verification email failure";
        await User.deleteOne({ _id: user._id });
        return res.status(503).json({
          status: "failed",
          message: "Unable to send verification email. Please try again later.",
        });
      }
    }

    res.status(201).json({
      status: "success",
      message: user.isVerified
        ? "Account created successfully. You can now sign in."
        : "Account created successfully. Please verify your email before signing in.",
      data: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: "failed",
        message: "An account already exists for this email address.",
      });
    }

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors ?? {})
        .map((validationError) => validationError.message)
        .filter(Boolean);
      return res.status(400).json({
        status: "failed",
        message: messages.length
          ? messages.join(". ")
          : "Please check your account details and try again.",
      });
    }

    console.error(`[registration] failed while ${stage}`, {
      name: err.name,
      code: err.code,
      message: err.message,
    });
    return res.status(500).json({
      status: "failed",
      message: "Unable to create your account right now. Please try again later.",
    });
  }
};

// email verification controller
export const verifyEmail = async (req, res) => {
  try {
    // get the request token from req.params
    const { token: verificationToken } = req.params;
    // decode the token(encrypted server token and client token)
    const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);

    // make the id of the user to be the decorded id
    const user = await User.findById(decoded.id).select("+verificationToken");

    const tokenHash = createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    if (
      !user ||
      user.verificationToken !== tokenHash ||
      decoded.tokenType !== "verification"
    ) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid or expired token." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/login`,
    );
  } catch (error) {
    return res
      .status(400)
      .json({ status: "fail", message: "Invalid or expired token." });
  }
};

// login User
export const loginUser = async (req, res) => {
  try {
    // get email and password from the request body
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ status: "failed", message: "Email and password are required" });
    }
    //check if email exist in the database
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ status: "failed", message: "No account found with this email." });
    }

    // compare the password in the database(hashed password and the password the user inputed)
    const comparePassword = await bcrypt.compare(password, user.password);

    // return an error if the passwords does  not match
    if (!comparePassword) {
      return res.status(403).json({
        status: "failed",
        message: "Incorrect password.",
      });
    }

    if (!user.isVerified && emailVerificationEnabled) {
      return res.status(403).json({
        status: "failed",
        message: "Please verify your email before logging in.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: "failed",
        message: "This account is inactive. Please contact support.",
      });
    }

    // generate a login token for authorization
    // const logToken = token({ id: user._id })

    // generate an access and refresh Token

    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    setAuthCookies(res, accessToken, refreshToken);

    // return a success response if user logged in successfully
    res.status(200).json({
      status: "success",
      message: "login successful",
      data: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(500).json({
      status: "failed",
      message: err?.message || "Unable to sign in right now. Please try again later.",
    });
  }
};

// profile controller
export const profile = (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "welcome to the profile page",
    data: req.user,
  });
};

export const logoutUser = (_req, res) => {
  clearAuthCookies(res);
  return res.status(200).json({ status: "success", message: "Logged out" });
};

export const forgotPassword = async (req, res) => {
  const email = req.body?.email;
  if (typeof email !== "string" || !validator.isEmail(email)) {
    return res
      .status(400)
      .json({ status: "failed", message: "A valid email address is required" });
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const passwordResetToken = createHash("sha256").update(token).digest("hex");
    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`;
    try {
      await sendPasswordResetEmail(user, resetLink);
    } catch (error) {
      console.error("Password reset email could not be sent:", error.message);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return res.status(503).json({
        status: "failed",
        message:
          "Unable to send the password reset email. Please try again later.",
      });
    }
  }
  return res.status(200).json({
    status: "success",
    message:
      "If the account exists, password reset instructions have been sent.",
  });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body ?? {};
  if (
    typeof token !== "string" ||
    !/^[a-f\d]{64}$/i.test(token) ||
    typeof password !== "string" ||
    (confirmPassword !== undefined && confirmPassword !== password)
  ) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid password reset request" });
  }
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return res
      .status(400)
      .json({
        status: "failed",
        message:
          "Password must include uppercase, lowercase, number and symbol characters",
      });
  }
  const passwordResetToken = createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");
  if (!user)
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid or expired reset link" });

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  clearAuthCookies(res);
  return res
    .status(200)
    .json({ status: "success", message: "Password reset successfully" });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return res
      .status(400)
      .json({
        status: "failed",
        message: "Current and new passwords are required",
      });
  }
  const user = await User.findById(req.user._id).select("+password");
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res
      .status(400)
      .json({ status: "failed", message: "Current password is incorrect" });
  }
  if (currentPassword === newPassword) {
    return res
      .status(400)
      .json({ status: "failed", message: "Choose a new password" });
  }
  if (
    !validator.isStrongPassword(newPassword, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return res
      .status(400)
      .json({
        status: "failed",
        message:
          "Password must include uppercase, lowercase, number and symbol characters",
      });
  }
  user.password = newPassword;
  await user.save();
  clearAuthCookies(res);
  return res
    .status(200)
    .json({
      status: "success",
      message: "Password changed. Please sign in again.",
    });
};

// get all users
export const getAllUsers = async (req, res) => {
  try {
    const user = await User.find({}).select("-password");

    res.status(200).json({
      status: "success",
      message: "all users retrieved",
      data: user,
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: `unable to get users ${err}`,
    });
  }
};

// updating a user using by email
export const updateUser = async (req, res) => {
  try {
    const { email } = req.params;
    if (req.user.role !== "admin" && req.user.email !== email.toLowerCase()) {
      return res
        .status(403)
        .json({ status: "failed", message: "You cannot update this account" });
    }
    const allowedFields = ["userName", "image"];
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
    );

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      updateData,
      { returnDocument: 'after', runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: `User with the email: ${email} not found`,
      });
    }

    res.status(200).json({
      status: "success",
      message: `User with the email: ${email} updated successfully`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: `internal server error : ${err}`,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { email } = req.params;
    if (req.user.role !== "admin" && req.user.email !== email.toLowerCase()) {
      return res
        .status(403)
        .json({ status: "failed", message: "You cannot delete this account" });
    }

    const user = await User.findOneAndDelete({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: `user with the email: ${email} not found`,
      });
    }

    res.status(200).json({
      status: "success",
      message: `user with the ${email} deleted`,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: `internal server error ${err}`,
    });
  }
};

export const refreshTokenRoute = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tokenType !== "refresh") return res.sendStatus(403);
    const user = await User.findById(decoded.id).select(
      "-password -verificationToken",
    );
    if (!user)
      return res.sendStatus(403);

    const accessToken = generateAccessToken({ id: user._id });
    const cookieOptions = getAuthCookieOptions();
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    return res
      .status(200)
      .json({ status: "success", message: "Session refreshed" });
  } catch {
    clearAuthCookies(res);
    return res.sendStatus(403);
  }
};

// request query
// get limited users
export const getLimitedUser = async (req, res) => {
  try {
    // getting request query from the url
    const limit = Number(req.query.limit) || 10;
    const user = await User.find({}).select("-password").limit(limit);

    res.status(200).json({
      status: "success",
      message: "all users retrieved",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: `unable to get users ${err}`,
    });
  }
};

export const getFilteredUsers = async (req, res) => {
  try {
    // getting request query from the url
    const { username } = req.query;
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    if (typeof username !== "string" || username.length > 100) {
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid username filter" });
    }
    const safeUsername = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const user = await User.find({
      userName: { $regex: safeUsername, $options: "i" },
    })
      .select("-password")
      .limit(limit);

    if (!user) return res.sendStatus(404);

    res.status(200).json({
      status: "success",
      message: "all users retrieved",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: `unable to get users ${err}`,
    });
  }
};

// sorting
export const sortUsers = async (req, res) => {
  try {
    const { sort } = req.query;
    const limit = Number(req.query.limit) || 10;

    let query = User.find({}).select("-password").limit(limit);

    if (sort === "userName") {
      query = query.sort({ userName: 1 }); // Ascending: A → Z
    }

    if (sort === "-userName") {
      query = query.sort({ userName: -1 }); // Descending: Z → A
    }

    const users = await query;

    res.status(200).json({
      status: "success",
      message: `${limit} users retrieved successfully`,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: `Unable to get users: ${err.message}`,
    });
  }
};
// pagination

export const getPage = async (req, res) => {
  // page = 2
  // limit = 10
  // skip = (page - 1) * limit
  // skip =(2-1) * 10

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const users = await User.find({}).limit(limit).skip(skip);

    if (!users) return res.sendStatus(404);

    res.status(200).json({
      status: "success",
      message: `${limit} users retrieved successfully`,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: `Unable to get users: ${err.message}`,
    });
  }
};
