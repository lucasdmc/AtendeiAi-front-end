import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔌 Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Sending Request to Target:', req.method, req.url);
            // Manter headers importantes para SSE
            if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
              proxyReq.setHeader('Cache-Control', 'no-cache');
              proxyReq.setHeader('Accept', 'text/event-stream');
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Received Response from Target:', proxyRes.statusCode, req.url);
            // Verificar se é uma resposta SSE
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/event-stream')) {
              console.log('🎯 SSE Response detected');
            }
            // Verificar se é uma resposta de mídia
            if (req.url && req.url.includes('/media/')) {
              console.log('🖼️ Media Response:', proxyRes.statusCode, req.url);
            }
          });
        },
      },
      '/media': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          // Configuração silenciosa para mídia - sem logs desnecessários
        },
      }
    }
  }
})
