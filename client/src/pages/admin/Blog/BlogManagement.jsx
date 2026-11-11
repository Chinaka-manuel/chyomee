import { useEffect, useState } from "react";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPosts,
  updateBlogPost,
} from "../../../services/adminService";
import { handleLocalImageUpload } from "../../../utils/localImageUpload";

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getBlogPosts()
      .then(({ data }) => setPosts(data))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Style Advice",
    author: "",
    content: "",
    image: "",
    status: "Draft",
    featuredOnHomepage: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = [
    "Style Advice",
    "Outfit Inspiration",
    "Care Guide",
    "Trends",
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory = category === "All" || post.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e) => {
    setError("");
    try {
      setUploadingImage(true);
      const uploadedUrl = await handleLocalImageUpload(e, (nextImage) => {
        setFormData((prev) => ({ ...prev, image: nextImage }));
      });
      if (uploadedUrl) setFormData((prev) => ({ ...prev, image: uploadedUrl }));
    } catch (requestError) {
      setError(requestError.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = editingPost
        ? await updateBlogPost(editingPost.id, formData)
        : await createBlogPost({
            ...formData,
            author: formData.author || "Admin",
            date: new Date().toISOString(),
          });
      if (editingPost) {
        setPosts((current) =>
          current.map((post) =>
            post.id === editingPost.id ? result.data : post,
          ),
        );
      } else {
        setPosts((current) => [result.data, ...current]);
      }
      setError("");
      resetForm();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Style Advice",
      author: "",
      content: "",
      status: "Draft",
      featuredOnHomepage: false,
    });

    setEditingPost(null);
    setShowForm(false);
  };

  const handleEdit = (post) => {
    setEditingPost(post);

    setFormData({
      title: post.title,
      category: post.category,
      author: post.author,
      content: post.content ?? "",
      image: post.image ?? "",
      status: post.status,
      featuredOnHomepage: !!post.featuredOnHomepage,
      date: post.date ?? "",
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteBlogPost(id);
        setPosts((current) => current.filter((post) => post.id !== id));
      } catch (requestError) {
        setError(requestError.message);
      }
    }
  };

  const toggleStatus = async (id) => {
    const post = posts.find((item) => item.id === id);
    if (!post) return;
    try {
      const { data } = await updateBlogPost(id, {
        status: post.status === "Published" ? "Draft" : "Published",
      });
      setPosts((current) =>
        current.map((item) => (item.id === id ? data : item)),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const toggleFeatured = async (post) => {
    setError("");
    const enabling = !post.featuredOnHomepage;
    // quick client-side check: count published featured posts (excluding current)
    const publishedFeaturedCount = posts.filter(
      (p) =>
        p.status === "Published" && p.featuredOnHomepage && p.id !== post.id,
    ).length;

    if (
      enabling &&
      post.status === "Published" &&
      publishedFeaturedCount >= 3
    ) {
      setError(
        "Homepage can display only three published featured articles. Deselect another first.",
      );
      return;
    }

    try {
      const { data } = await updateBlogPost(post.id, {
        featuredOnHomepage: enabling,
      });
      setPosts((current) => current.map((p) => (p.id === post.id ? data : p)));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Blog Management
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage chyomee style articles.
          </p>
        </div>
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-semibold transition"
        >
          + Add New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-gray-500 text-sm">Total Posts</p>
          <h2 className="text-2xl font-bold mt-1">{posts.length}</h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-gray-500 text-sm">Published</p>
          <h2 className="text-2xl font-bold text-green-700 mt-1">
            {posts.filter((post) => post.status === "Published").length}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-gray-500 text-sm">Drafts</p>
          <h2 className="text-2xl font-bold text-yellow-600 mt-1">
            {posts.filter((post) => post.status === "Draft").length}
          </h2>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search blog posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="All">All Categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Blog Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Title
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Category
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Author
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Homepage
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {post.title}
                    </td>

                    <td className="px-6 py-4 text-gray-600">{post.category}</td>

                    <td className="px-6 py-4 text-gray-600">{post.author}</td>

                    <td className="px-6 py-4 text-gray-600">{post.date}</td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(post.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          post.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {post.status}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!post.featuredOnHomepage}
                          onChange={() => toggleFeatured(post)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Featured</span>
                      </label>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(post.id)}
                          className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No blog posts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPost ? "Edit Blog Post" : "Create Blog Post"}
              </h2>

              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Post Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter blog title"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>

                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="7"
                  required
                  placeholder="Write your blog post..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
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

                {formData.image && (
                  <div className="mt-3">
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

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="mt-3">
                <label className="inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!formData.featuredOnHomepage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featuredOnHomepage: e.target.checked,
                      }))
                    }
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

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold"
                >
                  {editingPost ? "Update Post" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
