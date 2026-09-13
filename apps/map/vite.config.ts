import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const codespace = process.env.CODESPACE_NAME;
const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
const host = codespace && domain ? `${codespace}-5175.${domain}` : undefined;

export default defineConfig({
  plugins: [react()],
  envDir: fileURLToPath(new URL("../../", import.meta.url)),
  preview: { port: 5175, strictPort: true },
  server: {
    host: "0.0.0.0",
    port: 5175,
    strictPort: true,
    ...(host ? { allowedHosts: [host] } : {}),
  },
});
