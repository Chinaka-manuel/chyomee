import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../../../services/checkoutService";
import { useCart } from "../../../context/CartContext";

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString("en-NG")}`;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const callbackState = searchParams.get("state");
  const hasConfirmationDetails = Boolean(reference && callbackState);
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!hasConfirmationDetails) return () => { active = false; };
    verifyPayment(reference, callbackState)
      .then(({ data }) => {
        if (!active) return;
        setOrder(data);
        clearCart();
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "We could not confirm this payment yet.");
      });
    return () => { active = false; };
  }, [reference, callbackState, clearCart, hasConfirmationDetails]);

  const displayError =
    error ||
    (!hasConfirmationDetails
      ? "Payment confirmation details are missing. Check your account orders before trying again."
      : "");

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 print:bg-white print:p-0">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-10 print:max-w-none print:shadow-none">
        {!order && !error && <p role="status" className="py-16 text-center text-gray-600">Confirming your payment…</p>}
        {displayError && (
          <div className="py-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Payment confirmation pending</h1>
            <p role="alert" className="mt-3 text-gray-600">{displayError}</p>
            <p className="mt-2 text-sm text-gray-500">Your order is only marked paid after Paystack confirms it. You can check your order history shortly.</p>
            <Link to="/account/orders" className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white">View my orders</Link>
          </div>
        )}
        {order && (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">✓</div>
              <h1 className="mt-4 text-3xl font-bold text-gray-900">Payment received</h1>
              <p className="mt-2 text-gray-600">
                Your Paystack payment is confirmed. {order.receiptSentAt ? "A receipt has been sent to your email." : "Your receipt is available below to print or save."}
              </p>
            </div>
            <div className="mt-8 border-y border-dashed border-gray-300 py-6">
              <div className="flex flex-wrap justify-between gap-3">
                <div><p className="text-sm text-gray-500">Order number</p><p className="font-semibold">{order.orderNumber || order.id}</p></div>
                <div><p className="text-sm text-gray-500">Payment reference</p><p className="break-all font-mono text-sm">{order.paymentReference}</p></div>
                <div><p className="text-sm text-gray-500">Paid on</p><p className="font-semibold">{order.paidAt ? new Date(order.paidAt).toLocaleString() : "Confirmed"}</p></div>
              </div>
            </div>
            <h2 className="mt-6 text-lg font-bold">Payment receipt</h2>
            <div className="mt-3 divide-y divide-gray-100">
              {(order.items || []).map((item, index) => (
                <div key={`${item.product || item.name}-${index}`} className="flex items-center gap-3 py-3 text-sm">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg bg-gray-50 object-contain p-1"
                    />
                  )}
                  <span className="min-w-0 flex-1">{item.name} × {item.quantity}</span><span className="font-medium">{formatNaira(Number(item.price) * Number(item.quantity))}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between text-lg font-bold"><span>Total paid</span><span>{formatNaira(order.total)}</span></div>
              <div className="flex justify-between"><span>Payment method</span><span>Paystack</span></div>
              <div className="flex justify-between"><span>Status</span><span className="font-semibold text-green-700">Paid</span></div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
              <button type="button" onClick={() => window.print()} className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white">Print / Save receipt</button>
              <Link to={`/account/orders/${order.id}`} className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700">View order</Link>
              <Link to="/shop" className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700">Continue shopping</Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
