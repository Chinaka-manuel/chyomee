import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import { User } from "../models/userSchema.js";
import { AdminRecord } from "../models/AdminRecord.js";
import { Product } from "../models/Product.js";
import { sendVerificationEmail } from "../config/email.js";
import { accessToken, refreshToken } from "../utils/jwt.js";
import { clearAuthCookies, setAuthCookies } from "../utils/authCookies.js";
import { emailVerificationEnabled } from "../utils/verification.js";

const verificationTokenFor = (payload) =>
  jwt.sign({ ...payload, tokenType: "verification" }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

const safeAdmin = (user) => ({
  id: user._id,
  userName: user.userName,
  email: user.email,
  role: user.role,
});

const invalidAdminCredentials = (res) =>
  res.status(401).json({
    status: "failed",
    message:
      "Unable to verify administrator sign-in. Check that this email belongs to an admin account in this server's database. If the password is correct and the account was created through admin signup before the password-hashing fix, reset the password; the old stored hash cannot be repaired during login.",
  });

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res
      .status(400)
      .json({ status: "failed", message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password",
  );
  if (!user || user.role !== "admin") {
    return invalidAdminCredentials(res);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return invalidAdminCredentials(res);
  }

  if (emailVerificationEnabled() && !user.isVerified) {
    return res.status(403).json({
      status: "failed",
      message: "Please verify your email before signing in as an administrator.",
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      status: "failed",
      message: "This administrator account is inactive. Contact your system administrator.",
    });
  }

  setAuthCookies(
    res,
    accessToken({ id: user._id }),
    refreshToken({ id: user._id }),
  );
  return res.status(200).json({ status: "success", data: safeAdmin(user) });
};

export const logoutAdmin = (_req, res) => {
  clearAuthCookies(res);
  return res.status(200).json({ status: "success", message: "Logged out" });
};

export const getCurrentAdmin = (req, res) =>
  res.status(200).json({ status: "success", data: safeAdmin(req.user) });

export const getAdminDashboard = async (_req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const validOrderStatuses = [
    "Pending",
    "Processing",
    "Delivered",
    "Cancelled",
  ];

  const [
    customers,
    newCustomers,
    products,
    lowStock,
    orders,
    revenueResult,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    blogPosts,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", createdAt: { $gte: thirtyDaysAgo } }),
    Product.countDocuments(),
    Product.countDocuments({ stock: { $lt: 10 } }),
    AdminRecord.countDocuments({ resource: "order" }),
    AdminRecord.aggregate([
      {
        $match: {
          resource: "order",
          "payload.paymentStatus": "Paid",
          "payload.status": { $ne: "Cancelled" },
        },
      },
      {
        $addFields: {
          totalValue: {
            $convert: {
              input: "$payload.total",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalValue" } } },
    ]),
    AdminRecord.countDocuments({
      resource: "order",
      "payload.status": "Pending",
    }),
    AdminRecord.countDocuments({
      resource: "order",
      "payload.status": "Processing",
    }),
    AdminRecord.countDocuments({
      resource: "order",
      "payload.status": "Delivered",
    }),
    AdminRecord.countDocuments({
      resource: "order",
      "payload.status": "Cancelled",
    }),
    AdminRecord.countDocuments({
      resource: "article",
      "payload.status": "Published",
    }),
    AdminRecord.find({ resource: "order" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const revenue = Number(revenueResult?.[0]?.total ?? 0);
  const summaryStatus = {
    Pending: pendingOrders,
    Processing: processingOrders,
    Delivered: deliveredOrders,
    Cancelled: cancelledOrders,
  };

  const normalizedRecentOrders = recentOrders
    .filter(
      (record) =>
        record?.payload && validOrderStatuses.includes(record.payload.status),
    )
    .map((record) => {
      const total = Number(record.payload?.total ?? 0);
      const customer =
        typeof record.payload?.customer === "string"
          ? record.payload.customer
          : (record.payload?.customer?.name ??
            record.payload?.email ??
            "Guest");

      return {
        ...record.payload,
        id: record._id.toString(),
        amount: total,
        total,
        customer,
        date: record.payload?.date ?? record.createdAt,
      };
    });

  return res.status(200).json({
    status: "success",
    data: {
      customers,
      newCustomers,
      products,
      lowStock,
      orders,
      revenue,
      orderStatus: summaryStatus,
      blogPosts,
      recentOrders: normalizedRecentOrders,
    },
  });
};

export const signupAdmin = async (req, res) => {
  try {
    const { fullName, email, password, passcode } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        status: "failed",
        message: "Email and password are required",
      });
    }

    if (!process.env.ADMIN_PASSCODE) {
      return res.status(503).json({
        status: "failed",
        message: "Administrator registration is not configured",
      });
    }

    if (typeof passcode !== "string" || passcode !== process.env.ADMIN_PASSCODE) {
      return res
        .status(401)
        .json({ status: "failed", message: "Invalid admin passcode" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ status: "failed", message: "Admin already exists" });
    }
    const user = await User.create({
      userName: fullName || email.split("@")[0],
      email: email.toLowerCase().trim(),
      password,
      role: "admin",
      isActive: true,
      ...(!emailVerificationEnabled() ? { isVerified: true } : {}),
    });

    if (emailVerificationEnabled()) {
      const verificationToken = verificationTokenFor({
        id: user._id,
        email: user.email,
      });
      user.verificationToken = createHash("sha256")
        .update(verificationToken)
        .digest("hex");
      await user.save();

      const verificationLink = `${
        process.env.API_URL || "http://localhost:5000/api/v1"
      }/user/verify-email/${verificationToken}`;
      try {
        await sendVerificationEmail(user, verificationLink);
      } catch (error) {
        console.error("[admin registration] verification email failed", {
          name: error.name,
          code: error.code,
          message: error.message,
        });
        await User.deleteOne({ _id: user._id });
        return res.status(503).json({
          status: "failed",
          message: "Unable to send verification email. Please try again later.",
        });
      }
    }

    return res.status(201).json({
      status: "success",
      message: user.isVerified
        ? "Administrator account created successfully. You can now sign in."
        : "Administrator account created. Please verify your email before signing in.",
      data: { ...safeAdmin(user), isVerified: user.isVerified },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ status: "failed", message: "Admin already exists" });
    }
    if (err?.name === "ValidationError") {
      const messages = Object.values(err.errors ?? {})
        .map((validationError) => validationError.message)
        .filter(Boolean);
      return res.status(400).json({
        status: "failed",
        message: messages.length
          ? messages.join(". ")
          : "Please check the administrator details and try again.",
      });
    }
    console.error("Unable to register administrator:", err);
    return res
      .status(500)
      .json({ status: "failed", message: "Unable to register administrator" });
  }
};
