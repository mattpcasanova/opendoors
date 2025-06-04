/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#009688',
        secondary: '#FF9800', 
        accent: '#3F51B5',
        teal: {
          50: '#E0F2F1',
          500: '#009688',
          600: '#00796B',
          700: '#00695C'
        }
      }
    },
  },
  plugins: [],
} 