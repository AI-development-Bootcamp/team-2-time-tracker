import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/integration/**/*.test.ts'],
        setupFiles: ['./tests/integration/setup.ts'],
        retry: Number(process.env.VITEST_RETRIES ?? (process.env.CI ? 2 : 0)),
        reporters: ['default', './tests/integration/flaky-reporter.ts'],
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
