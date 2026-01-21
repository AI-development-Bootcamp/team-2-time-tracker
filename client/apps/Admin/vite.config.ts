import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@client/ui': path.resolve(__dirname, '../../packages/ui/src'),
            '@client/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
            '@client/utils': path.resolve(__dirname, '../../packages/utils/src'),
            '@shared/types': path.resolve(__dirname, '../../../shared/types/src'),
        },
        dedupe: ['react', 'react-dom'],
    },
    server: {
        port: 5174,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        passWithNoTests: true,
    },
});
