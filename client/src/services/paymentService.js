import { get, post } from "./api";

// ==================== PAYMENT ====================

export const initializePayment = async (paymentData) => {
  return post("/payments/initialize", paymentData);
};

export const verifyPayment = async (reference) => {
  return get(`/payments/verify/${reference}`);
};

export const getPayment = async (paymentId) => {
  return get(`/payments/${paymentId}`);
};

export const cancelPayment = async (paymentId) => {
  return post(`/payments/${paymentId}/cancel`);
};

// ==================== PAYMENT HISTORY ====================

export const getMyPayments = async () => {
  return get("/payments/my-payments");
};

// ==================== ADMIN ====================

export const getAllPayments = async () => {
  return get("/payments");
};

export default {
  initializePayment,
  verifyPayment,
  getPayment,
  cancelPayment,
  getMyPayments,
  getAllPayments,
};