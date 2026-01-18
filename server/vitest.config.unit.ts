import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/unit/**/*.test.ts'],
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
});
