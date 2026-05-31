import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    legalComments: 'none',
    drop: ['console', 'debugger'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('lucide-react')) {
            return 'icons';
          }

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/') || id.includes('/react-helmet-async/')) {
            return 'react-vendor';
          }

          if (id.includes('pdf-lib')) {
            return 'pdf-tools';
          }

          return undefined;
        },
      },
    },
  },
});
