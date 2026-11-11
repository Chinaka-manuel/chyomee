import { get, post, put, del } from "./api";
import adminService from "./adminService";

// ==================== PUBLIC REVIEWS ====================

export const getPublicReviews = async () => {
  return get("/reviews");
};

export const getProductReviews = async (productId) => {
  return get(`/reviews/product/${productId}`);
};

export const getReview = async (reviewId) => {
  return get(`/reviews/${reviewId}`);
};

// ==================== CUSTOMER REVIEWS ====================

export const createReview = async (reviewData) => {
  return post("/reviews", reviewData);
};

export const updateReview = async (reviewId, reviewData) => {
  return put(`/reviews/${reviewId}`, reviewData);
};

export const deleteReview = async (reviewId) => {
  return del(`/reviews/${reviewId}`);
};

export const getMyReviews = async () => {
  return get("/reviews/my-reviews");
};

// ==================== ADMIN REVIEWS ====================

export const getAllReviews = async () => {
  return adminService.getReviews();
};

export const updateReviewStatus = async (reviewId, status) => {
  return adminService.updateReviewStatus(reviewId, status);
};

export const approveReview = async (reviewId) => {
  return updateReviewStatus(reviewId, "Approved");
};

export const rejectReview = async (reviewId) => {
  return updateReviewStatus(reviewId, "Rejected");
};

export default {
  getPublicReviews,
  getProductReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  getAllReviews,
  updateReviewStatus,
  approveReview,
  rejectReview,
};
