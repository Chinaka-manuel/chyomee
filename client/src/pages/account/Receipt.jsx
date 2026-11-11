import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { downloadReceipt } from "../../services/checkoutService";
import { useAuth } from "../../context/useAuth";
import BrandLogo from "../../components/ui/BrandLogo";

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString("en-NG")}`;

export default function Receipt() {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    downloadReceipt(orderId)
      .then(({ data }) => setOrder(data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Please sign in</h1>
        <p className="mt-3 text-gray-600">You need to be logged in to view receipts.</p>
        <Link to="/account/login" className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white">Sign in</Link>
      </main>
    );
  }

  if (loading) {
    return <p role="status" className="p-6">Loading receipt…</p>;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Receipt not available</h1>
        <p role="alert" className="mt-3 text-gray-600">{error}</p>
        <Link to="/account/orders" className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white">View my orders</Link>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:py-16 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl print:max-w-none">
        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
          <div>
            <Link to="/account/orders" className="text-sm font-medium text-green-600 hover:text-green-800">
              ← Back to Orders
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Payment Receipt</h1>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            Print / Save
          </button>
        </section>

        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm sm:p-10 print:shadow-none">
          <div className="border-b border-gray-200 pb-6">
            <div className="inline-flex rounded-sm bg-stone-950 px-2 py-1">
              <BrandLogo className="h-7 w-auto" />
            </div>
            <p className="mt-1 text-sm text-gray-500">Official Payment Receipt</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">Receipt Number</p>
              <p className="mt-1 font-bold text-gray-900">{order.receiptNumber || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Order Number</p>
              <p className="mt-1 font-bold text-gray-900">{order.orderNumber || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment Reference</p>
              <p className="mt-1 break-all font-mono text-sm text-gray-900">{order.paymentReference || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment Method</p>
              <p className="mt-1 font-semibold text-gray-900">{order.paymentMethod || "Bank Transfer"}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
            <div className="mt-3 grid gap-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {order.customer?.name || order.customerName || "—"}</p>
              <p><span className="text-gray-500">Email:</span> {order.customer?.email || order.email || "—"}</p>
              <p><span className="text-gray-500">Phone:</span> {order.customer?.phone || "—"}</p>
              <p><span className="text-gray-500">Delivery:</span> {order.deliveryAddress ? `${order.deliveryAddress.address}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}` : "—"}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900">Items</h3>
            <div className="mt-3 space-y-2 text-sm">
              {(order.items || []).map((item, index) => (
                <div key={`${item.product || item.name}-${index}`} className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg bg-gray-50 object-contain p-1"
                    />
                  )}
                  <span>{item.name} × {item.quantity}</span>
                  <span className="ml-auto font-medium">{formatNaira(Number(item.price) * Number(item.quantity))}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatNaira(order.subtotal)}</span></div>
            <div className="flex justify-between text-lg font-bold"><span>Total Paid</span><span className="text-green-700">{formatNaira(order.total)}</span></div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>Paid on: {order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"}</p>
            <p>Confirmed by admin: {order.paymentConfirmationDate ? new Date(order.paymentConfirmationDate).toLocaleString() : "—"}</p>
            <p>Payment status: <span className="font-semibold text-green-700">Paid</span></p>
          </div>

          <div className="mt-8 text-center print:hidden">
            <p className="text-xs text-gray-400">
              This receipt was emailed to {order.customer?.email || order.email}.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
