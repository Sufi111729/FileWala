/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#dc2626',
          light: '#ffffff',
        },
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
