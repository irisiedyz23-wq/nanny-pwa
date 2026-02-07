/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'work-red': '#A52A2A',
        'work-green': '#8a9a5b',
      },
    },
  },
  plugins: [],
};
