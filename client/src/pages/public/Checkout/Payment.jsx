import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BrandLogo from "../../../components/ui/BrandLogo";
import { initializePayment } from "../../../services/checkoutService";

const Payment = () => {
  const location = useLocation();

  const order = location.state?.order;

  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const total = Number(order?.total) || 0;

  const handlePayment = async (e) => {
    e.preventDefault();
    if (paymentMethod !== "paystack") {
      setError("Cash on delivery is not available from this payment page.");
      return;
    }
    if (!order?.id) {
      setError("This payment session is missing its order. Return to checkout and place the order again.");
      return;
    }
    setError("");
    setProcessing(true);
    try {
      const { data } = await initializePayment({ orderId: order.id });
      window.location.assign(data.authorizationUrl);
    } catch (requestError) {
      setError(requestError.message || "We could not start your payment. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link to="/" aria-label="chyomee home" className="inline-flex rounded-sm bg-stone-950 px-2 py-1">
            <BrandLogo className="h-7 w-auto" />
          </Link>

          <Link
            to="/checkout"
            className="text-sm text-gray-600 hover:text-green-700"
          >
            ← Back to Checkout
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-2">
            Choose your preferred payment method to complete your order.
          </p>
        </div>

        <form onSubmit={handlePayment} className="grid lg:grid-cols-3 gap-8">
          {/* Payment Options */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Payment Method
            </h2>

            <div className="space-y-4">
              {/* Paystack */}
              <label
                className={`block border rounded-xl p-5 cursor-pointer transition ${
                  paymentMethod === "paystack"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-green-400"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paystack"
                    checked={paymentMethod === "paystack"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 accent-green-600"
                  />

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Paystack
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Pay securely with your card, bank transfer or USSD.
                    </p>
                  </div>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`block border rounded-xl p-5 cursor-pointer transition ${
                  paymentMethod === "cash"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-green-400"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 accent-green-600"
                  />

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Cash on Delivery
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Pay when your order is delivered to you.
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Security Notice */}
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                🔒 Your payment information is securely processed. We do not
                store your card details.
              </p>
            </div>

            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={processing}
              className="w-full mt-8 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-xl transition"
            >
              {processing
                ? "Processing..."
                : paymentMethod === "paystack"
                ? `Pay ₦${Number(total).toLocaleString()}`
                : "Place Order"}
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Order Summary
            </h2>

            {order?.items?.length ? (
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center gap-3"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 rounded-lg bg-gray-50 object-contain p-1"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
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

                    <p className="ml-auto font-medium">
                      ₦
                      {(
                        Number(item.price) * Number(item.quantity)
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Your order details will appear here.
              </p>
            )}

            <div className="border-t mt-6 pt-5 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-green-700">
                ₦{Number(total).toLocaleString()}
              </span>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Payment;
