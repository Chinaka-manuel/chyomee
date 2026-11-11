import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteCategory, getCategories, updateCategory } from "../../../services/adminService";
import { createCategory } from "../../../services/adminService";
import { fashionCategories } from "../../../data/fashionCategories";
import { useCategoryContext } from "../../../context/CategoryContext";

const Categories = () => {
  const navigate = useNavigate();
  const { setCategories: setAvailableCategories } = useCategoryContext();

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || category.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (confirmed) {
      try {
        await deleteCategory(id);
        setCategories((current) => current.filter((category) => category.id !== id));
      } catch (requestError) {
        setError(requestError.message);
      }
    }
  };

  const toggleStatus = async (id) => {
    const category = categories.find((item) => item.id === id);
    if (!category) return;
    try {
      const { data } = await updateCategory(id, {
        status: category.status === "Active" ? "Inactive" : "Active",
      });
      setCategories((current) => current.map((item) => item.id === id ? data : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const seedFashionCategories = async () => {
    setSeeding(true);
    setError("");
    setSeedMessage("");
    let added = 0;
    try {
      const existing = new Set(categories.map((category) => category.name.toLowerCase()));
      for (const [name, description] of fashionCategories) {
        if (existing.has(name.toLowerCase())) continue;
        const { data } = await createCategory({ name, description, status: "Active" });
        setCategories((current) => [...current, data]);
        setAvailableCategories((current) => [...current, data]);
        existing.add(name.toLowerCase());
        added += 1;
      }
      setSeedMessage(added ? `Added ${added} fashion categories.` : "All standard fashion categories are already present.");
    } catch (requestError) {
      setError(requestError.message || `Added ${added} categories before an error. Retry to add the remaining categories.`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Categories
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your store product categories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
          {seedMessage && <p role="status" className="mb-4 text-sm text-green-700">{seedMessage}</p>}
          <button type="button" disabled={seeding} onClick={seedFashionCategories} className="inline-flex items-center justify-center rounded-lg border border-green-700 px-5 py-3 font-semibold text-green-800 transition hover:bg-green-50 disabled:cursor-wait disabled:opacity-60">
            {seeding ? "Adding categories…" : "Add standard fashion categories"}
          </button>
        </div>

        <Link
          to="/admin/categories/add"
          className="inline-flex items-center justify-center bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-semibold transition"
        >
          + Add Category
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Categories</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {categories.length}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active</p>

          <h2 className="text-2xl font-bold text-green-700 mt-1">
            {
              categories.filter(
                (category) => category.status === "Active"
              ).length
            }
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive</p>

          <h2 className="text-2xl font-bold text-red-600 mt-1">
            {
              categories.filter(
                (category) => category.status === "Inactive"
              ).length
            }
          </h2>
        </div>
      </div>

      {/* Search / Filter */}
      <div className="bg-white border rounded-xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Categories Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-187.5">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Category
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Description
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Products
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Status
                </th>

                <th className="text-right px-6 py-4 text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {category.name}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {category.description}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {category.products}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(category.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          category.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {category.status}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/categories/edit/${category.id}`
                            )
                          }
                          className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(category.id)
                          }
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
                  <td
                    colSpan="5"
                    className="text-center py-12 text-gray-500"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;