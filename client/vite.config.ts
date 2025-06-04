import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";
import dotenvFlow from "dotenv-flow";
import path from "path";

dotenvFlow.config({
  path: path.resolve(__dirname, ".."),
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  define: {
    "process.env": process.env,
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src/"),
      },
      {
        find: "@components",
        replacement: path.resolve(__dirname, "src/components/"),
      },
      {
        find: "@lib",
        replacement: path.resolve(__dirname, "src/lib/"),
      },
      {
        find: "@pages",
        replacement: path.resolve(__dirname, "src/pages/"),
      },
      {
        find: "@data",
        replacement: path.resolve(__dirname, "src/data/"),
      },
    ],
  },
});
