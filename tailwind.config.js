/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand: Navy Blue
        navy: {
          50: '#eef1f8',
          100: '#d4dcef',
          200: '#a9b8df',
          300: '#7d93cf',
          400: '#5570b8',
          500: '#34528f',
          600: '#1f3a6e',
          700: '#13294d',
          800: '#0a1f44',
          900: '#06122a',
          950: '#030a18',
        },
        // Brand: Deep Red
        crimson: {
          50: '#fdeceb',
          100: '#f9cdc9',
          200: '#f29a93',
          300: '#e9665c',
          400: '#df3d31',
          500: '#c41f14',
          600: '#9e1810',
          700: '#7a130c',
          800: '#5a0e09',
          900: '#3d0906',
        },
        ink: '#0b1220',
        surface: '#f6f7fb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(10, 31, 68, 0.08), 0 8px 24px -8px rgba(10, 31, 68, 0.12)',
        'card-hover': '0 4px 12px -2px rgba(10, 31, 68, 0.12), 0 16px 40px -12px rgba(10, 31, 68, 0.2)',
        glow: '0 8px 30px -6px rgba(196, 31, 20, 0.4)',
        nav: '0 -1px 16px -4px rgba(10, 31, 68, 0.12)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0a1f44 0%, #13294d 45%, #7a130c 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #13294d 0%, #1f3a6e 60%, #9e1810 130%)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'slide-up': 'slide-up 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
