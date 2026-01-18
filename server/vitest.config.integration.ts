import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/integration/**/*.test.ts'],
        retry: 2,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json'],
            include: ['src/**/*.ts'],
            exclude: [
                'src/app.ts',
                'src/config/**',
                'src/**/*.d.ts',
            ],
            thresholds: {
                branches: 50,
                functions: 50,
                lines: 50,
                statements: 50,
            },
        },
        // Integration tests need more time for database operations
        testTimeout: 30000,
        hookTimeout: 30000,
    },
});
