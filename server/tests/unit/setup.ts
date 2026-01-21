/**
 * @fileoverview Unit tests setup with mocks
 */

// Set up test environment variables before any imports that might use them
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
process.env.NODE_ENV = 'test';

import { vi, beforeEach } from 'vitest';

// Reset all mocks before each test
beforeEach(() => {
    vi.resetAllMocks();
});
