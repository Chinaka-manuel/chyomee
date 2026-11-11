import { get, post, put, patch, del } from "./api";

// ==================== AUTH ====================

export const adminLogin = async (credentials) => {
  return post("/admin/login", credentials);
};

export const adminLogout = async () => {
  return post("/admin/logout");
};

export const getCurrentAdmin = async () => {
  return get("/admin/me");
};

// ==================== DASHBOARD ====================

export const getAdminDashboard = async () => {
  return get("/admin/dashboard");
};

// ==================== PRODUCTS ====================

export const getProducts = async () => {
  return get("/admin/products");
};

export const getProduct = async (id) => {
  return get(`/admin/products/${encodeURIComponent(id)}`);
};

export const createProduct = async (product) => {
  return post("/admin/products", product);
};

export const updateProduct = async (id, product) => {
  return put(`/admin/products/${encodeURIComponent(id)}`, product);
};

export const deleteProduct = async (id) => {
  return del(`/admin/products/${encodeURIComponent(id)}`);
};

// ==================== CATEGORIES ====================

export const getCategories = async () => {
  return get("/admin/categories");
};

export const getCategory = async (id) => {
  return get(`/admin/categories/${encodeURIComponent(id)}`);
};

export const createCategory = async (category) => {
  return post("/admin/categories", category);
};

export const updateCategory = async (id, category) => {
  return put(`/admin/categories/${encodeURIComponent(id)}`, category);
};

export const deleteCategory = async (id) => {
  return del(`/admin/categories/${encodeURIComponent(id)}`);
};

export const getTailoringRequests = async () => {
  return get("/admin/tailoring-requests");
};

export const updateTailoringRequest = async (id, payload) => {
  return patch(`/admin/tailoring-requests/${encodeURIComponent(id)}`, payload);
};

// ==================== ORDERS ====================

export const getOrders = async () => {
  return get("/admin/orders");
};

export const getOrder = async (id) => {
  return get(`/admin/orders/${encodeURIComponent(id)}`);
};

export const updateOrderStatus = async (id, status) => {
  return patch(`/admin/orders/${encodeURIComponent(id)}`, { status });
};

export const confirmPayment = async (id, transactionReference) => {
  return post(`/orders/${encodeURIComponent(id)}/confirm-payment`, {
    transactionReference,
  });
};

// ==================== CUSTOMERS ====================

export const getCustomers = async () => {
  return get("/admin/customers");
};

export const getCustomer = async (id) => {
  return get(`/admin/customers/${encodeURIComponent(id)}`);
};

export const updateCustomer = async (id, customer) => {
  return put(`/admin/customers/${encodeURIComponent(id)}`, customer);
};

export const deleteCustomer = async (id) => {
  return del(`/admin/customers/${encodeURIComponent(id)}`);
};

// ==================== REVIEWS ====================

export const getReviews = async () => {
  return get("/admin/reviews");
};

export const updateReviewStatus = async (id, status) => {
  return patch(`/admin/reviews/${encodeURIComponent(id)}`, { status });
};

export const deleteReview = async (id) => {
  return del(`/admin/reviews/${encodeURIComponent(id)}`);
};

// ==================== PROMOTIONS ====================

export const getPromotions = async () => {
  return get("/admin/promotions");
};

export const createPromotion = async (promotion) => {
  return post("/admin/promotions", promotion);
};

export const updatePromotion = async (id, promotion) => {
  return put(`/admin/promotions/${encodeURIComponent(id)}`, promotion);
};

export const deletePromotion = async (id) => {
  return del(`/admin/promotions/${encodeURIComponent(id)}`);
};

// ==================== BLOG ====================

export const getBlogPosts = async () => {
  return get("/admin/blog");
};

export const getBlogPost = async (id) => {
  return get(`/admin/blog/${encodeURIComponent(id)}`);
};

export const createBlogPost = async (payload) => {
  return post("/admin/blog", payload);
};

export const updateBlogPost = async (id, post) => {
  return put(`/admin/blog/${encodeURIComponent(id)}`, post);
};

export const deleteBlogPost = async (id) => {
  return del(`/admin/blog/${encodeURIComponent(id)}`);
};

// ==================== WEBSITE CONTENT ====================

export const getWebsiteContent = async () => {
  return get("/admin/website-content");
};

export const updateWebsiteContent = async (content) => {
  return put("/admin/website-content", content);
};

export default {
  adminLogin,
  adminLogout,
  getCurrentAdmin,
  getAdminDashboard,

  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,

  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,

  getOrders,
  getOrder,
  updateOrderStatus,
  confirmPayment,

  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,

  getReviews,
  updateReviewStatus,
  deleteReview,

  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,

  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,

  getWebsiteContent,
  updateWebsiteContent,
};
