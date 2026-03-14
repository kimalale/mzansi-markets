/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── CloudPhone colour palette ─────────────────────
      colors: {
        'cp-bg':      '#0a0a12',
        'cp-bg2':     '#0f0f1a',
        'cp-bg3':     '#14142a',
        'cp-border':  '#1e1e35',
        'cp-border2': '#2a2a45',
        'cp-accent':  '#7b6fff',
        'cp-accent2': '#a599ff',
        'cp-win':     '#3fc96d',
        'cp-lose':    '#e05555',
        'cp-draw':    '#d4a53a',
        'cp-text':    '#ccccdd',
        'cp-muted':   '#555566',
      },

      // ── Fonts ──────────────────────────────────────────
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        hud:  ['Orbitron', 'monospace'],
      },

      // ── Animations ────────────────────────────────────
      keyframes: {
        'cd-pop': {
          '0%':   { transform: 'scale(1.4)', opacity: '0.4' },
          '60%':  { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pop-win': {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        'flash': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
      animation: {
        'cd-pop':  'cd-pop 0.35s ease forwards',
        'pop-win': 'pop-win 0.3s ease',
        'flash':   'flash 0.15s linear 2',
      },
    },
  },
  plugins: [],
}
