const getDefaultApiBase = () => {
  if (typeof window === "undefined") return "http://localhost:5000/api/v1";

  const hostname = window.location.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  ) {
    return "http://localhost:5000/api/v1";
  }

  if (window.location.pathname.startsWith("/admin")) {
    return `${window.location.origin}/api/v1`;
  }

  return `${window.location.origin}/api/v1`;
};

const configuredApiBase = import.meta.env.VITE_API_URL?.trim();
const usesCanonicalProductionFrontend =
  typeof window !== "undefined" &&
  (window.location.hostname.toLowerCase() === "www.nicemanagro.com" ||
   window.location.hostname.toLowerCase() === "niceman-agro-ecommerce.onrender.com");
const productionApiBase = "https://www.nicemanagro.com/api/v1";
const isLocalBrowser =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "[::1]"].includes(
    window.location.hostname.toLowerCase(),
  );
const isLocalConfiguredApi =
  configuredApiBase &&
  /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(
    configuredApiBase,
  );
const rawApiBase =
  usesCanonicalProductionFrontend
    ? productionApiBase
    : isLocalConfiguredApi && !isLocalBrowser
      ? getDefaultApiBase()
      : configuredApiBase || getDefaultApiBase();

const normalizeApiBase = (value) => {
  const trimmed = (value || "").trim().replace(/\/+$/, "");

  if (!trimmed) return getDefaultApiBase();
  if (/\/api\/v1$/i.test(trimmed)) return trimmed;
  if (/\/api$/i.test(trimmed)) return `${trimmed}/v1`;
  return `${trimmed}/api/v1`;
};

export const API_URL = normalizeApiBase(rawApiBase);

let refreshInFlight = null;

const isAuthEndpoint = (endpoint) =>
  /\/(login|register|refresh-token)$/.test(endpoint);

const clearSessionOnRefreshFailure = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:session-expired"));
  }
};

const refreshAccessToken = async () => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = fetch(`${API_URL}/user/refresh-token`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (response) => {
      if (!response.ok) {
        const responseText = await response.text();
        let message = "Session expired. Please log in again.";

        if (responseText) {
          try {
            const parsed = JSON.parse(responseText);
            message = parsed.message || parsed.error || message;
          } catch {
            message = responseText || message;
          }
        }

        clearSessionOnRefreshFailure();
        const error = new Error(message);
        error.status = response.status;
        throw error;
      }

      return response;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
};

const api = async (endpoint, options = {}) => {
  const requestOptions = {
    credentials: "include",
    ...options,
    __retriedAfterRefresh: Boolean(options.__retriedAfterRefresh),
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...options.headers,
    },
  };

  const requestUrl = `${API_URL}${endpoint}`;
  const sendRequest = async () => fetch(requestUrl, requestOptions);

  let response;
  try {
    response = await sendRequest();
  } catch (cause) {
    const error = new Error(
      "Unable to reach the service. Check your internet connection and try again.",
      { cause },
    );
    error.endpoint = endpoint;
    throw error;
  }

  if (
    response.status === 401 &&
    !isAuthEndpoint(endpoint) &&
    !requestOptions.__retriedAfterRefresh
  ) {
    requestOptions.__retriedAfterRefresh = true;
    await refreshAccessToken();
    response = await sendRequest();
  }

  const responseText = await response.text();
  let data = {};
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    const responseMessage =
      data.message ||
      data.error ||
      (Array.isArray(data.errors) ? data.errors.join(", ") : data.errors);
    const requestMethod = (requestOptions.method || "GET").toUpperCase();
    const requestPath = new URL(requestUrl).pathname;
    const message =
      typeof responseMessage === "string" &&
      responseMessage.trim() &&
      !/^\s*</.test(responseMessage)
        ? responseMessage
        : response.status === 404
          ? `No API route was found for ${requestMethod} ${requestPath} (HTTP 404). Confirm the backend route is enabled and the request path is correct.`
        : response.status >= 500
          ? `The service is temporarily unavailable (HTTP ${response.status}). Please try again in a few minutes.`
          : `The request could not be processed (HTTP ${response.status}). Please check your details and try again.`;
    const error = new Error(message);
    error.status = response.status;
    error.endpoint = endpoint;
    error.requestId = response.headers.get("x-request-id") || undefined;
    throw error;
  }

  return data;
};

export const get = (endpoint) =>
  api(endpoint, {
    method: "GET",
  });

export const post = (endpoint, data) =>
  api(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const upload = (endpoint, formData) =>
  api(endpoint, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

export const put = (endpoint, data) =>
  api(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patch = (endpoint, data) =>
  api(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const del = (endpoint) =>
  api(endpoint, {
    method: "DELETE",
  });

export default api;
