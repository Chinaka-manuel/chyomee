import { useEffect, useRef, useState } from "react";
import { getCurrentUser, logoutUser } from "../services/authService";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    if (hasCheckedSession.current) return undefined;
    hasCheckedSession.current = true;

    let active = true;
    getCurrentUser()
      .then(({ data }) => {
        if (active) setUser(data ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
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
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const login = (userData) => {
    setUser(userData?.data ?? userData);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const register = (userData) => {
    return userData;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
