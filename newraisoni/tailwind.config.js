/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2F8F46',
          dark: '#1F6B32',
          soft: '#EAF4EC',
          light: '#F5FAF6',
          bg: '#F8FAF9',
          card: '#FFFFFF',
          text: '#18201B',
          muted: '#66706A',
          border: '#E1E7E2',
        },
      },
    },
  },
  plugins: [],
}
