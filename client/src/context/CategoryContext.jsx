import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCategories } from "../services/categoryService";

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "category";

export const initialCategories = [];

export const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    getCategories()
      .then(({ data }) => {
        if (!active) return;
        const next = Array.isArray(data) ? data : [];
        setCategories(next);
      })
      .catch(() => {
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const addCategory = (category) => {
    const nextCategory = {
      ...category,
      id: Date.now(),
      name: category.name?.trim() || "New Category",
      slug: category.slug || slugify(category.name || "New Category"),
      description: category.description || "",
      image: category.image || "",
      status: category.status || "Active",
    };

    setCategories((current) => [...current, nextCategory]);
    return nextCategory;
  };

  const updateCategory = (id, updatedCategory) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === Number(id)
          ? {
              ...category,
              ...updatedCategory,
              name: updatedCategory.name?.trim() || category.name,
              slug:
                updatedCategory.slug ||
                slugify(updatedCategory.name || category.name),
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
    const target = String(slug || "").toLowerCase();
    return categories.find(
      (category) => String(category.slug || "").toLowerCase() === target,
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

  const value = {
    categories,
    setCategories,
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

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategoryContext() {
  const ctx = useContext(CategoryContext);
  if (!ctx) {
    throw new Error(
      "useCategoryContext must be used within a CategoryProvider",
    );
  }
  return ctx;
}
