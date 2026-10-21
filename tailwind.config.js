/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        carA: '#2563eb',
        carB: '#f97316',
      },
    },
  },
  plugins: [],
}
