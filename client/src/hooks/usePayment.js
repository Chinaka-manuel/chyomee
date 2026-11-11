import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function usePayment() {
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("Paystack");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectPaymentMethod = (method) => {
    setPaymentMethod(method);
    setError("");
  };

  const processPayment = async (order = {}) => {
    setError("");
    setLoading(true);

    try {
      const paymentData = {
        ...order,
        paymentMethod,
      };

      console.log("Processing payment:", paymentData);

      // Connect to Paystack/backend API here later.

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (paymentMethod === "Paystack") {
        navigate("/payment/success", {
          state: {
            order: {
              ...paymentData,
              paymentStatus: "Paid",
            },
          },
        });
      } else {
        navigate("/checkout/order-confirmation", {
          state: {
            order: {
              ...paymentData,
              paymentStatus: "Pending",
            },
          },
        });
      }

      return true;
    } catch (err) {
      console.error("Payment error:", err);
      setError("Payment could not be completed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = (order = {}) => {
    setError("");

    navigate("/checkout/payment", {
      state: {
        order,
      },
    });
  };

  const cancelPayment = (order = {}) => {
    navigate("/payment/cancelled", {
      state: {
        order,
      },
    });
  };

  return {
    paymentMethod,
    setPaymentMethod,
    selectPaymentMethod,
    processPayment,
    retryPayment,
    cancelPayment,
    loading,
    error,
  };
}
