import { get, post, put, del } from "./api";

// ==================== CART ====================

export const getCart = async () => {
  return get("/cart");
};

export const addToCart = async (
  productId,
  quantity = 1,
  options = {},
) => {
  const { size = "", color = "", style = "" } =
    typeof options === "string" ? { size: options } : options;
  return post("/cart", {
    productId,
    quantity,
    ...(size ? { size } : {}),
    ...(color ? { color } : {}),
    ...(style ? { style } : {}),
  });
};

export const updateCartItem = async (
  productId,
  quantity,
  options = {},
) => {
  const { size = "", color = "", style = "" } =
    typeof options === "string" ? { size: options } : options;
  return put(`/cart/${productId}`, {
    quantity,
    ...(size ? { size } : {}),
    ...(color ? { color } : {}),
    ...(style ? { style } : {}),
  });
};

export const removeFromCart = async (
  productId,
  options = {},
) => {
  const { size = "", color = "", style = "" } =
    typeof options === "string" ? { size: options } : options;
  const params = new URLSearchParams({ size, color, style });
  const query = `?${params.toString()}`;
  return del(`/cart/${productId}${query}`);
};

export const clearCart = async () => {
  return del("/cart");
};

// ==================== CART TOTALS ====================

export const getCartSummary = async () => {
  return get("/cart/summary");
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
};