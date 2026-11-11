import { get } from "./api";
import adminService from "./adminService";

// ==================== PUBLIC CATEGORIES ====================

export const getCategories = async () => {
  return get("/categories");
};

export const getCategory = async (id) => {
  return get(`/categories/${id}`);
};

export const getCategoryBySlug = async (slug) => {
  return get(`/categories/slug/${encodeURIComponent(slug)}`);
};

// ==================== ADMIN CATEGORIES ====================

export const createCategory = async (category) => {
  return adminService.createCategory(category);
};

export const updateCategory = async (id, category) => {
  return adminService.updateCategory(id, category);
};

export const deleteCategory = async (id) => {
  return adminService.deleteCategory(id);
};

export const toggleCategoryStatus = async (id, status) => {
  return adminService.updateCategory(id, { status });
};

export default {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};