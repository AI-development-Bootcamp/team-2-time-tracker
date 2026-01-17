import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vite configuration - https://vite.dev/config/
export default defineConfig({
  // React plugin for JSX transformation and Fast Refresh
  plugins: [react()],

  // Path alias resolution to match tsconfig paths
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  // Production build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
