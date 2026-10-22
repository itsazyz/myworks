/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f3f0e8',
        ink: '#161513',
        muted: '#4a453f',
        well: '#e7e2d8',
      },
      maxWidth: {
        page: '1040px',
      },
    },
  },
  plugins: [],
}
