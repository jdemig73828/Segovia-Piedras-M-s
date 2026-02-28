/** @type {import('tailwindcss').Config} */
export default {
  // Indica a Tailwind en qué archivos debe buscar clases para optimizar el CSS final
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Configuración de la tipografía principal del proyecto
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      // Puedes añadir aquí colores personalizados si deseas usarlos como clases de Tailwind
      colors: {
        'hero-purple': '#4c1d95',
      },
    },
  },
  plugins: [],
}