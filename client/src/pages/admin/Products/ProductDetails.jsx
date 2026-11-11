import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../../../services/adminService";

const formatCurrency = (amount) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`;

const normalizeProduct = (product) => ({
  ...product,
  id: product?.id ?? product?._id ?? "",
  category: product?.category ?? "",
  name: product?.name ?? "Unnamed Product",
});

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let active = true;

    getProduct(id)
      .then(({ data }) => {
        if (!active) return;
        setProduct(normalizeProduct(data));
        setError("");
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "Unable to load product details.");
          setProduct(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (!product && loading) {
    return (
      <p role="status" className="p-6">
        Loading product…
      </p>
    );
  }

  if (!product) {
    return (
      <p role={error ? "alert" : "status"} className="p-6">
        {error || "Select a product from the products list to view details."}
      </p>
    );
  }

  const stockStatus =
    product.stock === 0
      ? "Out of Stock"
      : product.stock <= 10
        ? "Low Stock"
        : "In Stock";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/products"
            className="text-sm font-medium text-green-600 hover:text-green-800"
          >
            ← Back to Products
          </Link>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Product Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View complete information about this product.
          </p>
        </div>

        <Link
          to={`/admin/products/edit/${id}`}
          className="w-fit rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Edit Product
        </Link>
      </div>

      {/* Product Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Product Image */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            {(product.images?.length ? product.images : [product.image]).map(
              (image, index) => (
                <div
                  key={image}
                  className="relative aspect-square overflow-hidden rounded-xl bg-gray-50"
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="h-full w-full object-contain p-2"
                  />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
                      Cover
                    </span>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">{product.category}</p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {product.name}
              </h2>
            </div>

            <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {product.status}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-sm leading-6 text-gray-600">
              {product.description}
            </p>
          </div>
          {product.sizes?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Available sizes
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(product.colors?.length > 0 || product.styles?.length > 0) && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {product.colors?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Available colors
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.styles?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Available styles
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.styles.map((style) => (
                      <span
                        key={style}
                        className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-400">
                Price
              </p>
              <p className="mt-1 text-xl font-bold text-green-600">
                {formatCurrency(product.price)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-400">
                Stock
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {product.stock}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-400">
                Units Sold
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {product.sales ?? "—"}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t pt-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Inventory Status</span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  stockStatus === "In Stock"
                    ? "bg-green-100 text-green-700"
                    : stockStatus === "Low Stock"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {stockStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Product Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Product Information
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-500">Product ID</span>
              <span className="text-sm font-medium text-gray-900">
                {product.id}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-500">Category</span>
              <span className="text-sm font-medium text-gray-900">
                {product.category}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-sm font-medium text-green-600">
                {product.status}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-500">Created</span>
              <span className="text-sm font-medium text-gray-900">
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleString()
                  : "—"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-500">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">
                {product.updatedAt
                  ? new Date(product.updatedAt).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Sales Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Sales Information</h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Units Sold</span>
              <span className="text-sm font-semibold text-gray-900">
                {product.sales ?? 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Current Stock</span>
              <span className="text-sm font-semibold text-gray-900">
                {product.stock} units
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Revenue Generated</span>
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(
                  (product.sales ?? 0) * Number(product.price || 0),
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to={`/admin/products/edit/${id}`}
          className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Edit Product
        </Link>

        <Link
          to="/admin/inventory"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          View Inventory
        </Link>

        <Link
          to="/admin/products"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          All Products
        </Link>
      </div>
    </div>
  );
}
