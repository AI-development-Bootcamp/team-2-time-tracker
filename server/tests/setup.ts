/**
 * @fileoverview Test setup and global mocks
 */

// Set up test environment variables before any imports that might use them
// Only set defaults when not already provided (e.g., by CI)
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
