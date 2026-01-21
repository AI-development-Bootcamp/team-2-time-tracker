import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/unit/**/*.test.ts'],
        retry: Number(process.env.VITEST_RETRIES ?? (process.env.CI ? 2 : 0)),
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
                branches: 60,
                functions: 60,
                lines: 60,
                statements: 60,
            },
        },
        setupFiles: ['./tests/unit/setup.ts'],
    },
    resolve: {
        alias: {
            '@shared/types': '../shared/types/src/index.ts',
        },
    },
});
