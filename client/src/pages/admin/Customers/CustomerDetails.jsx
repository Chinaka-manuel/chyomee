import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCustomer, updateCustomer } from "../../../services/adminService";

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;
    getCustomer(id)
      .then(({ data }) => {
        if (active) setCustomer(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const toggleCustomerStatus = async () => {
    if (!customer || !id || updatingStatus) return;

    setUpdatingStatus(true);
    setError("");
    try {
      const status = customer.status === "Active" ? "Inactive" : "Active";
      const { data } = await updateCustomer(id, { status });
      setCustomer((current) => ({ ...current, ...data }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!customer) {
    const message = error || (id ? "Loading customer…" : "Select a customer from the customers list to view details.");
    return <p role={error ? "alert" : "status"} className="p-6">{message}</p>;
  }

  const orders = customer.orders ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          to="/admin/customers"
          className="text-sm text-green-700 hover:text-green-800"
        >
          ← Back to Customers
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Customer Details
          </h1>

          <p className="text-gray-500 mt-1">
            View customer information and order history.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold">
              {customer.name
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {customer.name}
              </h2>

              <span className="inline-block mt-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                {customer.status}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900 mt-1">
                {customer.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900 mt-1">
                {customer.phone}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-gray-900 mt-1">
                {customer.address || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Customer Since</p>
              <p className="font-medium text-gray-900 mt-1">
                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats + Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {customer.orderCount}
              </p>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-5">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                ₦{Number(customer.totalSpent).toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-5">
              <p className="text-sm text-gray-500">Average Order</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₦
                {Math.round(
                  customer.orderCount ? customer.totalSpent / customer.orderCount : 0
                ).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Order History
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Order ID
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Date
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Total
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Status
                    </th>

                    <th className="text-right px-6 py-4 text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {order.id}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {order.date}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        ₦{order.total.toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-sm text-green-700 hover:text-green-800 font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${customer.email}`}
              className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              Contact Customer
            </a>

            <button
              type="button"
              onClick={toggleCustomerStatus}
              disabled={updatingStatus}
              className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatingStatus
                ? "Updating…"
                : customer.status === "Active"
                  ? "Deactivate Customer"
                  : "Activate Customer"}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;