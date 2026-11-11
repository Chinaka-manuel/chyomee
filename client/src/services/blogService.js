import { get } from "./api";
import adminService from "./adminService";

// ==================== PUBLIC BLOG ====================

export const getPublishedPosts = async () => {
  return get("/blog?status=Published");
};

export const getFeaturedPosts = async () => {
  return get("/blog?status=Published&featured=true");
};

export const getBlogPost = async (id) => {
  return get(`/blog/${id}`);
};

export const getBlogPostsByCategory = async (category) => {
  return get(`/blog?category=${encodeURIComponent(category)}`);
};

// ==================== ADMIN BLOG ====================

export const getAllBlogPosts = async () => {
  return adminService.getBlogPosts();
};

export const createBlogPost = async (post) => {
  return adminService.createBlogPost(post);
};

export const updateBlogPost = async (id, updatedPost) => {
  return adminService.updateBlogPost(id, updatedPost);
};

export const deleteBlogPost = async (id) => {
  return adminService.deleteBlogPost(id);
};

export const toggleBlogPostStatus = async (id, status) => {
  return adminService.updateBlogPost(id, { status });
};

export default {
  getPublishedPosts,
  getBlogPost,
  getBlogPostsByCategory,
  getAllBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  toggleBlogPostStatus,
};
