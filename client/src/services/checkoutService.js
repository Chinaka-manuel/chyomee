import { get, post } from "./api";

// ==================== CHECKOUT ====================

export const calculateCheckout = async (checkoutData) => {
  return post("/checkout/calculate", checkoutData);
};

export const createOrder = async (orderData) => {
  return post("/checkout/order", orderData);
};

export const getCheckoutSummary = async () => {
  return get("/checkout/summary");
};

// ==================== PAYMENT ====================

export const initializePayment = async (paymentData) => {
  return post("/payments/initialize", paymentData);
};

export const getBankTransferReference = async (orderId) => {
  return post("/payments/bank-transfer/reference", { orderId });
};

export const submitBankTransferPayment = async (orderId) => {
  return post(`/orders/${encodeURIComponent(orderId)}/payment-submitted`);
};

export const getBankDetails = async () => {
  return get("/payments/bank-transfer/details");
};

export const verifyPayment = async (reference, state) => {
  return get(`/payments/verify/${encodeURIComponent(reference)}?state=${encodeURIComponent(state || "")}`);
};

export const downloadReceipt = async (orderId) => {
  return get(`/orders/${encodeURIComponent(orderId)}/receipt`);
};

export const cancelPayment = async (orderId) => {
  return post("/payments/cancel", {
    orderId,
  });
};

export default {
  calculateCheckout,
  createOrder,
  getCheckoutSummary,
  initializePayment,
  getBankTransferReference,
  submitBankTransferPayment,
  getBankDetails,
  verifyPayment,
  downloadReceipt,
  cancelPayment,
};
