import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const port = Number(process.env.PORT || 5173);

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port,
    },
    preview: {
      port,
    },
  };
});