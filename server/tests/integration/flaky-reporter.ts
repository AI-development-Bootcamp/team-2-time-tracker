/**
 * @fileoverview Custom Vitest reporter for flaky test detection and reporting
 * Reports tests that passed only after retry attempts
 */

import type { Reporter, File, Vitest } from 'vitest';
import { flakyTestTracker, type FlakyTestRecord } from './flaky-test-tracker';
import * as fs from 'fs';
import * as path from 'path';

export class FlakyTestReporter implements Reporter {
    private ctx!: Vitest;
    private outputPath: string;

    constructor(options?: { outputPath?: string }) {
        this.outputPath = options?.outputPath ?? 'flaky-tests-report.json';
    }

    onInit(ctx: Vitest): void {
        this.ctx = ctx;
        // Clear tracker at start of run
        flakyTestTracker.clear();
    }

    onFinished(files?: File[]): void {
        const flakyTests = flakyTestTracker.getFlakyTests();

        if (flakyTests.length === 0) {
            console.log('\n✅ No flaky tests detected in this run.\n');
            return;
        }

        // Print summary to console
        this.printFlakySummary(flakyTests);

        // Write JSON report for CI integration
        this.writeReport(flakyTests);
    }

    private printFlakySummary(flakyTests: FlakyTestRecord[]): void {
        console.log('\n' + '='.repeat(80));
        console.log('⚠️  FLAKY TESTS REPORT');
        console.log('='.repeat(80));
        console.log(`\nDetected ${flakyTests.length} flaky test(s) that passed only after retry:\n`);

        for (const test of flakyTests) {
            console.log(`  📍 ${test.testName}`);
            console.log(`     File: ${test.filePath}`);
            console.log(`     Attempts: ${test.attempts} (max retries: ${test.maxRetries})`);
            console.log('     Previous failures:');
            for (const error of test.errors) {
                const truncatedError = error.length > 200 ? error.substring(0, 200) + '...' : error;
                console.log(`       - ${truncatedError}`);
            }
            console.log('');
        }

        console.log('='.repeat(80));
        console.log('ACTION REQUIRED: These tests are unreliable and should be investigated.');
        console.log('Consider:');
        console.log('  1. Adding proper test isolation (setup/teardown)');
        console.log('  2. Checking for race conditions or timing issues');
        console.log('  3. Ensuring deterministic test data');
        console.log('  4. Moving to a separate flaky test suite for quarantine');
        console.log('='.repeat(80) + '\n');
    }

    private writeReport(flakyTests: FlakyTestRecord[]): void {
        const report = {
            timestamp: new Date().toISOString(),
            totalFlakyTests: flakyTests.length,
            tests: flakyTests.map(t => ({
                testName: t.testName,
                filePath: t.filePath,
                attempts: t.attempts,
                maxRetries: t.maxRetries,
                errors: t.errors,
                timestamp: t.timestamp.toISOString(),
            })),
        };

        try {
            const outputDir = path.dirname(this.outputPath);
            if (outputDir && outputDir !== '.' && !fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            fs.writeFileSync(this.outputPath, JSON.stringify(report, null, 2));
            console.log(`📄 Flaky test report written to: ${this.outputPath}\n`);
        } catch (error) {
            console.error(`Failed to write flaky test report: ${error}`);
        }
    }
}

export default FlakyTestReporter;
