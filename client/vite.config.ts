import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vite configuration - https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:3000';

  return {
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
          target: apiUrl,
          changeOrigin: true,
        },
        '/health': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },

    // Production build configuration
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
