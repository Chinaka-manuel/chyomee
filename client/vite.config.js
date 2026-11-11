import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL(".", import.meta.url)), "");
  const configuredApiUrl = (env.VITE_API_URL || "").trim();
  const apiTarget = configuredApiUrl
    ? configuredApiUrl.replace(/\/api\/v1\/?$/i, "").replace(/\/api\/?$/i, "")
    : "http://localhost:5000";

  return {
    plugins: [
      react(),
      tailwindcss(),
      // PWA intentionally disabled for local development.
      // Re-enable by importing VitePWA and adding the plugin back here.
    ],
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
