import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useCheckout() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    notes: "",
    paymentMethod: "Paystack",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateForm = (data) => {
    setFormData((current) => ({
      ...current,
      ...data,
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      notes: "",
      paymentMethod: "Paystack",
    });

    setError("");
  };

  const validateCheckout = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
    ];

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError(`Please fill in your ${field}.`);
        return false;
      }
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const submitCheckout = async (orderData = {}) => {
    setError("");

    if (!validateCheckout()) {
      return false;
    }

    setLoading(true);

    try {
      const checkoutData = {
        ...formData,
        ...orderData,
      };

      console.log("Checkout submitted:", checkoutData);

      // Connect to backend API here later.

      navigate("/checkout/payment", {
        state: {
          order: checkoutData,
        },
      });

      return true;
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    updateField,
    updateForm,
    resetForm,
    validateCheckout,
    submitCheckout,
    loading,
    error,
  };
}
