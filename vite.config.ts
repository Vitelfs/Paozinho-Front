import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5175, // coloque a porta desejada aqui
    host: '0.0.0.0', // permite acessar de qualquer IP
    strictPort: true, // falha se a porta estiver em uso
    allowedHosts: [
      'paozinhodelicia.humannits.com.br',
      'localhost',
      '127.0.0.1',
      '172.17.0.1'
    ]
  },
});
