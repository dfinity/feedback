/** @type {import('tailwindcss').Config} */

const typography = require('@tailwindcss/typography')();
// Override plugin styles for SSR
typography.config.theme.typography = require('./config/typographyStyles');

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#056759',
        primary: '#83c9f4',
        // upvote: '#F15A24',
      },
    },
  },
  plugins: [typography],
};
