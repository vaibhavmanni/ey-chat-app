import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key:  fs.readFileSync('../server/ssl/key.pem'),
      cert: fs.readFileSync('../server/ssl/cert.pem'),
    },
    port: 5173
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,jsx}']
  }
})
