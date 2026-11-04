import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendTarget = process.env.VITE_BACKEND_TARGET || 'http://127.0.0.1:8003'

export default defineConfig({
  plugins: [react(), {
    name: 'production-content-security-policy',
    apply: 'build',
    transformIndexHtml() {
      return [{ tag: 'meta', attrs: {
        'http-equiv': 'Content-Security-Policy',
        content: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
      }, injectTo: 'head-prepend' }]
    },
  }],
  server: {
    proxy: {
      '/api': { target: backendTarget, changeOrigin: true },
      '/media': { target: backendTarget, changeOrigin: true },
    },
  },
})
