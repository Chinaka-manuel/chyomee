const isProductionCookieContext = () => {
  const clientUrl = (process.env.CLIENT_URL || "").trim().toLowerCase();
  return (
    process.env.NODE_ENV === "production" ||
    (clientUrl.startsWith("https://") && !clientUrl.includes("localhost"))
  );
};

const getAuthCookieOptions = () => {
  const isProduction = isProductionCookieContext();

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = getAuthCookieOptions();

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res) => {
  const cookieOptions = getAuthCookieOptions();
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

export { getAuthCookieOptions };
