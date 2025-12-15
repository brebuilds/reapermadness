/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        reaper: {
          bg: '#1a1a1a',
          surface: '#2d2d2d',
          border: '#404040',
          accent: '#4a9eff',
          record: '#ff4444',
          play: '#44ff44',
          stop: '#ffaa00',
        },
      },
    },
  },
  plugins: [],
};
