// admin checking middleware
import { emailVerificationEnabled } from "../utils/verification.js";

const admin = (req, res, next) => {
    if (req.user?.role === "admin" && (!emailVerificationEnabled() || req.user.isVerified)) {
        return next();
    }

    return res.status(403).json({
        status: "failed",
        message: "Administrator access required",
    });
};

export default admin