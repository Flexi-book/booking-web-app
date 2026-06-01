import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Evita CORS en dev — Vite reenvía la petición al backend
      '/proxy/catalog': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/catalog/, '/api'),
        headers: { 'Accept-Charset': 'UTF-8' },
      },
      '/proxy/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/auth/, '/api/auth'),
      },
      '/proxy/bff-user': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/bff-user/, '/api/user'),
      },
      '/proxy/backoffice': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/backoffice/, '/api/backoffice'),
      },
    },
  },
  // Silenciar warnings de React Router v6 → v7
  define: {
    'process.env.ROUTER_FUTURE': JSON.stringify({
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }),
  },
})
