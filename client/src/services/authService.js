import { get, post } from "./api";

// ==================== CUSTOMER AUTH ====================

export const registerUser = async (userData) => {
  return post("/user/register", userData);
};

export const loginUser = async (credentials) => {
  return post("/user/login", credentials);
};

export const logoutUser = async () => {
  return post("/user/logout");
};

export const getCurrentUser = async () => {
  return get("/user/profile");
};

// ==================== PASSWORD ====================

export const forgotPassword = async (email) => {
  return post("/user/forgot-password", { email });
};

export const resetPassword = async (token, password, confirmPassword) => {
  return post(`/user/reset-password/${encodeURIComponent(token)}`, {
    password,
    confirmPassword,
  });
};

export const changePassword = async (currentPassword, newPassword) => {
  return post("/user/change-password", {
    currentPassword,
    newPassword,
  });
};

// ==================== ADMIN AUTH ====================

export const adminLogin = async (credentials) => {
  return post("/admin/login", credentials);
};

export const adminLogout = async () => {
  return post("/admin/logout");
};

export const getCurrentAdmin = async () => {
  return get("/admin/me");
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  adminLogin,
  adminLogout,
  getCurrentAdmin,
};