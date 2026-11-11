import { useContext, useState, useMemo } from "react";
import { ProductContext, initialProducts } from "../context/ProductContext";

export default function useProducts() {
  const ctx = useContext(ProductContext);

  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

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
    () => products.filter((product) => product.status === "Active"),
    [products],
  );
  const inactiveProducts = useMemo(
    () => products.filter((product) => product.status === "Inactive"),
    [products],
  );
  const inStockProducts = useMemo(
    () => products.filter((product) => product.stock > 10),
    [products],
  );
  const lowStockProducts = useMemo(
    () =>
      products.filter((product) => product.stock > 0 && product.stock <= 10),
    [products],
  );
  const outOfStockProducts = useMemo(
    () => products.filter((product) => product.stock === 0),
    [products],
  );

  const localValue = {
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

  return ctx || localValue;
}
