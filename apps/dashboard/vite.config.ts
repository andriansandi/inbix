import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@inbix/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@inbix/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@inbix/sdk": path.resolve(__dirname, "../../packages/sdk/src"),
    },
  },
  build: {
    outDir: "../web/public",
    emptyOutDir: true,
  },
  server: {
    port: 5176,
    proxy: {
      "/api": {
        target: "http://localhost:8791",
        changeOrigin: true,
      },
    },
  },
});
