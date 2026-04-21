/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        }
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: { xl: '16px', '2xl': '20px', '3xl': '28px' },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.07)',
        pop:  '0 8px 40px rgba(0,0,0,0.12)',
      }
    }
  },
  plugins: []
}
