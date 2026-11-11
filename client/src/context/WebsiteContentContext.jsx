import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { get as publicGet } from "../services/api";
import { getWebsiteContent as getAdminWebsiteContent } from "../services/adminService";
import { useAdmin } from "./useAdmin";

export const initialWebsiteContent = {};

export const WebsiteContentContext = createContext(null);

const modeState = {
  public: {
    request: null,
    cache: {},
    loaded: false,
  },
  admin: {
    request: null,
    cache: {},
    loaded: false,
  },
};

export function WebsiteContentProvider({ children }) {
  const location = useLocation();
  const { isAuthenticated } = useAdmin();
  const routeMode = location.pathname.startsWith("/admin") ? "admin" : "public";
  const [content, setContent] = useState(modeState[routeMode].cache);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const modeData = modeState[routeMode];

    const loadContent = async () => {
      if (routeMode === "admin" && !isAuthenticated) {
        if (active) {
          setContent(modeData.cache);
          setLoading(false);
        }
        return;
      }

      if (modeData.loaded) {
        if (active) {
          setContent(modeData.cache);
          setLoading(false);
        }
        return;
      }

      if (modeData.request) {
        if (active) setLoading(true);

        try {
          const { data } = await modeData.request;
          const next = data && typeof data === "object" ? data : {};
          modeData.cache = next;
          modeData.loaded = true;
          if (active) setContent(next);
        } catch {
          modeData.cache = {};
          modeData.loaded = true;
          if (active) setContent({});
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      if (active) setLoading(true);

      const request =
        routeMode === "admin"
          ? getAdminWebsiteContent()
          : publicGet("/website-content");

      modeData.request = request
        .then(({ data }) => {
          const next = data && typeof data === "object" ? data : {};
          modeData.cache = next;
          modeData.loaded = true;
          if (active) setContent(next);
          return next;
        })
        .catch(() => {
          modeData.cache = {};
          modeData.loaded = true;
          if (active) setContent({});
          return {};
        })
        .finally(() => {
          modeData.request = null;
          if (active) setLoading(false);
        });

      try {
        await modeData.request;
      } catch {
        // handled in the request chain above
      }
    };

    void loadContent();

    return () => {
      active = false;
    };
  }, [isAuthenticated, routeMode]);

  const updateSection = useCallback(
    (section, updates) => {
      setContent((cur) => {
        const next = {
          ...cur,
          [section]: { ...(cur[section] || {}), ...updates },
        };

        modeState[routeMode].cache = next;
        return next;
      });
    },
    [routeMode],
  );

  const setSection = useCallback(
    (section, value) => {
      setContent((cur) => {
        const next = { ...cur, [section]: value };
        modeState[routeMode].cache = next;
        return next;
      });
    },
    [routeMode],
  );

  const value = useMemo(
    () => ({ content, setContent, loading, updateSection, setSection }),
    [content, loading, updateSection, setSection],
  );

  return (
    <WebsiteContentContext.Provider value={value}>
      {children}
    </WebsiteContentContext.Provider>
  );
}

export function useWebsiteContentContext() {
  const ctx = React.useContext(WebsiteContentContext);
  if (!ctx)
    throw new Error(
      "useWebsiteContentContext must be used within a WebsiteContentProvider",
    );
  return ctx;
}
