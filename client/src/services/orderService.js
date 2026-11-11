import { get, post } from "./api";
import adminService from "./adminService";

// ==================== CUSTOMER ORDERS ====================

export const getMyOrders = async () => {
  return get("/orders/my-orders");
};

export const getMyOrder = async (orderId) => {
  return get(`/orders/my-orders/${orderId}`);
};

export const createOrder = async (orderData) => {
  return post("/orders", orderData);
};

export const cancelOrder = async (orderId) => {
  return post(`/orders/${orderId}/cancel`);
};

// ==================== ORDER TRACKING ====================

export const trackOrder = async (orderId) => {
  return get(`/orders/${orderId}/track`);
};

// ==================== ADMIN ORDERS ====================

export const getAllOrders = async () => {
  return adminService.getOrders();
};

export const getOrder = async (orderId) => {
  return adminService.getOrder(orderId);
};

export const updateOrderStatus = async (orderId, status) => {
  return adminService.updateOrderStatus(orderId, status);
};

export default {
  getMyOrders,
  getMyOrder,
  createOrder,
  cancelOrder,
  trackOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
};