/**
 * @fileoverview Test setup and global mocks
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
    vi.restoreAllMocks();
});
