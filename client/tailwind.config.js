/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme"); // Import defaultTheme

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Courier Prime"', ...defaultTheme.fontFamily.sans], // For default text
        sourceCode: ['"Source Code Pro"', ...defaultTheme.fontFamily.mono],
      },
      keyframes: {
        draw: {
          '0%': { strokeDashoffset: 1000 },
          '100%': { strokeDashoffset: 0 },
        },
      },
      animation: {
        draw: 'draw 2s ease forwards',
      },
  },
  },
  plugins: [],
};
