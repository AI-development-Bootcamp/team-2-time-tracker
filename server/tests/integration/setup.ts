/**
 * @fileoverview Integration test setup with flaky test tracking
 * Monitors retry attempts and logs tests that pass only after retries
 */

// Set up test environment variables before any imports
process.env.JWT_SECRET ??= 'test-jwt-secret-for-testing';
process.env.JWT_REFRESH_SECRET ??= 'test-jwt-refresh-secret-for-testing';
process.env.NODE_ENV ??= 'test';

import { vi, beforeEach, afterEach, onTestFailed, onTestFinished } from 'vitest';
import { flakyTestTracker } from './flaky-test-tracker';

// Track current test context for retry monitoring
let currentTestRetryCount = 0;
let currentTestErrors: Error[] = [];

// Reset all mocks before each test
beforeEach((context) => {
    vi.clearAllMocks();

    // Access retry count from task context
    const task = context.task;
    const retryCount = task.retry ?? 0;

    if (retryCount > 0) {
        // This is a retry attempt
        const filePath = task.file?.name ?? 'unknown';
        const testName = task.name;

        // Log the retry attempt with previous error if available
        const lastError = currentTestErrors[currentTestErrors.length - 1];
        flakyTestTracker.recordAttempt(filePath, testName, retryCount, lastError);
    } else {
        // First attempt - reset tracking
        currentTestRetryCount = 0;
        currentTestErrors = [];
    }

    currentTestRetryCount = retryCount;
});

// Capture test failures for retry tracking
onTestFailed((result) => {
    if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        currentTestErrors.push(error instanceof Error ? error : new Error(String(error)));
    }
});

// Track test completion to identify flaky tests
onTestFinished((result) => {
    const task = result.task;
    const filePath = task.file?.name ?? 'unknown';
    const testName = task.name;
    const retryCount = task.retry ?? 0;

    // Get max retries from config (default to 2 as per vitest.config.integration.ts)
    const maxRetries = 2;

    if (result.state === 'pass') {
        // Test passed - check if it was after retries (flaky)
        flakyTestTracker.markTestPassed(filePath, testName, retryCount + 1, maxRetries);
    } else if (result.state === 'fail') {
        // Test failed completely
        flakyTestTracker.markTestFailed(filePath, testName);
    }
});

// Clean up after each test
afterEach(() => {
    vi.restoreAllMocks();
});
