import { useEffect, useRef, useState } from "react";
import {
  adminLogin,
  adminLogout,
  getCurrentAdmin,
} from "../services/adminService";
import { AdminContext } from "./adminContextValue";

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    if (hasCheckedSession.current) return undefined;
    hasCheckedSession.current = true;

    let active = true;
    getCurrentAdmin()
      .then(({ data }) => {
        if (!active) return;
        if (data?.role === "admin") {
          setAdmin(data);
          return;
        }
        setAdmin(null);
      })
      .catch((error) => {
        if (!active) return;
        setAdmin(null);
        if (error.status !== 401 && error.status !== 403) {
          setAuthError(error.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleSessionExpired = () => {
      setAdmin(null);
      setAuthError("");
      setLoading(false);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const login = async (credentials) => {
    const response = await adminLogin(credentials);
    const adminData = response?.data ?? response;

    if (!adminData || adminData.role !== "admin") {
      setAdmin(null);
      throw new Error("Administrator access required.");
    }

    setAuthError("");
    setAdmin(adminData);
    return adminData;
  };

  const logout = async () => {
    await adminLogout();
    setAdmin(null);
    setAuthError("");
  };

  const isAuthenticated = !!admin && admin.role === "admin";

  return (
    <AdminContext.Provider
      value={{
        admin,
        setAdmin,
        login,
        logout,
        isAuthenticated,
        loading,
        authError,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
