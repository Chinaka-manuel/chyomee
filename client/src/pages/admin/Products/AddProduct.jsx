import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProduct } from "../../../services/adminService";
import { useCategoryContext } from "../../../context/CategoryContext";
import ProductImageManager from "../../../components/admin/ProductImageManager";
import ProductSizeOptionsField from "../../../components/admin/ProductSizeOptionsField";
import ProductVariantOptionsField from "../../../components/admin/ProductVariantOptionsField";

const defaultFormData = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  images: [],
  sizes: [],
  colors: [],
  styles: [],
  madeToMeasure: false,
  isFabric: false,
  status: "Active",
};

export default function AddProduct() {
  const navigate = useNavigate();
  const { categories = [] } = useCategoryContext();
  const categoryOptions =
    categories
      .filter((category) => category?.name)
      .map((category) => category.name) || [];

  const [formData, setFormData] = useState(defaultFormData);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      images: formData.images,
      image: formData.images[0] || "",
      sizes: formData.sizes,
      colors: formData.colors,
      styles: formData.styles,
      madeToMeasure: formData.madeToMeasure,
      isFabric: formData.isFabric,
      status: formData.status,
    };

    if (!payload.name || !payload.category || !payload.description) {
      setError("Name, category, and description are required.");
      setSaving(false);
      return;
    }

    if (!payload.images.length) {
      setError("Please upload at least one product image before saving.");
      setSaving(false);
      return;
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      setError("Price must be a valid non-negative number.");
      setSaving(false);
      return;
    }

    if (!Number.isInteger(payload.stock) || payload.stock < 0) {
      setError("Stock must be a whole non-negative number.");
      setSaving(false);
      return;
    }

    try {
      await createProduct(payload);
      navigate("/admin/products");
    } catch (requestError) {
      setError(requestError.message || "Unable to create product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/products"
          className="text-sm font-medium text-green-600 hover:text-green-800"
        >
          ← Back to Products
        </Link>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">Add Product</h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a new product to your store.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Product Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Relaxed Linen Shirt"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            >
              <option value="">Select category</option>
              {categoryOptions.map((categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Price (₦)
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 3500"
              min="0"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Stock Quantity
            </label>

            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="e.g. 50"
              min="0"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Description */}
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Describe the product..."
              required
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            />
          </div>

          <div className="lg:col-span-2">
            <ProductImageManager
              images={formData.images}
              onChange={(images) =>
                setFormData((current) => ({ ...current, images }))
              }
              onUploadingChange={setUploadingImage}
            />
          </div>
          <div className="lg:col-span-2">
            <ProductSizeOptionsField
              sizes={formData.sizes}
              onChange={(sizes) =>
                setFormData((current) => ({ ...current, sizes }))
              }
            />
          </div>
          <div className="lg:col-span-2">
            <ProductVariantOptionsField
              colors={formData.colors}
              styles={formData.styles}
              onColorsChange={(colors) =>
                setFormData((current) => ({ ...current, colors }))
              }
              onStylesChange={(styles) =>
                setFormData((current) => ({ ...current, styles }))
              }
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:gap-8">
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.madeToMeasure}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    madeToMeasure: event.target.checked,
                  }))
                }
                className="mt-1 accent-green-700"
              />
              <span>
                <span className="block font-semibold">Made to measure</span>
                <span className="text-gray-500">Allow customers to request this garment with their measurements.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.isFabric}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    isFabric: event.target.checked,
                  }))
                }
                className="mt-1 accent-green-700"
              />
              <span>
                <span className="block font-semibold">Fabric / textile</span>
                <span className="text-gray-500">Make this item selectable as catalog fabric for custom orders.</span>
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/admin/products"
            className="rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {saving ? "Saving…" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
