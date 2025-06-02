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
});
