import jwt from 'jsonwebtoken'
import { User } from '../models/userSchema.js';
import { emailVerificationEnabled } from '../utils/verification.js';

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token =
        req.cookies?.accessToken ||
        (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

    if (!token) {
        return res.status(401).json({
            status: 'failed',
            message: 'Authentication required'
        })
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if (verified.tokenType !== "access") {
            return res.status(401).json({
                status: "failed",
                message: "Invalid or expired token",
            });
        }
        const user = await User.findById(verified.id).select("-password -verificationToken")

        if (!user) {
            return res.status(404).json({
                status: 'failed',
                message: 'unauthorized'
            })
        }

        if ((emailVerificationEnabled() && !user.isVerified) || !user.isActive) {
            return res.status(403).json({
                status: "failed",
                message: "Email verification is required",
            });
        }

        req.user = user;
        next()
    } catch {
        return res.status(401).json({
            status: 'failed',
            message: 'invalid or expired token'
        })
    }
}

export default auth;