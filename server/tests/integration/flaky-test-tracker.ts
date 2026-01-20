/**
 * @fileoverview Flaky test tracking module for integration tests
 * Tracks tests that pass only after retry attempts
 */

export interface FlakyTestRecord {
    testName: string;
    filePath: string;
    attempts: number;
    maxRetries: number;
    errors: string[];
    timestamp: Date;
}

/**
 * Global registry for tracking flaky tests
 * Tests are considered "flaky" if they fail on initial attempt but pass on retry
 */
class FlakyTestRegistry {
    private flakyTests: Map<string, FlakyTestRecord> = new Map();
    private currentTestAttempts: Map<string, { attempt: number; errors: string[] }> = new Map();

    /**
     * Generate a unique key for a test
     */
    private getTestKey(filePath: string, testName: string): string {
        return `${filePath}::${testName}`;
    }

    /**
     * Record a test attempt (called on each retry)
     */
    recordAttempt(filePath: string, testName: string, attempt: number, error?: Error): void {
        const key = this.getTestKey(filePath, testName);
        const current = this.currentTestAttempts.get(key) || { attempt: 0, errors: [] };

        current.attempt = attempt;
        if (error) {
            current.errors.push(error.message || String(error));
        }

        this.currentTestAttempts.set(key, current);

        if (error) {
            console.log(
                `[FLAKY-TRACKER] Test retry attempt ${attempt}: "${testName}" in ${filePath}\n` +
                `  Error: ${error.message || String(error)}`
            );
        }
    }

    /**
     * Mark a test as passed - if it had previous failures, it's flaky
     */
    markTestPassed(filePath: string, testName: string, totalAttempts: number, maxRetries: number): void {
        const key = this.getTestKey(filePath, testName);
        const attempts = this.currentTestAttempts.get(key);

        // If test passed on first attempt, it's not flaky
        if (!attempts || attempts.errors.length === 0) {
            this.currentTestAttempts.delete(key);
            return;
        }

        // Test passed after retry - mark as flaky
        const record: FlakyTestRecord = {
            testName,
            filePath,
            attempts: totalAttempts,
            maxRetries,
            errors: attempts.errors,
            timestamp: new Date(),
        };

        this.flakyTests.set(key, record);
        this.currentTestAttempts.delete(key);

        console.log(
            `[FLAKY-TEST] ⚠️  "${testName}" passed after ${totalAttempts} attempt(s)\n` +
            `  File: ${filePath}\n` +
            `  Previous errors:\n${record.errors.map(e => `    - ${e}`).join('\n')}`
        );
    }

    /**
     * Mark a test as failed (exhausted all retries)
     */
    markTestFailed(filePath: string, testName: string): void {
        const key = this.getTestKey(filePath, testName);
        this.currentTestAttempts.delete(key);
    }

    /**
     * Get all flaky tests recorded in this run
     */
    getFlakyTests(): FlakyTestRecord[] {
        return Array.from(this.flakyTests.values());
    }

    /**
     * Check if a specific test was flaky
     */
    isFlaky(filePath: string, testName: string): boolean {
        return this.flakyTests.has(this.getTestKey(filePath, testName));
    }

    /**
     * Get flaky test count
     */
    getFlakyCount(): number {
        return this.flakyTests.size;
    }

    /**
     * Clear all records (for test isolation)
     */
    clear(): void {
        this.flakyTests.clear();
        this.currentTestAttempts.clear();
    }

    /**
     * Export flaky tests as JSON (for CI integration)
     */
    toJSON(): string {
        return JSON.stringify(this.getFlakyTests(), null, 2);
    }
}

// Global singleton instance
export const flakyTestTracker = new FlakyTestRegistry();

// Export for global access in Vitest
(globalThis as Record<string, unknown>).__FLAKY_TEST_TRACKER__ = flakyTestTracker;
