import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteProduct as removeProduct,
  getProducts,
  updateProduct,
} from "../../../services/adminService";

const normalizeProduct = (product) => ({
  ...product,
  id: product?.id ?? product?._id ?? "",
  category: product?.category ?? "",
  name: product?.name ?? "Unnamed Product",
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getProducts()
      .then(({ data }) => {
        if (!active) return;
        const nextProducts = Array.isArray(data)
          ? data.map(normalizeProduct)
          : [];
        setProducts(nextProducts);
        setError("");
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "Unable to load products.");
          setProducts([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);

  const getStockStatus = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "In Stock";
  };

  const toggleStatus = async (id) => {
    const product = products.find((item) => String(item.id) === String(id));
    if (!product) return;
    try {
      const { data } = await updateProduct(id, {
        status: product.status === "Active" ? "Inactive" : "Active",
      });
      setProducts((current) =>
        current.map((item) =>
          String(item.id) === String(id) ? normalizeProduct(data) : item,
        ),
      );
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to update product status.");
    }
  };

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      await removeProduct(id);
      setProducts((current) =>
        current.filter((product) => String(product.id) !== String(id)),
      );
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete product.");
    }
  };

  const categoryOptions = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  );

  const filteredProducts = products.filter((product) => {
    const productName = String(product.name || "").toLowerCase();
    const productCategory = String(product.category || "").toLowerCase();
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      productName.includes(searchText) ||
      productCategory.includes(searchText);

    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;

    const matchesStatus =
      statusFilter === "All" || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(
    (product) => product.status === "Active",
  ).length;
  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= 10,
  ).length;
  const outOfStock = products.filter((product) => product.stock === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all products in your store.
          </p>
        </div>
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Link
            to="/admin/inventory"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Inventory
          </Link>

          <Link
            to="/admin/products/add"
            className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
          >
            + Add Product
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Products</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {totalProducts}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Products</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {activeProducts}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Low Stock</p>
          <h2 className="mt-2 text-2xl font-bold text-yellow-600">
            {lowStock}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <h2 className="mt-2 text-2xl font-bold text-red-600">{outOfStock}</h2>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
          >
            <option value="All">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading products…
            </div>
          ) : (
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Product
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Stock Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);

                  return (
                    <tr key={String(product.id)} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || ""}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />

                          <div>
                            <Link
                              to={`/admin/products/${product.id}`}
                              className="font-medium text-gray-900 hover:text-green-700"
                            >
                              {product.name}
                            </Link>

                            <p className="text-xs text-gray-500">
                              ID: #{product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product.stock}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            stockStatus === "In Stock"
                              ? "bg-green-100 text-green-700"
                              : stockStatus === "Low Stock"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {stockStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(product.id)}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            product.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.status}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            View
                          </Link>

                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="text-sm font-medium text-green-600 hover:underline"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredProducts.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}
