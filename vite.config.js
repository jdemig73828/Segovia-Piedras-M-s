import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Establecemos 'base' en './' para garantizar que los activos (JS, CSS, imágenes) 
  // se carguen con rutas relativas, lo cual es fundamental para despliegues 
  // en GitHub Pages si el proyecto no está en la raíz del dominio.
  base: './',
})