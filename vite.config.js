import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const proxyPrefix = (process.env.VITE_API_PROXY_PREFIX || 'api').replace(
  /^\/+|\/+$/g,
  '',
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      [`/${proxyPrefix}`]: {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
