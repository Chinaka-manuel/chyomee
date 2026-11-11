import { useContext, useMemo, useState } from "react";
import { CategoryContext, initialCategories } from "../context/CategoryContext";

export default function useCategories() {
  const ctx = useContext(CategoryContext);

  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);

  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now(),
      slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, "-"),
      status: category.status || "Active",
    };

    setCategories((current) => [...current, newCategory]);
    return newCategory;
  };

  const updateCategory = (id, updatedCategory) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === Number(id)
          ? {
              ...category,
              ...updatedCategory,
              slug:
                updatedCategory.slug ||
                (updatedCategory.name || category.name)
                  ?.toLowerCase()
                  .replace(/\s+/g, "-"),
              status: updatedCategory.status || category.status,
            }
          : category,
      ),
    );
  };

  const deleteCategory = (id) => {
    setCategories((current) =>
      current.filter((category) => category.id !== Number(id)),
    );
  };

  const getCategory = (id) => {
    return categories.find((category) => category.id === Number(id));
  };

  const getCategoryBySlug = (slug) => {
    return categories.find(
      (category) =>
        String(category.slug).toLowerCase() === String(slug).toLowerCase(),
    );
  };

  const toggleStatus = (id) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === Number(id)
          ? {
              ...category,
              status: category.status === "Active" ? "Inactive" : "Active",
            }
          : category,
      ),
    );
  };

  const activeCategories = useMemo(
    () => categories.filter((category) => category.status === "Active"),
    [categories],
  );

  const inactiveCategories = useMemo(
    () => categories.filter((category) => category.status === "Inactive"),
    [categories],
  );

  const localValue = {
    categories,
    activeCategories,
    inactiveCategories,
    loading,
    setLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getCategoryBySlug,
    toggleStatus,
  };

  return ctx || localValue;
}
