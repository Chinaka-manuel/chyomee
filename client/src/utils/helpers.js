export const generateId = () => {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
};

export const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(10000 + Math.random() * 90000);

  return `NA-${year}-${randomNumber}`;
};

export const slugify = (text) => {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const capitalize = (text) => {
  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const truncateText = (text, length = 100) => {
  if (!text) return "";

  if (text.length <= length) {
    return text;
  }

  return `${text.substring(0, length)}...`;
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
};

export const calculateSubtotal = (items = []) => {
  return items.reduce((total, item) => {
    return total + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);
};

export const calculateOrderTotal = (items = []) => {
  return calculateSubtotal(items);
};

export const getStockStatus = (stock) => {
  const quantity = Number(stock) || 0;

  if (quantity === 0) {
    return "Out of Stock";
  }

  if (quantity <= 10) {
    return "Low Stock";
  }

  return "In Stock";
};

export const getStatusClass = (status) => {
  const classes = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Draft: "bg-gray-100 text-gray-700",
    Published: "bg-green-100 text-green-700",
    "Low Stock": "bg-yellow-100 text-yellow-700",
    "Out of Stock": "bg-red-100 text-red-700",
    "In Stock": "bg-green-100 text-green-700",
  };

  return classes[status] || "bg-gray-100 text-gray-700";
};

export const debounce = (callback, delay = 300) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};