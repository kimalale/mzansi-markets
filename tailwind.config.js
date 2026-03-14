/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}','../cloudphone-ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        hud:  ['Orbitron', 'monospace'],
      },
      keyframes: {
        'pulse-dot': {
          '0%,100%': { opacity:'1' },
          '50%':     { opacity:'0.2' },
        },
      },
      animation: {
        'pulse': 'pulse-dot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
