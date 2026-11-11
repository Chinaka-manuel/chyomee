export const isRequired = (value) => {
  return value !== undefined &&
    value !== null &&
    String(value).trim() !== "";
};

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "").trim()
  );
};

export const isValidPhone = (phone) => {
  return /^[+]?[0-9\s-]{10,15}$/.test(
    String(phone || "").trim()
  );
};

export const isValidPassword = (password) => {
  return typeof password === "string" && password.length >= 6;
};

export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const isPositiveNumber = (value) => {
  return Number.isFinite(Number(value)) && Number(value) > 0;
};

export const isNonNegativeNumber = (value) => {
  return Number.isFinite(Number(value)) && Number(value) >= 0;
};

export const isValidPrice = (price) => {
  return isNonNegativeNumber(price);
};

export const isValidStock = (stock) => {
  return Number.isInteger(Number(stock)) && Number(stock) >= 0;
};

export const validateRequiredFields = (data, fields) => {
  const errors = {};

  fields.forEach((field) => {
    if (!isRequired(data[field])) {
      errors[field] = `${field} is required.`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateEmailField = (email) => {
  if (!isRequired(email)) {
    return "Email is required.";
  }

  if (!isValidEmail(email)) {
    return "Enter a valid email address.";
  }

  return "";
};

export const validatePasswordField = (password) => {
  if (!isRequired(password)) {
    return "Password is required.";
  }

  if (!isValidPassword(password)) {
    return "Password must be at least 6 characters.";
  }

  return "";
};

export default {
  isRequired,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  passwordsMatch,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidPrice,
  isValidStock,
  validateRequiredFields,
  validateEmailField,
  validatePasswordField,
};