/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        institutional: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#94bcdd',
          400: '#5f9bcb',
          500: '#397eb7',
          600: '#286399',
          700: '#21507d',
          800: '#1b4368',
          900: '#0F2744',
          950: '#0a1a2e',
        },
        navy: {
          900: '#0B1D33',
          800: '#122B4A',
          700: '#1A3B63',
        },
        accent: {
          teal: '#0D9488',
          emerald: '#059669',
          amber: '#D97706',
          rose: '#E11D48'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
