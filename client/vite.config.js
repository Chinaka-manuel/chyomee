import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL(".", import.meta.url)), "");
  const apiTarget = (env.API_PROXY_TARGET || "").trim();
  const proxy = apiTarget
    ? {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: !apiTarget.startsWith("http://"),
        },
      }
    : undefined;

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
      ...(proxy ? { proxy } : {}),
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
      ...(proxy ? { proxy } : {}),
    },
  };
});
