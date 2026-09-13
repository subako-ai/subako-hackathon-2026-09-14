import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { newSessionPlugin } from "../../scripts/new-session.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const codespace = process.env.CODESPACE_NAME;
const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
const host = codespace && domain ? `${codespace}-5178.${domain}` : undefined;

export default defineConfig({
  plugins: [
    react(),
      newSessionPlugin({ port: 5178, envDir: root, allowedOrigin: host ? `https://${host}` : undefined }),
  ],
  envDir: root,
  preview: { port: 5178, strictPort: true },
  server: {
    host: "0.0.0.0",
    port: 5178,
    strictPort: true,
    ...(host ? { allowedHosts: [host] } : {}),
  },
});
