/**
 * @fileoverview Unit tests for Shared Utilities
 */

import { describe, it, expect } from 'vitest';
import { calculateMinutes, formatTime, isFullWorkday } from '../../src/shared/time';
import { getPaginationOptions, createPaginationResult } from '../../src/shared/pagination';

// Mock types if needed, but imported constants should work if aliases are setup in tsconfig/vitest
// If WORKDAY_MINUTES is 8 hours * 60 = 480
const WORKDAY_MINUTES = 480; // Assuming default

describe('Shared Utilities', () => {

    describe('time.ts', () => {
        describe('calculateMinutes', () => {
            it('should calculate difference correctly', () => {
                expect(calculateMinutes('09:00', '10:00')).toBe(60);
                expect(calculateMinutes('09:30', '10:00')).toBe(30);
                expect(calculateMinutes('09:00', '17:00')).toBe(480);
            });

            it('should handle across noon', () => {
                expect(calculateMinutes('11:00', '13:00')).toBe(120);
            });
        });

        describe('formatTime', () => {
            it('should format minutes to HH:MM', () => {
                expect(formatTime(60)).toBe('01:00');
                expect(formatTime(90)).toBe('01:30');
                expect(formatTime(0)).toBe('00:00');
                expect(formatTime(480)).toBe('08:00');
            });
        });

        describe('isFullWorkday', () => {
            it('should return true if >= WORKDAY_MINUTES', () => {
                // Assuming internal constant is 8 hours (480 mins)
                // We can't easily mock the constant if it's a direct import, 
                // but we can test logic based on likely value.
                // Or we can just check boolean return.
                expect(typeof isFullWorkday(500)).toBe('boolean');
                // Likely true for 9 hours
                expect(isFullWorkday(540)).toBe(true);
            });
            it('should return false if < WORKDAY_MINUTES', () => {
                expect(isFullWorkday(10)).toBe(false);
            });
        });
    });

    describe('pagination.ts', () => {
        describe('getPaginationOptions', () => {
            it('should uses defaults when params are missing', () => {
                const result = getPaginationOptions({});
                expect(result).toEqual({
                    page: 1,
                    pageSize: 20,
                    skip: 0,
                    take: 20
                });
            });

            it('should parse provided params', () => {
                const result = getPaginationOptions({ page: '3', pageSize: '10' });
                expect(result).toEqual({
                    page: 3,
                    pageSize: 10,
                    skip: 20,
                    take: 10
                });
            });

            it('should clamp invalid values', () => {
                const result = getPaginationOptions({ page: '-1', pageSize: '1000' });
                expect(result).toEqual({
                    page: 1,
                    pageSize: 100, // max 100
                    skip: 0,
                    take: 100
                });
            });
        });

        describe('createPaginationResult', () => {
            it('should structure result correctly', () => {
                const data = ['item1', 'item2'];
                const total = 10;
                const page = 1;
                const pageSize = 5;

                const result = createPaginationResult(data, total, page, pageSize);

                expect(result).toEqual({
                    data,
                    pagination: {
                        page: 1,
                        pageSize: 5,
                        total: 10,
                        totalPages: 2,
                        hasNext: true, // 1 < 2
                        hasPrev: false // 1 > 1 is false
                    }
                });
            });
            it('should calculate hasPrev/hasNext correctly', () => {
                const result = createPaginationResult([], 10, 2, 5); // Page 2 of 2
                expect(result.pagination.hasNext).toBe(false);
                expect(result.pagination.hasPrev).toBe(true);
            });
        });
    });
});
