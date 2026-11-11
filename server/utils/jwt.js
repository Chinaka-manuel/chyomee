import jwt from "jsonwebtoken"


// generate access and rfresh token using JWT
export const accessToken = (payload) => {
    return jwt.sign(
        { ...payload, tokenType: "access" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
    );
}


export const refreshToken = (payload) => {
    return jwt.sign(
        { ...payload, tokenType: "refresh" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );
}
