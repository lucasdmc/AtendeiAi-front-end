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
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok.io',
      '.ngrok-free.app',
      'aaf853bb4cee.ngrok-free.app'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (_proxy, _options) => {
          _proxy.on('error', (err, _req, _res) => {
            console.log('🔌 Proxy error:', err);
          });
          _proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📤 Sending Request to Target:', req.method, req.url);
            // Manter headers importantes para SSE
            if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
              proxyReq.setHeader('Cache-Control', 'no-cache');
              proxyReq.setHeader('Accept', 'text/event-stream');
            }
          });
          _proxy.on('proxyRes', (proxyRes, req, _res) => {
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
        configure: (_proxy, _options) => {
          // Configuração silenciosa para mídia - sem logs desnecessários
        },
      }
    }
  }
})
