export const validateCheckout = (formData) => {
  const errors = {};

  if (!formData.firstName?.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!formData.lastName?.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!formData.email?.trim()) {
    errors.email = "Email is required.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (!formData.phone?.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[+]?[0-9\s-]{10,15}$/.test(formData.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!formData.address?.trim()) {
    errors.address = "Delivery address is required.";
  }

  if (!formData.city?.trim()) {
    errors.city = "City is required.";
  }

  if (!formData.state?.trim()) {
    errors.state = "State is required.";
  }

  if (!formData.paymentMethod) {
    errors.paymentMethod = "Please select a payment method.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCheckoutField = (field, value) => {
  const errors = {};

  switch (field) {
    case "firstName":
      if (!value?.trim()) {
        errors.firstName = "First name is required.";
      }
      break;

    case "lastName":
      if (!value?.trim()) {
        errors.lastName = "Last name is required.";
      }
      break;

    case "email":
      if (!value?.trim()) {
        errors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.email = "Enter a valid email address.";
      }
      break;

    case "phone":
      if (!value?.trim()) {
        errors.phone = "Phone number is required.";
      } else if (!/^[+]?[0-9\s-]{10,15}$/.test(value)) {
        errors.phone = "Enter a valid phone number.";
      }
      break;

    case "address":
      if (!value?.trim()) {
        errors.address = "Delivery address is required.";
      }
      break;

    case "city":
      if (!value?.trim()) {
        errors.city = "City is required.";
      }
      break;

    case "state":
      if (!value?.trim()) {
        errors.state = "State is required.";
      }
      break;

    case "paymentMethod":
      if (!value) {
        errors.paymentMethod = "Please select a payment method.";
      }
      break;

    default:
      break;
  }

  return errors;
};