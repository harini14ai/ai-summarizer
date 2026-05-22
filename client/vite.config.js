// Vite Configuration
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: command === 'serve' ? {
    port: 5173,
    proxy: {
      '/api': {
        // Local development proxy only. Production uses VITE_API_URL.
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  } : undefined,
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
}))
