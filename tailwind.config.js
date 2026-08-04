/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rose: '#DE7B91',
        lemon: '#F0E6A8',
        mint: '#B8E8C8',
        sky: '#A8D8F0',
        lavender: '#D4B8F0',
        cream: '#FAF8F5',
        ink: '#2D2522'
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif']
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px'
      },
      boxShadow: {
        cozy: '0 10px 30px -5px rgba(45, 37, 34, 0.05)'
      }
    }
  },
  plugins: []
};
