import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProducts } from "../../../services/productService";
import { getCategoryBySlug } from "../../../services/categoryService";
import { fashionImages } from "../../../data/fashionImages";

const CategoryByProduct = () => {
  const { category } = useParams();
  const [categoryName, setCategoryName] = useState("");
  const [products, setProducts] = useState([]);
  const [loadedCategory, setLoadedCategory] = useState(null);
  const [error, setError] = useState("");
  const loading = Boolean(category) && loadedCategory !== category;

  useEffect(() => {
    if (!category) return undefined;

    let active = true;

    const loadCategory = async () => {
      try {
        const { data: selectedCategory } = await getCategoryBySlug(category);
        if (!selectedCategory?.name) {
          throw new Error("Category not found.");
        }
        const { data } = await getProducts({
          category: selectedCategory.name,
        });
        if (!active) return;
        setCategoryName(selectedCategory.name);
        setProducts(Array.isArray(data) ? data : []);
        setError("");
        setLoadedCategory(category);
      } catch (requestError) {
        if (active) {
          setProducts([]);
          setError(requestError.message || "Failed to load this category.");
          setLoadedCategory(category);
        }
      }
    };

    void loadCategory();
    return () => {
      active = false;
    };
  }, [category]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-green-950 px-4 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold md:text-4xl">
              {categoryName || "Products"}
            </h1>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-4 py-12">
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        </main>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-green-950 px-4 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold md:text-4xl">
              {categoryName || "Products"}
            </h1>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-4 py-12">
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-lg text-gray-600">{error}</p>
          </div>
        </main>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-green-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url("${fashionImages[3]}")`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Link
            to="/categories"
            className="mb-6 inline-flex items-center text-sm font-semibold text-yellow-400 transition hover:text-yellow-300"
          >
            ← Back to Categories
          </Link>

          <span className="block text-sm font-bold tracking-[3px] text-yellow-400">
            chyomee
          </span>

          <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
            {categoryName || "Products"}
          </h1>

          <p className="mt-4 max-w-2xl text-white/75">
            Explore our selection of{" "}
            {categoryName.toLowerCase() || "products"}{" "}
            curated for everyday style.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-green-700">
              Our Products
            </span>

            <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
              {categoryName || "Products"}
            </h2>
          </div>

          <p className="text-sm text-gray-500">
            {products.length} {products.length === 1 ? "product" : "products"}{" "}
            available
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Product Image */}
                <Link to={`/product/${product.id}`}>
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain object-center p-2 transition duration-500 group-hover:scale-105 sm:p-4"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-green-700 px-3 py-1 text-xs font-bold text-white">
                      New
                    </span>
                  </div>
                </Link>

                {/* Product Details */}
                <div className="p-5">
                  <span className="text-xs font-bold uppercase tracking-wide text-green-700">
                    {categoryName}
                  </span>

                  <h3 className="mt-1 text-lg font-bold text-gray-900">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-green-800">
                      {"\u20A6"}
                      {Number(product.price).toLocaleString("en-NG")}
                    </span>

                    <Link
                      to={`/product/${product.id}`}
                      className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
              🛍️
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              No Products Found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              We currently don't have products available in this category.
              Please check back later.
            </p>

            <Link
              to="/categories"
              className="mt-6 inline-flex rounded-lg bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
            >
              Browse Categories
            </Link>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-green-900 px-5 py-14 text-center sm:px-8">
        <h2 className="text-3xl font-extrabold text-white">
          Looking for Something Else?
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-white/75">
          Explore more of the chyomee collection and find a piece that feels
          like you.
        </p>

        <Link
          to="/categories"
          className="mt-6 inline-flex rounded-lg bg-yellow-500 px-7 py-3 font-bold text-green-950 transition hover:bg-yellow-400"
        >
          View All Categories
        </Link>
      </section>
    </main>
  );
};

export default CategoryByProduct;
