/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" 
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'mallamas-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#057A55',
          700: '#006400',
          800: '#004d00',
          900: '#003300',
          950: '#001a00'
        }
      }
    },
  },
  safelist: [
    'text-mallamas-green-600',
    'text-mallamas-green-400',
    'text-mallamas-green-300',
    'bg-mallamas-green-600',
    'bg-mallamas-green-700',
    'bg-mallamas-green-500',
    'bg-mallamas-green-50',
    'dark:text-mallamas-green-300',
    'dark:text-mallamas-green-200',
    'dark:bg-mallamas-green-500',
    'dark:bg-mallamas-green-900/20',
    'border-mallamas-green-600',
    'border-mallamas-green-500',
    'focus:ring-mallamas-green-500',
    'dark:border-mallamas-green-400',
    'hover:text-mallamas-green-600',
    'hover:text-mallamas-green-700',
    'hover:text-mallamas-green-100',
    'hover:bg-mallamas-green-700',
    'dark:hover:text-mallamas-green-300',
    'dark:hover:text-mallamas-green-100',
    'dark:hover:text-mallamas-green-300',
    'placeholder-gray-500',
    'dark:placeholder-gray-600'
  ]
} 