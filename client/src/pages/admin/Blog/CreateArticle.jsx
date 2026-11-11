import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBlogPost } from "../../../services/adminService";
import { handleLocalImageUpload } from "../../../utils/localImageUpload";

const CreateArticle = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "Style Advice",
    author: "",
    excerpt: "",
    content: "",
    image: "",
    status: "Draft",
    featuredOnHomepage: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = [
    "Style Advice",
    "Outfit Inspiration",
    "Care Guide",
    "Trends",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    setError("");
    try {
      setUploadingImage(true);
      const uploadedUrl = await handleLocalImageUpload(e, (nextImage) => {
        setFormData((prev) => ({ ...prev, image: nextImage }));
      });

      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      }
    } catch (requestError) {
      setError(requestError.message || "Image upload failed.");
      if (formData.image) {
        setFormData((prev) => ({ ...prev, image: prev.image }));
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createBlogPost({
        ...formData,
        author: formData.author || "Admin",
        date: new Date().toISOString(),
      });
      navigate("/admin/blog");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link
          to="/admin/blog"
          className="text-sm text-green-700 hover:text-green-800"
        >
          ← Back to Blog Management
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4">
          Create Article
        </h1>

        <p className="text-gray-500 mt-1">
          Create and publish a style article for chyomee.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border p-5 sm:p-8"
      >
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter article title"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Excerpt
              </label>

              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                placeholder="Write a short description of the article..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article Content
              </label>

              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="14"
                placeholder="Write your article here..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-y focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Author
              </label>

              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Author name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Featured Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full border border-dashed border-gray-300 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                {uploadingImage
                  ? "Uploading image…"
                  : "Choose a local image to upload."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Draft">Save as Draft</option>
                <option value="Published">Publish Article</option>
              </select>
            </div>

            <div className="mt-3">
              <label className="inline-flex items-center gap-3">
                <input
                  type="checkbox"
                  name="featuredOnHomepage"
                  checked={!!formData.featuredOnHomepage}
                  onChange={handleChange}
                  disabled={formData.status !== "Published"}
                  className="w-4 h-4"
                />
                <span className="text-sm">Feature on homepage</span>
              </label>
              {formData.status !== "Published" && (
                <p className="mt-2 text-xs text-gray-500">
                  Articles must be published to appear on the homepage.
                </p>
              )}
            </div>

            {/* Preview */}
            {formData.image && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Image Preview
                </p>

                <img
                  src={formData.image}
                  alt="Article preview"
                  className="w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/blog")}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
          >
            {saving
              ? "Saving..."
              : formData.status === "Published"
                ? "Publish Article"
                : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateArticle;
