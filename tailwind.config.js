/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink-black': '#01161e',
        'soft-peach': '#f7dba7',
        'ocean-blue': '#247ba0',
      },
    },
  },
  plugins: [],
}

