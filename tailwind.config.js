/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#f8e8ff',
          100: '#edc4ff',
          200: '#db92ff',
          300: '#c965ff',
          400: '#b738ff',
          500: '#a50bff',
          600: '#820ad1',
          700: '#6908a8',
          800: '#50067f',
          900: '#370456',
        },
        'light-gray': '#f4f4f4',
      },
      fontFamily: {
        sans: ['Graphik', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(138, 5, 190, 0.1)',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
};