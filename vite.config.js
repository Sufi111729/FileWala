import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api/remove-background': {
        target: process.env.BACKGROUND_REMOVER_API_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  esbuild: {
    legalComments: 'none',
    drop: ['console', 'debugger'],
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/');

          if (normalizedId.includes('ThirdPartyScripts.jsx')) {
            return 'ads';
          }

          if (!normalizedId.includes('node_modules')) return undefined;

          if (normalizedId.includes('lucide-react')) {
            return 'icons';
          }

          if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') || normalizedId.includes('/react-router-dom/')) {
            return 'react-vendor';
          }

          return undefined;
        },
      },
    },
  },
});
