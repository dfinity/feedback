/** @type {import('tailwindcss').Config} */

const typography = require('@tailwindcss/typography')();
// Override plugin styles for SSR
typography.config.theme.typography = require('./config/typographyStyles');

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
  plugins: [typography],
};
