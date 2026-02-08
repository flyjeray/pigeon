import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    base: process.env.VITE_URL_BASE || "/",
    plugins: [react()],
    css: {
      modules: {
        localsConvention: "camelCase",
      },
    },
  });
};
