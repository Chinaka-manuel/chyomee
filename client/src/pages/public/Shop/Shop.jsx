import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShoppingCart, ChevronDown, Heart, Check } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { useCategoryContext } from "../../../context/CategoryContext";
import { useFavorites } from "../../../context/FavoritesContext";
import { getProducts } from "../../../services/productService";
import ScrollReveal from "../../../components/ui/ScrollReveal";

function formatPrice(price) {
  return `₦${price.toLocaleString("en-NG")}`;
}

const fallbackCategories = [
  "All Products",
  "Clothing",
  "Shoes",
  "Bags",
  "Accessories",
  "New Arrivals",
  "Sale",
];

function Shop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Products",
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortOption, setSortOption] = useState("name");
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { activeCategories = [] } = useCategoryContext();
  const [addedProductId, setAddedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "All Products");
    setSearchTerm(searchParams.get("search") || "");
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleResize = () => setIsMobile(mediaQuery.matches);

    handleResize();
    mediaQuery.addEventListener?.("change", handleResize);

    return () => {
      mediaQuery.removeEventListener?.("change", handleResize);
    };
  }, []);

  const productsPerPage = isMobile ? 10 : 24;

  const categories = [
    "All Products",
    ...activeCategories
      .filter((category) => category?.name)
      .map((category) => category.name),
  ];

  const categoryOptions = categories.length ? categories : fallbackCategories;

  useEffect(() => {
    let active = true;

    getProducts()
      .then(({ data }) => {
        if (active) setProducts(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (active)
          setProductsError(error.message || "Could not load products.");
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = (product) => {
    if (product.sizes?.length || product.colors?.length || product.styles?.length) {
      navigate(`/product/${product.id}`);
      return;
    }
    addToCart(product, 1);
    setAddedProductId(product.id);

    window.setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 1200);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All Products") {
      result = result.filter(
        (product) => product.category === selectedCategory,
      );
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search),
      );
    }

    if (sortOption === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortOption === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sortOption === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortOption === "featured") {
      result.sort((a, b) => {
        const aTime = new Date(b.createdAt || b.id).getTime();
        const bTime = new Date(a.createdAt || a.id).getTime();
        return bTime - aTime;
      });
    }

    return result;
  }, [products, selectedCategory, searchTerm, sortOption]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.min(Math.max(newPage, 1), totalPages));
  };

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * productsPerPage;
    const end = start + productsPerPage;

    return filteredProducts.slice(start, end);
  }, [filteredProducts, safeCurrentPage, productsPerPage]);

  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <ScrollReveal as="section" className="bg-stone-900 py-14 text-white sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
              chyomee — the collection
            </p>

            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
              Find your next favourite.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Explore the collection, discover new pieces and save the styles you love.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Shop Content */}
      <ScrollReveal as="section" className="py-10 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* Search + Sort + Category */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-4 sm:flex-row lg:max-w-[78%] lg:items-center">
              <div className="relative w-full sm:max-w-90 lg:max-w-104">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search products..."
                  className="h-12 w-full rounded-none border border-stone-300 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
                />
              </div>

              <div className="relative w-full sm:max-w-55">
                <select
                  value={selectedCategory}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className="h-12 w-full appearance-none rounded-none border border-stone-300 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span className="hidden text-sm font-medium text-slate-500 sm:block">
                Sort by
              </span>

              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(event) => handleSortChange(event.target.value)}
                  className="h-12 appearance-none rounded-none border border-stone-300 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
                >
                  <option value="featured">Featured</option>
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div>
              {/* Result Header */}
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-serif text-2xl text-stone-900">
                    {selectedCategory}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredProducts.length} item
                    {filteredProducts.length !== 1 ? "s" : ""} to explore
                  </p>
                </div>

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="self-start text-sm font-semibold text-stone-700 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>

              {/* Product Grid */}
              {productsLoading ? (
                <p className="text-gray-500">Loading products…</p>
              ) : productsError ? (
                <p role="alert" className="text-red-700">
                  {productsError}
                </p>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-5">
                    {paginatedProducts.map((product, index) => (
                      <ScrollReveal
                        as="article"
                        key={product.id}
                        delay={(index % 8) * 0.045}
                        className="group flex h-full flex-col overflow-hidden bg-white"
                      >
                        {/* Product Image */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                          <Link
                            to={`/product/${product.id}`}
                            className="block h-full w-full"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                            />
                          </Link>

                          <button
                            type="button"
                            onClick={() => toggleFavorite(product)}
                            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:bg-white"
                            aria-label={`Save ${product.name} to favorites`}
                          >
                            <Heart
                              size={15}
                              fill={
                                isFavorite(product.id) ? "currentColor" : "none"
                              }
                              className={
                                isFavorite(product.id)
                                  ? "text-red-500"
                                  : "text-slate-700"
                              }
                            />
                          </button>
                        </div>

                        <div className="flex flex-1 flex-col pt-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
                              {product.category}
                            </span>
                          </div>

                          <Link
                            to={`/product/${product.id}`}
                            className="mt-2 block"
                          >
                            <h3 className="text-sm font-medium leading-snug text-slate-900 transition hover:text-stone-500 sm:text-base">
                              {product.name}
                            </h3>
                          </Link>

                          <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-slate-600">
                            {product.description}
                          </p>

                          <div className="mt-3 flex flex-col gap-2">
                            <span className="text-base font-semibold text-stone-900 sm:text-lg">
                              {formatPrice(product.price)}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              className="inline-flex w-full items-center justify-center gap-2 bg-stone-900 px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-stone-700"
                            >
                              <ShoppingCart size={14} />
                              {addedProductId === product.id
                                ? "Added"
                                : product.sizes?.length ||
                                    product.colors?.length ||
                                    product.styles?.length
                                  ? "Choose options"
                                  : "Add to Bag"}
                            </button>
                          </div>

                          {addedProductId === product.id && (
                            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-700">
                              <Check size={13} />
                              Added to cart
                            </div>
                          )}
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>

                      <span className="px-3 text-sm font-medium text-slate-600">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <p className="text-lg font-semibold text-slate-800">
                    No products match your filters.
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Try another category or search term.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </main>
  );
}

export default Shop;
