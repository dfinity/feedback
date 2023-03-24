/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#533398',
        primary: '#83C9F4',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
