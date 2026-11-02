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
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        game: {
          red: '#EF4444',
          'red-dark': '#DC2626',
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          yellow: '#D97706',
          'yellow-dark': '#B45309',
          green: '#10B981',
          'green-dark': '#059669',
          purple: '#8B5CF6',
          'purple-dark': '#7C3AED',
        }
      },
      boxShadow: {
        'block': '3px 3px 0px 0px rgba(15, 23, 42, 1)',
        'block-lg': '5px 5px 0px 0px rgba(15, 23, 42, 1)',
        'block-xl': '8px 8px 0px 0px rgba(15, 23, 42, 1)',
        'block-sm': '2px 2px 0px 0px rgba(15, 23, 42, 1)',
        'block-inset': 'inset 2px 2px 0px 0px rgba(15, 23, 42, 0.2)',
      },
      borderRadius: {
        'block': '8px',
        'block-lg': '12px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
