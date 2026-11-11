import { createContext, useContext, useEffect, useMemo, useState } from "react";

const FAVORITES_KEY = "niceman_favorites";
const FavoritesContext = createContext(null);

const readFavoritesFromStorage = () => {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to read favorites from localStorage:", error);
    return [];
  }
};

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => readFavoritesFromStorage());

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (productId) =>
    favorites.some((item) => String(item.id) === String(productId));

  const addFavorite = (product) => {
    setFavorites((current) => {
      if (current.some((p) => String(p.id) === String(product.id)))
        return current;
      return [...current, product];
    });
  };

  const removeFavorite = (productId) => {
    setFavorites((current) =>
      current.filter((p) => String(p.id) !== String(productId)),
    );
  };

  const toggleFavorite = (product) => {
    if (!product || !product.id) return;

    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const favoritesCount = useMemo(() => favorites.length, [favorites]);

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    favoritesCount,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

export default FavoritesContext;
