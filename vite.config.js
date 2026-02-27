import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true, // Pour le dev
    proxy: {
      // Proxy pour toutes les routes API
      '/api': {
        target: 'https://api.builderberu.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/react/')) return 'react-vendor';
          // Animation
          if (id.includes('node_modules/framer-motion')) return 'framer-motion';
          // i18n framework
          if (id.includes('node_modules/i18next') ||
              id.includes('node_modules/react-i18next')) return 'i18n';
          // Translation JSON files (~584KB)
          if (id.includes('/i18n/') && id.endsWith('.json')) return 'translations';
          // Charts
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-')) return 'recharts';
          // Icons
          if (id.includes('node_modules/lucide-react')) return 'lucide';
        }
      }
    }
  }
})