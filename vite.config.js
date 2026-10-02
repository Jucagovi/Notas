import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Vite para el proyecto de gestión de notas.
export default defineConfig({
  plugins: [react()],
  base: "/Notas/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@primereact/themes/nano": path.resolve(
        __dirname,
        "./src/themes/nano.js",
      ),
      "@primereact/themes": path.resolve(__dirname, "./src/themes/index.js"),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
