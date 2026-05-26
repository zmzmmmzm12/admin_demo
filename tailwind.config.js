/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin'

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark-surface': '#1e1e2d',
        'dark-surface-alt': '#1a1a27',
        'dark-border': '#30303d',
        'dark-canvas': '#151521',
        'dark-hover': '#242437',
        'main-color': '#4f46e5',
        'main-hover': '#4338ca',
      },
      boxShadow: {
        panel: '0 8px 24px rgba(15, 23, 42, 0.06)',
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      backgroundImage: {
        'admin-grid':
          'linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '28px 28px',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(15, 23, 42, 0.18)',
        },
      })
    }),
  ],
}
