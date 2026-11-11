import { Link, useLocation } from "react-router-dom";

const PaymentCancelled = () => {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-8 text-center">
        {/* Cancel Icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Payment Cancelled</h1>

        <p className="text-gray-600 mt-3 leading-relaxed">
          Your payment was cancelled or could not be completed. Your order has
          not been confirmed.
        </p>

        {order?.orderNumber && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="font-semibold text-gray-900 mt-1">
              {order.orderNumber}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to="/checkout/payment"
            state={{ order }}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition"
          >
            Try Payment Again
          </Link>

          <Link
            to="/shop"
            className="flex-1 border border-gray-300 hover:border-green-600 hover:text-green-700 text-gray-700 font-semibold py-3 rounded-xl transition"
          >
            Continue Shopping
          </Link>
        </div>

        <Link
          to="/"
          className="inline-block mt-6 text-sm text-gray-500 hover:text-green-700"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancelled;
