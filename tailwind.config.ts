import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1c1917',
        panel: '#292524',
        muted: '#9aa3b2',
        text: '#e6e9ef',
        primary: '#6b4eff',
        danger: '#ff5277',
      },
    },
  },
  plugins: [],
} satisfies Config
