import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder, confirmPayment, updateOrderStatus } from "../../../services/adminService";

const formatCurrency = (amount) =>
  `₦${amount.toLocaleString("en-NG")}`;

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionReference, setTransactionReference] = useState("");
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    if (!id) return;
    getOrder(id)
      .then(({ data }) => setOrder(data))
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  if (!order) {
    const message = error || (id ? "Loading order…" : "Select an order from the orders list to view details.");
    return <p role={error ? "alert" : "status"} className="p-6">{message}</p>;
  }

  const customer = typeof order.customer === "object"
    ? order.customer
    : { name: order.customer ?? "—", email: order.email ?? "—" };
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const total = Number(order.total ?? subtotal);
  const canConfirmPayment =
    order.paymentStatus !== "Paid" &&
    order.status !== "Cancelled" &&
    order.paymentMethod === "Bank Transfer";

  const handleConfirmPayment = async () => {
    setConfirming(true);
    setConfirmError("");
    try {
      const { data } = await confirmPayment(order.id, transactionReference);
      setOrder(data);
      setShowConfirmModal(false);
      setTransactionReference("");
    } catch (requestError) {
      setConfirmError(requestError.message || "Could not confirm payment.");
    } finally {
      setConfirming(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const { data } = await updateOrderStatus(order.id, newStatus);
      setOrder(data);
    } catch (requestError) {
      setError(requestError.message || "Could not update order status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/orders"
            className="text-sm font-medium text-green-600 hover:text-green-800"
          >
            ← Back to Orders
          </Link>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Order Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Order #{id || order.id}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            order.status === "Delivered"
              ? "bg-green-100 text-green-700"
              : order.status === "Processing"
                ? "bg-blue-100 text-blue-700"
                : order.status === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {order.status}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">{error}</p>
      )}

      {/* Order Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Customer Information
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Name
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {customer.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Email
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {customer.email || order.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Phone
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {customer.phone ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Delivery Address
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {order.deliveryAddress
                  ? `${order.deliveryAddress.address || ""}, ${order.deliveryAddress.city || ""}, ${order.deliveryAddress.state || ""}`
                  : "—"}
              </p>
            </div>

            <Link
              to="/admin/customers"
              className="inline-block text-sm font-semibold text-green-600 hover:text-green-800"
            >
              View Customer
            </Link>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Payment Information
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Payment Method
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {order.paymentMethod ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Payment Status
              </p>
              <span
                className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  order.paymentStatus === "Paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.paymentStatus ?? order.payment ?? "—"}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Payment Reference
              </p>
              <p className="mt-1 break-all text-sm font-mono text-gray-900">
                {order.paymentReference || "—"}
              </p>
            </div>

            {order.paymentSubmittedAt && order.paymentStatus !== "Paid" && (
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs font-semibold uppercase text-blue-700">
                  Customer reported bank transfer
                </p>
                <p className="mt-1 text-sm text-blue-900">
                  {new Date(order.paymentSubmittedAt).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  Payment remains pending until you verify and approve it.
                </p>
              </div>
            )}

            {order.paidAt && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Paid On
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {new Date(order.paidAt).toLocaleString()}
                </p>
              </div>
            )}

            {order.receiptNumber && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Receipt Number
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {order.receiptNumber}
                </p>
              </div>
            )}

            {order.paymentConfirmationDate && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Confirmed On
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {new Date(order.paymentConfirmationDate).toLocaleString()}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Order Date
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {order.date}
              </p>
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Order Summary
          </h2>

          <div className="mt-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">
                  Total
                </span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {canConfirmPayment && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="mt-6 w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
            >
              Confirm Payment
            </button>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-bold text-gray-900">
            Ordered Products
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Product
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Price
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Quantity
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <tr key={item.id ?? `${item.name}-${index}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg bg-gray-50 object-contain p-1"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        {(item.size || item.color || item.style) && (
                          <p className="mt-1 text-xs text-gray-500">
                            {[
                              item.size && `Size: ${item.size}`,
                              item.color && `Color: ${item.color}`,
                              item.style && `Style: ${item.style}`,
                            ].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {formatCurrency(item.price)}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {item.quantity}
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Actions */}
      <div className="flex flex-wrap gap-3">
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 outline-none hover:bg-gray-50"
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Confirm Payment Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Confirm Bank Transfer Payment
            </h3>

            <p className="mb-4 text-sm text-gray-600">
              Verify the transfer before approving it. This will mark the
              order as paid and email the official receipt to the customer and
              admin.
            </p>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Transaction Reference
              </label>
              <input
                type="text"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="e.g. TNX-20261012-001"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-green-700 focus:bg-white"
                maxLength={200}
              />
            </div>

            {confirmError && (
              <p role="alert" className="mb-3 text-sm text-red-700">
                {confirmError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={confirming}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
              >
                {confirming ? "Confirming…" : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
