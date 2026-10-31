/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#121410',
          soft: '#2A2E28',
          mute: '#5C635A',
        },
        paper: {
          DEFAULT: '#EEF1EC',
          card: '#F7F8F5',
          line: '#D5DAD2',
        },
        moss: {
          50: '#F1F5F2',
          100: '#DCE6DF',
          200: '#B8CDBF',
          300: '#8AAF98',
          400: '#5B8A6E',
          500: '#3D5C4A',
          600: '#2F4A3C',
          700: '#243A2F',
          800: '#1A2B23',
          900: '#121C17',
        },
        copper: {
          DEFAULT: '#A86B3C',
          soft: '#C4895A',
        },
        // keep cafe aliases mapped so admin pages don't break mid-migration
        cafe: {
          50: '#F1F5F2',
          100: '#DCE6DF',
          200: '#B8CDBF',
          300: '#8AAF98',
          400: '#5B8A6E',
          500: '#3D5C4A',
          600: '#2F4A3C',
          700: '#243A2F',
          800: '#1A2B23',
          900: '#121C17',
          950: '#0B100E',
        },
        espresso: '#121410',
        warmcream: '#EEF1EC',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 40px -16px rgba(18, 20, 16, 0.18)',
      },
      keyframes: {
        'scan-line': {
          '0%, 100%': { top: '12%' },
          '50%': { top: '78%' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'scan-line': 'scan-line 2.4s ease-in-out infinite',
        'fade-up': 'fade-up 0.55s ease-out both',
      },
    },
  },
  plugins: [],
}
