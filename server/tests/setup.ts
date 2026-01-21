/**
 * @fileoverview Test setup and global mocks
 */

// Set up test environment variables before any imports that might use them
// Only set defaults when not already provided (e.g., by CI)

// Track if we're using a mock DATABASE_URL (for tests that need real DB connection)
const hasRealDatabaseUrl = !!process.env.DATABASE_URL;
process.env.TEST_HAS_REAL_DATABASE = hasRealDatabaseUrl ? 'true' : 'false';

// DATABASE_URL is needed so db/index.ts can load without throwing
// (the actual DB calls are mocked, so this URL is never used)
process.env.DATABASE_URL ??= 'postgresql://mock:mock@localhost:5432/mock_db';
process.env.JWT_SECRET ??= 'test-jwt-secret-for-testing';
process.env.JWT_REFRESH_SECRET ??= 'test-jwt-refresh-secret-for-testing';
process.env.NODE_ENV ??= 'test';

import { vi, beforeEach, afterEach } from 'vitest';

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
    vi.restoreAllMocks();
});
