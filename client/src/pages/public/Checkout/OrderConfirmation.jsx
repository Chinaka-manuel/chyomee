import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { submitBankTransferPayment } from "../../../services/checkoutService";

const OrderConfirmation = () => {
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          No order to display
        </h1>
        <Link
          to="/checkout"
          className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white"
        >
          Return to checkout
        </Link>
      </main>
    );
  }

  const customerName =
    order.customerName ||
    (typeof order.customer === "object"
      ? order.customer?.name
      : order.customer) ||
    "Customer";
  const customerEmail = order.email || order.customer?.email || "";
  const deliveryAddress =
    typeof order.deliveryAddress === "string"
      ? order.deliveryAddress
      : [
          order.deliveryAddress?.address,
          order.deliveryAddress?.city,
          order.deliveryAddress?.state,
        ]
          .filter(Boolean)
          .join(", ");
  const isBankTransfer = order.paymentMethod === "Bank Transfer";
  const paid = order.paymentStatus === "Paid";
  const pendingVerification = !paid && isBankTransfer;
  const paymentSubmitted = Boolean(order.paymentSubmittedAt);

  const formatPrice = (price) => `₦${price.toLocaleString()}`;

  const handlePaymentSubmitted = async () => {
    if (!order.id) {
      setSubmitError("We could not find this order. Please check your orders.");
      return;
    }
    setSubmittingPayment(true);
    setSubmitError("");
    try {
      const { data } = await submitBankTransferPayment(order.id);
      setOrder((current) => ({ ...current, ...data }));
    } catch (error) {
      setSubmitError(
        error.message || "We could not update your payment status.",
      );
    } finally {
      setSubmittingPayment(false);
    }
  };

  const bankDetails = order.bankDetails ?? {
    accountName: "Niceman Agro and Farm",
    bankName: "Wema Bank",
    accountNumber: "0125362805",
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-3xl">
        {/* Success */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-700">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {paid
              ? "Order Confirmed!"
              : pendingVerification
                ? paymentSubmitted
                  ? "Payment Reported — Awaiting Approval"
                  : "Complete Your Bank Transfer"
                : "Order Received"}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            {paid
              ? "Thank you for your order. Your payment has been received and we will begin processing it shortly."
              : pendingVerification
                ? paymentSubmitted
                  ? "Your payment status is still pending. An administrator will verify your transfer before approving the payment."
                  : "Review the order below, transfer the exact total to the account, then let us know when you have paid."
                : "Thank you for your order. Payment is still pending; we will process it after payment is confirmed."}
          </p>
        </div>

        {/* Confirmation Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {/* Order Number */}
          <div className="bg-green-900 px-6 py-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">
              Order Number
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-white">
              {order.orderNumber}
            </h2>
          </div>

          <div className="p-6 sm:p-8">
            {/* Customer */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Customer Information
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {customerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="mt-1 break-all font-semibold text-gray-800">
                    {customerEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-b border-gray-100 py-6">
              <h3 className="text-lg font-bold text-gray-900">Ordered Items</h3>

              <div className="mt-4 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={`${item.id || item.product || item.name}::${item.size || ""}::${item.color || ""}::${item.style || ""}`}
                    className="flex items-center gap-4"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-contain object-center bg-gray-50 p-1.5"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-semibold text-gray-900">
                        {item.name}
                      </h4>

                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      {(item.size || item.color || item.style) && (
                        <p className="text-sm text-gray-500">
                          {[
                            item.size && `Size: ${item.size}`,
                            item.color && `Color: ${item.color}`,
                            item.style && `Style: ${item.style}`,
                          ].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>

                    <p className="font-bold text-green-700">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div className="border-b border-gray-100 py-6">
              <h3 className="text-lg font-bold text-gray-900">
                Delivery Address
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                {deliveryAddress || "Address on file"}
              </p>
            </div>

            {/* Payment & Total */}
            <div className="py-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Payment Method</span>

                <span className="font-semibold text-gray-800">
                  {order.paymentMethod}
                </span>
              </div>

              {Number(order.loyaltyDiscount) > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Loyalty points applied
                  </span>
                  <span className="font-semibold text-green-700">
                    −{formatPrice(Number(order.loyaltyDiscount))}
                  </span>
                </div>
              )}

              {!paid && isBankTransfer && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-green-700">
                    Payment Pending Verification
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Transfer the exact amount of{" "}
                    <span className="font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </span>{" "}
                    to the account below and keep your payment reference{" "}
                    <span className="font-bold text-gray-900">
                      {order.paymentReference}
                    </span>{" "}
                    for tracking.
                  </p>

                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Name</span>
                      <span className="font-semibold text-gray-900">
                        {bankDetails.accountName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank Name</span>
                      <span className="font-semibold text-gray-900">
                        {bankDetails.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Number</span>
                      <span className="font-bold text-gray-900">
                        {bankDetails.accountNumber}
                      </span>
                    </div>
                  </div>

                  {!paymentSubmitted && (
                    <div className="mt-5 border-t border-green-200 pt-4">
                      <p className="text-sm text-gray-700">
                        After completing the transfer, let us know so our admin
                        can verify it. Your payment remains pending until
                        approval.
                      </p>
                      <button
                        type="button"
                        onClick={handlePaymentSubmitted}
                        disabled={submittingPayment}
                        className="mt-3 w-full rounded-lg bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
                      >
                        {submittingPayment
                          ? "Submitting…"
                          : "I've Paid — Notify Admin"}
                      </button>
                      {submitError && (
                        <p role="alert" className="mt-3 text-sm text-red-700">
                          {submitError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {paid ? "Total Paid" : "Order Total"}
                </span>

                <span className="text-2xl font-extrabold text-green-800">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Status */}
            {paid && (
              <div className="rounded-xl bg-green-50 p-4 text-center">
                <p className="font-bold text-green-800">
                  Your order is being processed.
                </p>

                <p className="mt-1 text-sm text-green-700">
                  {order.receiptNumber &&
                    `Receipt #${order.receiptNumber} has been sent to your email.`}
                  {!order.receiptNumber &&
                    "Your receipt has been sent to your email."}
                </p>
                <Link
                  to={`/account/orders/${order.id}/receipt`}
                  className="mt-3 inline-block text-sm font-semibold text-green-700 hover:text-green-900"
                >
                  Download receipt
                </Link>
              </div>
            )}

            {!paid && (
              <div className="rounded-xl bg-yellow-50 p-4 text-center">
                <p className="font-bold text-yellow-800">
                  {paymentSubmitted
                    ? "Payment report received — awaiting admin approval."
                    : "Payment is pending."}
                </p>

                <p className="mt-1 text-sm text-yellow-700">
                  {paymentSubmitted
                    ? "Your payment status remains pending until an administrator verifies the transfer."
                    : "After transferring, use the button above to notify us. An administrator will verify your payment."}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link
                to="/shop"
                className="rounded-lg bg-green-700 px-6 py-3 text-center font-bold text-white transition hover:bg-green-800"
              >
                Continue Shopping
              </Link>

              <Link
                to="/"
                className="rounded-lg border border-gray-300 px-6 py-3 text-center font-bold text-gray-700 transition hover:border-green-700 hover:text-green-700"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
