/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".btn-primary": {
          "@apply w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors":
            {},
        },        
        ".btn-danger": {
          "@apply mt-1 text-sm text-gray-600 px-2 py-1 bg-gray-200 hover:bg-red-500 hover:text-white rounded transition h-8 font-bold":
            {},
        },
        ".input-base": {
          "@apply mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500":
            {},
        },
        ".label-base": {
          "@apply block text-sm font-medium text-gray-700": {},
        },
        ".error-text": {
          "@apply text-red-500 text-xs mt-1": {},
        },
      });
    }),
  ],
};
