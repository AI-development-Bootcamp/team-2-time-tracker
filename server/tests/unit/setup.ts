/**
 * @fileoverview Unit tests setup with mocks
 */

// Set up test environment variables before any imports that might use them
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
process.env.NODE_ENV = 'test';
process.env.DEFAULT_SEED_PASSWORD = 'test-default-password';
process.env.DATABASE_PASSWORD = 'test-database-password';

import { vi, beforeEach } from 'vitest';

// Reset all mocks before each test
beforeEach(() => {
    vi.resetAllMocks();
});
