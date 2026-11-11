export const emailVerificationEnabled = () =>
    process.env.NODE_ENV === "production" || Boolean(process.env.RESEND_API_KEY);
