import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //base: "./", // O 'tu_subdirectorio/' si se despliega en un subdirectorio.
  base: "https://jucagovi.github.io/Notas",
});
