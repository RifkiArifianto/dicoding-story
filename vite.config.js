import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFile } from "fs/promises";

export default defineConfig({
  root: resolve(__dirname, "src"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/index.html"),
    },
    // Hook untuk menyalin file dari /src/public ke /dist
    async writeBundle(options, bundle) {
      await copyFile(
        resolve(__dirname, "src/public/manifest.json"),
        resolve(__dirname, "dist/public/manifest.json")
      );
      await copyFile(
        resolve(__dirname, "src/public/images/favicon.png"),
        resolve(__dirname, "dist/public/images/favicon.png")
      );
    },
  },
  server: {
    hmr: {
      protocol: "ws",
      host: "localhost",
    },
  },
  base: "/dicoding-story/", // Sesuaikan untuk GitHub Pages
});
