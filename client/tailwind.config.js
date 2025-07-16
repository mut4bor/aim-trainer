/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#202F55',
        secondary: '#40F3F7',
        tertiary: '#4F669D',
        gray: {
          light: '#A6B1B9',
          border: '#D6E3EC',
          bg: '#F8FAFC',
        },
      },
      fontFamily: {
        'days-one': ['Days One', 'cursive'],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
