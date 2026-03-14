import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

export default defineConfig({
  base: '/mzansi-markets/',
  plugins: [react(), visualizer({ filename:'dist/stats.html', gzipSize:true })],
  resolve: { alias: { '@cloudphone': path.resolve(__dirname, '../cloudphone-ui/src') } },
  build: { target:'es2020', chunkSizeWarningLimit:200, assetsInlineLimit: 100*1024 },
})
