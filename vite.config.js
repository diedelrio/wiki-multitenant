import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const packageInfo = require('./package.json')

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageInfo.version),
    __APP_DESCRIPTION__: JSON.stringify(packageInfo.description),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  publicDir: false,
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000' } },
  preview: { port: 4173 },
})
