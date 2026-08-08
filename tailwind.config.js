/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#A874F7',
          hover: '#965be3',
          light: '#F3EDFF',
        },
        secondary: {
          DEFAULT: '#C8A4FF',
          hover: '#b58bf5',
        },
        background: '#F3EDFF',
        surface: '#FFFFFF',
        textMain: '#171717',
        mutedText: '#6B7280',
        borderCustom: '#E9DDFE',
        statusSuccess: '#22C55E',
        statusWarning: '#F59E0B',
        statusError: '#EF4444',
        statusInfo: '#3B82F6',
      },
      borderRadius: {
        'custom': '0.75rem',
      },
    },
  },
  plugins: [],
}
