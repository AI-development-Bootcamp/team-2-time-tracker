import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiUrl = env.VITE_API_URL || 'http://localhost:3000';

    return {
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
            port: 5173,
            proxy: {
                '/api': {
                    target: apiUrl,
                    changeOrigin: true,
                },
            },
        },
    };
});
