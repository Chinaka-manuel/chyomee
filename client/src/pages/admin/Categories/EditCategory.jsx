import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCategory, updateCategory } from "../../../services/adminService";
import { handleLocalImageUpload } from "../../../utils/localImageUpload";

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "category";

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    status: "Active",
  });

  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCategory(id)
      .then((res) => {
        if (!active) return;
        const data = res?.data || null;
        setCategory(data);
        if (data) {
          setFormData({
            name: data.name || "",
            slug: data.slug || "",
            description: data.description || "",
            image: data.image || "",
            status: data.status || "Active",
          });
          setPreview(data.image || "");
        }
      })
      .catch((err) => {
        if (active) setFetchError(err.message || "Failed to load category");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading category...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6">
        <Link
          to="/admin/categories"
          className="text-sm font-medium text-green-600 hover:text-green-800"
        >
          ← Back to Categories
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {fetchError ? "Error loading category" : "Category Not Found"}
        </h1>
        {fetchError && (
          <p className="mt-2 text-sm text-red-600">{fetchError}</p>
        )}
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && !prev.slug ? { slug: slugify(value) } : {}),
    }));
  };

  const handleImageUpload = async (e) => {
    setError("");
    setUploadingImage(true);
    try {
      const uploadedUrl = await handleLocalImageUpload(e, (nextImage) => {
        setFormData((prev) => ({ ...prev, image: nextImage }));
        setPreview(nextImage);
      });
      if (!uploadedUrl && formData.image) setPreview(formData.image);
    } catch (requestError) {
      setError(requestError.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadingImage) return;
    setSaving(true);
    setError("");
    try {
      await updateCategory(id, {
        ...formData,
        name: formData.name.trim() || category.name,
        slug: formData.slug.trim() || slugify(formData.name || category.name),
        description: formData.description || "",
        image: formData.image || "",
        status: formData.status || "Active",
      });
      navigate("/admin/categories");
    } catch (requestError) {
      setError(requestError.message || "Unable to update category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin/categories"
          className="text-sm font-medium text-green-600 hover:text-green-800"
        >
          ← Back to Categories
        </Link>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Category</h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the category details and public storefront display.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {error && (
            <p role="alert" className="mb-4 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="fresh-vegetables"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe this category..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />

              <p className="mt-2 text-xs text-gray-500">
                {uploadingImage
                  ? "Uploading image to Cloudinary…"
                  : "Upload a new image to Cloudinary to replace the current image."}
              </p>

              {preview && (
                <img
                  src={preview}
                  alt="Category preview"
                  className="mt-4 h-48 w-48 rounded-xl border border-gray-200 bg-gray-50 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Link
              to="/admin/categories"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:bg-gray-400"
            >
              {saving ? "Saving…" : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
