import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCartItemKey } from "../utils/cartItem";

const CART_KEY = "niceman_cart";
const CartContext = createContext(null);

const readCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem(CART_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return [];
  }
};

const normalizeQuantity = (value) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsed));
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => readCartFromStorage());

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, options = {}) => {
    const nextQuantity = normalizeQuantity(quantity);
    const selectedSize = options.selectedSize ?? product.selectedSize ?? "";
    const selectedColor = options.selectedColor ?? product.selectedColor ?? "";
    const selectedStyle = options.selectedStyle ?? product.selectedStyle ?? "";
    const availableSizes = Array.isArray(product.sizes) ? product.sizes : [];
    const availableColors = Array.isArray(product.colors) ? product.colors : [];
    const availableStyles = Array.isArray(product.styles) ? product.styles : [];

    if (
      nextQuantity <= 0 ||
      (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) ||
      (availableSizes.length === 0 && selectedSize) ||
      (availableColors.length > 0 && !availableColors.includes(selectedColor)) ||
      (availableColors.length === 0 && selectedColor) ||
      (availableStyles.length > 0 && !availableStyles.includes(selectedStyle)) ||
      (availableStyles.length === 0 && selectedStyle)
    ) {
      return false;
    }

    setCartItems((currentItems) => {
      const cartProduct = {
        ...product,
        selectedSize,
        selectedColor,
        selectedStyle,
      };
      const cartKey = getCartItemKey(cartProduct);
      const existingItem = currentItems.find(
        (item) => getCartItemKey(item) === cartKey,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          getCartItemKey(item) === cartKey
            ? { ...item, quantity: item.quantity + nextQuantity }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...cartProduct,
          quantity: nextQuantity,
        },
      ];
    });
    return true;
  };

  const removeFromCart = (
    productId,
    selectedSize = "",
    selectedColor = "",
    selectedStyle = "",
  ) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          getCartItemKey(item) !==
          getCartItemKey({ id: productId, selectedSize, selectedColor, selectedStyle }),
      ),
    );
  };

  const updateQuantity = (
    productId,
    quantity,
    selectedSize = "",
    selectedColor = "",
    selectedStyle = "",
  ) => {
    const nextQuantity = normalizeQuantity(quantity);

    if (nextQuantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor, selectedStyle);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        getCartItemKey(item) ===
        getCartItemKey({ id: productId, selectedSize, selectedColor, selectedStyle })
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
  };

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Context providers and their hooks intentionally share this module.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}
