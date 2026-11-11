import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProducts } from "../services/productService";

export const initialProducts = [];

export const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    getProducts()
      .then(({ data }) => {
        if (!active) return;
        const next = Array.isArray(data) ? data : [];
        setProducts(next);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      price: Number(product.price),
      stock: Number(product.stock),
      featured: Boolean(product.featured),
      sku: product.sku || `NAG-${Date.now()}`,
    };

    setProducts((current) => [...current, newProduct]);

    return newProduct;
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === Number(id)
          ? {
              ...product,
              ...updatedProduct,
              price: Number(updatedProduct.price ?? product.price),
              stock: Number(updatedProduct.stock ?? product.stock),
              featured: Boolean(updatedProduct.featured ?? product.featured),
              sku: updatedProduct.sku || product.sku || `NAG-${Date.now()}`,
            }
          : product,
      ),
    );
  };

  const deleteProduct = (id) => {
    setProducts((current) =>
      current.filter((product) => product.id !== Number(id)),
    );
  };

  const getProduct = (id) => {
    return products.find((product) => product.id === Number(id));
  };

  const getProductsByCategory = (category) => {
    return products.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase(),
    );
  };

  const toggleStatus = (id) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === Number(id)
          ? {
              ...product,
              status: product.status === "Active" ? "Inactive" : "Active",
            }
          : product,
      ),
    );
  };

  const updateStock = (id, quantity) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === Number(id)
          ? { ...product, stock: Math.max(0, product.stock + Number(quantity)) }
          : product,
      ),
    );
  };

  const activeProducts = useMemo(
    () => products.filter((p) => p.status === "Active"),
    [products],
  );
  const inactiveProducts = useMemo(
    () => products.filter((p) => p.status === "Inactive"),
    [products],
  );
  const inStockProducts = useMemo(
    () => products.filter((p) => p.stock > 10),
    [products],
  );
  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= 10),
    [products],
  );
  const outOfStockProducts = useMemo(
    () => products.filter((p) => p.stock === 0),
    [products],
  );

  const value = {
    products,
    setProducts,
    loading,
    setLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getProductsByCategory,
    toggleStatus,
    updateStock,
    activeProducts,
    inactiveProducts,
    inStockProducts,
    lowStockProducts,
    outOfStockProducts,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProductContext() {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return ctx;
}
