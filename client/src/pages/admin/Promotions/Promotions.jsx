import { useEffect, useState } from "react";
import { createPromotion, deletePromotion as removePromotion, getPromotions, updatePromotion } from "../../../services/adminService";

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", type: "Percentage", value: "", startDate: "", endDate: "" });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    getPromotions()
      .then(({ data }) => setPromotions(data))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);

  const toggleStatus = async (id) => {
    const promotion = promotions.find((item) => item.id === id);
    if (!promotion) return;
    try {
      const { data } = await updatePromotion(id, {
        status: promotion.status === "Active" ? "Inactive" : "Active",
      });
      setPromotions((current) => current.map((item) => item.id === id ? data : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deletePromotion = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this promotion?"
    );

    if (!confirmed) return;

    try {
      await removePromotion(id);
      setPromotions((current) => current.filter((promotion) => promotion.id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const submitPromotion = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        discount: Number(form.value),
        status: editingPromotion?.status ?? "Active",
      };
      const { data } = editingPromotion
        ? await updatePromotion(editingPromotion.id, payload)
        : await createPromotion(payload);
      setPromotions((current) => editingPromotion
        ? current.map((promotion) => promotion.id === editingPromotion.id ? data : promotion)
        : [data, ...current]);
      setEditingPromotion(null);
      setForm({ name: "", code: "", type: "Percentage", value: "", startDate: "", endDate: "" });
      setShowForm(false);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const editPromotion = (promotion) => {
    setEditingPromotion(promotion);
    setForm({
      name: promotion.name,
      code: promotion.code,
      type: promotion.type ?? "Percentage",
      value: String(promotion.value ?? promotion.discount ?? ""),
      startDate: promotion.startDate ?? "",
      endDate: promotion.endDate ?? "",
    });
    setShowForm(true);
  };

  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch =
      promotion.name.toLowerCase().includes(search.toLowerCase()) ||
      promotion.code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || promotion.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter(
    (promotion) => promotion.status === "Active"
  ).length;
  const inactivePromotions = promotions.filter(
    (promotion) => promotion.status === "Inactive"
  ).length;
  const expiredPromotions = promotions.filter(
    (promotion) => promotion.status === "Expired"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage discounts and promotional offers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingPromotion(null);
            setShowForm((visible) => !visible);
          }}
          className="w-fit rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
        >
          {showForm && !editingPromotion ? "Close Form" : "+ Create Promotion"}
        </button>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
      {showForm && (
        <form onSubmit={submitPromotion} className="mb-6 grid gap-3 rounded-xl border bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
          <input required maxLength="120" placeholder="Promotion name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border px-3 py-2" />
          <input required maxLength="64" placeholder="Promotion code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="rounded-lg border px-3 py-2" />
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="rounded-lg border px-3 py-2">
            <option value="Percentage">Percentage</option>
            <option value="Fixed">Fixed amount</option>
          </select>
          <input required type="number" min="0" placeholder="Discount value" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} className="rounded-lg border px-3 py-2" />
          <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="rounded-lg border px-3 py-2" />
          <input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="rounded-lg border px-3 py-2" />
          <button type="submit" className="rounded-lg bg-green-700 px-4 py-2 text-white">{editingPromotion ? "Update promotion" : "Save promotion"}</button>
        </form>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Promotions</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {totalPromotions}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {activePromotions}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-600">
            {inactivePromotions}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Expired</p>
          <h2 className="mt-2 text-2xl font-bold text-red-600">
            {expiredPromotions}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search promotion or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Promotion
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Code
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Discount
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Duration
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Usage
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
              {filteredPromotions.map((promotion) => (
                <tr key={promotion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {promotion.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Promotion #{promotion.id}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                      {promotion.code}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {promotion.type === "Percentage"
                      ? `${promotion.value}%`
                      : formatCurrency(promotion.value)}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{promotion.startDate}</div>
                    <div className="text-xs text-gray-400">
                      to {promotion.endDate}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {promotion.usage} uses
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(promotion.id)}
                      disabled={promotion.status === "Expired"}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        promotion.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : promotion.status === "Expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {promotion.status}
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => editPromotion(promotion)}
                        className="text-sm font-medium text-green-600 hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deletePromotion(promotion.id)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPromotions.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No promotions found.
          </div>
        )}
      </div>

      {/* Backend Note */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        Promotion data is currently stored locally for development. Connect
        this page to the backend API when the server is ready.
      </div>
    </div>
  );
}