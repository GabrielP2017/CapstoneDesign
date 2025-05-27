import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default ({ mode }) => {
  // mode는 'development' 또는 'production' 등
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    define: {
      __APP_ENV__: env.APP_ENV, // 선택적
    },
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: "0.0.0.0",
    },
  });
};
