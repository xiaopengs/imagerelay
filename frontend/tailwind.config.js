/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7c6af5',
        'primary-light': '#9d8cff',
        dark: '#0a0a0f',
        card: '#141420',
        'card-light': '#1e1e30',
        text: '#e0e0e0',
        'text-dim': '#888',
      }
    }
  },
  plugins: []
}