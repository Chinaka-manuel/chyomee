import { get } from "./api";

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return get(`/products${qs ? `?${qs}` : ""}`);
};

export const getProduct = async (id) => {
  return get(`/products/${encodeURIComponent(id)}`);
};

export default { getProducts, getProduct };
