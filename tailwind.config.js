/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nirvana: {
          50: '#faf8f3',
          100: '#f3ede0',
          200: '#e6d9b8',
          300: '#d4bf8a',
          400: '#c9a227',
          500: '#b8901f',
          600: '#9a7618',
          700: '#7a5d14',
          800: '#5c4510',
          900: '#3d2e0b',
          950: '#1a1407',
        },
        coffee: {
          50: '#f7f5f0',
          100: '#ebe5d8',
          200: '#d4c7a8',
          300: '#bda478',
          400: '#a68a5c',
          500: '#8b7355',
          600: '#6f5a43',
          700: '#534432',
          800: '#3a2f22',
          900: '#241c14',
          950: '#15100b',
        },
        ink: {
          50: '#f6f5f3',
          100: '#e7e5e0',
          200: '#cfcbc2',
          300: '#b0a99b',
          400: '#8e8472',
          500: '#736a59',
          600: '#5c5547',
          700: '#4a4439',
          800: '#3d3830',
          900: '#2a261f',
          950: '#0d0c0a',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #c9a227 0%, #d4bf8a 50%, #c9a227 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1a1407 0%, #0d0c0a 100%)',
        'gradient-coffee': 'linear-gradient(135deg, #3d2e0b 0%, #241c14 50%, #15100b 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201, 162, 39, 0.15)',
        'gold-lg': '0 0 40px rgba(201, 162, 39, 0.25)',
        'inner-gold': 'inset 0 1px 0 rgba(201, 162, 39, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(201, 162, 39, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(201, 162, 39, 0.4)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
    },
  },
  plugins: [],
};
