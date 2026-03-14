import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// Set BASE to your GitHub Pages repo name: /rps-duel/
const BASE = '/rps-duel/'

export default defineConfig(({ mode }) => ({
  base: BASE,

  plugins: [
    react(),
    // Bundle analyser — open stats.html after build to inspect sizes
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  resolve: {
    alias: {
      // Import framework as '@cloudphone/...' from anywhere in the app
      '@cloudphone': path.resolve(__dirname, '../../src'),
    },
  },

  build: {
    // Target CloudPhone's Chromium engine (modern baseline)
    target: 'es2020',

    // Warn if total bundle exceeds 150KB gzipped
    chunkSizeWarningLimit: 150,

    rollupOptions: {
      output: {
        // Inline everything into a single JS chunk — CloudPhone prefers
        // minimal network requests on slow 4G connections
        manualChunks: undefined,
      },
    },

    // Inline assets under 100KB into the HTML (fonts, small images)
    assetsInlineLimit: 100 * 1024,
  },

  // Dev server matches the production base path
  server: {
    port: 5173,
  },
}))
