/**
 * @fileoverview Tests for date utility functions (Israeli workweek)
 */

import { describe, it, expect } from 'vitest';
import {
    isIsraeliWorkday,
    expandDateRange,
    getWorkdaysInRange,
    calculateWorkdayCount,
    formatHebrewDate,
    formatHebrewMonthYear,
    formatHebrewDayName,
    parseISODate,
    toISODateString,
} from '@client/utils';

describe('Date Utilities', () => {
    describe('isIsraeliWorkday', () => {
        it('should return true for Sunday (day 0)', () => {
            const sunday = new Date('2026-01-18'); // Sunday
            expect(sunday.getDay()).toBe(0);
            expect(isIsraeliWorkday(sunday)).toBe(true);
        });

        it('should return true for Monday (day 1)', () => {
            const monday = new Date('2026-01-19'); // Monday
            expect(monday.getDay()).toBe(1);
            expect(isIsraeliWorkday(monday)).toBe(true);
        });

        it('should return true for Tuesday (day 2)', () => {
            const tuesday = new Date('2026-01-20'); // Tuesday
            expect(tuesday.getDay()).toBe(2);
            expect(isIsraeliWorkday(tuesday)).toBe(true);
        });

        it('should return true for Wednesday (day 3)', () => {
            const wednesday = new Date('2026-01-21'); // Wednesday
            expect(wednesday.getDay()).toBe(3);
            expect(isIsraeliWorkday(wednesday)).toBe(true);
        });

        it('should return true for Thursday (day 4)', () => {
            const thursday = new Date('2026-01-22'); // Thursday
            expect(thursday.getDay()).toBe(4);
            expect(isIsraeliWorkday(thursday)).toBe(true);
        });

        it('should return false for Friday (day 5)', () => {
            const friday = new Date('2026-01-16'); // Friday
            expect(friday.getDay()).toBe(5);
            expect(isIsraeliWorkday(friday)).toBe(false);
        });

        it('should return false for Saturday (day 6)', () => {
            const saturday = new Date('2026-01-17'); // Saturday
            expect(saturday.getDay()).toBe(6);
            expect(isIsraeliWorkday(saturday)).toBe(false);
        });
    });

    describe('expandDateRange', () => {
        it('should return single date for same start and end', () => {
            // Use local date constructor to avoid timezone issues
            const date = new Date(2026, 0, 15); // January 15, 2026
            const result = expandDateRange(date, date);

            expect(result).toHaveLength(1);
            expect(result[0].getDate()).toBe(15);
            expect(result[0].getMonth()).toBe(0);
            expect(result[0].getFullYear()).toBe(2026);
        });

        it('should return all dates in range (including weekends)', () => {
            const start = new Date(2026, 0, 15); // Thursday January 15
            const end = new Date(2026, 0, 18); // Sunday January 18
            const result = expandDateRange(start, end);

            expect(result).toHaveLength(4);
            expect(result[0].getDate()).toBe(15);
            expect(result[1].getDate()).toBe(16);
            expect(result[2].getDate()).toBe(17);
            expect(result[3].getDate()).toBe(18);
        });

        it('should handle week-long range', () => {
            const start = new Date('2026-01-18'); // Sunday
            const end = new Date('2026-01-24'); // Saturday
            const result = expandDateRange(start, end);

            expect(result).toHaveLength(7);
        });

        it('should return empty array for end before start', () => {
            const start = new Date('2026-01-20');
            const end = new Date('2026-01-15');
            const result = expandDateRange(start, end);

            expect(result).toHaveLength(0);
        });
    });

    describe('getWorkdaysInRange', () => {
        it('should return only workdays excluding Friday and Saturday', () => {
            // Sunday Jan 18 to Saturday Jan 24 - should return 5 workdays (Sun-Thu)
            const start = new Date('2026-01-18'); // Sunday
            const end = new Date('2026-01-24'); // Saturday
            const result = getWorkdaysInRange(start, end);

            expect(result).toHaveLength(5);

            // Verify each day is a workday
            result.forEach(date => {
                expect(isIsraeliWorkday(date)).toBe(true);
            });
        });

        it('should return empty array for weekend-only range', () => {
            const friday = new Date('2026-01-16'); // Friday
            const saturday = new Date('2026-01-17'); // Saturday
            const result = getWorkdaysInRange(friday, saturday);

            expect(result).toHaveLength(0);
        });

        it('should return single workday for single workday range', () => {
            const thursday = new Date('2026-01-15'); // Thursday
            const result = getWorkdaysInRange(thursday, thursday);

            expect(result).toHaveLength(1);
        });

        it('should skip weekends in multi-week range', () => {
            // Sun Jan 18 to Thu Jan 29 - should have 10 workdays
            // Week 1: Sun, Mon, Tue, Wed, Thu (5 days)
            // Week 2: Sun, Mon, Tue, Wed, Thu (5 days)
            const start = new Date('2026-01-18'); // Sunday
            const end = new Date('2026-01-29'); // Thursday
            const result = getWorkdaysInRange(start, end);

            expect(result).toHaveLength(10);
        });
    });

    describe('calculateWorkdayCount', () => {
        it('should count single workday', () => {
            const date = new Date('2026-01-15'); // Thursday
            const count = calculateWorkdayCount(date, date);

            expect(count).toBe(1);
        });

        it('should return 0 for weekend-only range', () => {
            const friday = new Date('2026-01-16');
            const saturday = new Date('2026-01-17');
            const count = calculateWorkdayCount(friday, saturday);

            expect(count).toBe(0);
        });

        it('should count 5 workdays for full Israeli work week', () => {
            // Sunday to Thursday
            const sunday = new Date('2026-01-18');
            const thursday = new Date('2026-01-22');
            const count = calculateWorkdayCount(sunday, thursday);

            expect(count).toBe(5);
        });

        it('should count workdays correctly for week spanning range', () => {
            // 2 weeks = 10 workdays
            const start = new Date('2026-01-18'); // Sunday
            const end = new Date('2026-01-29'); // Thursday (next week)
            const count = calculateWorkdayCount(start, end);

            expect(count).toBe(10);
        });
    });

    describe('formatHebrewDate', () => {
        it('should format date as DD/MM/YY', () => {
            const date = new Date('2026-01-15');
            const result = formatHebrewDate(date);

            expect(result).toBe('15/01/26');
        });

        it('should pad single digit day and month with zero', () => {
            const date = new Date('2026-05-05');
            const result = formatHebrewDate(date);

            expect(result).toBe('05/05/26');
        });

        it('should handle December correctly', () => {
            const date = new Date('2025-12-25');
            const result = formatHebrewDate(date);

            expect(result).toBe('25/12/25');
        });
    });

    describe('formatHebrewMonthYear', () => {
        it('should return Hebrew month name with year', () => {
            const date = new Date('2026-01-15');
            const result = formatHebrewMonthYear(date);

            // Result should contain year 2026 and a Hebrew month name
            expect(result).toContain('2026');
            // Hebrew month names vary by locale implementation
            expect(result.length).toBeGreaterThan(5);
        });
    });

    describe('formatHebrewDayName', () => {
        it('should return יום א\' for Sunday', () => {
            const sunday = new Date('2026-01-18');
            expect(sunday.getDay()).toBe(0);
            expect(formatHebrewDayName(sunday)).toBe("יום א'");
        });

        it('should return יום ב\' for Monday', () => {
            const monday = new Date('2026-01-19');
            expect(monday.getDay()).toBe(1);
            expect(formatHebrewDayName(monday)).toBe("יום ב'");
        });

        it('should return יום ג\' for Tuesday', () => {
            const tuesday = new Date('2026-01-20');
            expect(tuesday.getDay()).toBe(2);
            expect(formatHebrewDayName(tuesday)).toBe("יום ג'");
        });

        it('should return יום ד\' for Wednesday', () => {
            const wednesday = new Date('2026-01-21');
            expect(wednesday.getDay()).toBe(3);
            expect(formatHebrewDayName(wednesday)).toBe("יום ד'");
        });

        it('should return יום ה\' for Thursday', () => {
            const thursday = new Date('2026-01-22');
            expect(thursday.getDay()).toBe(4);
            expect(formatHebrewDayName(thursday)).toBe("יום ה'");
        });

        it('should return יום ו\' for Friday', () => {
            const friday = new Date('2026-01-16');
            expect(friday.getDay()).toBe(5);
            expect(formatHebrewDayName(friday)).toBe("יום ו'");
        });

        it('should return שבת for Saturday', () => {
            const saturday = new Date('2026-01-17');
            expect(saturday.getDay()).toBe(6);
            expect(formatHebrewDayName(saturday)).toBe('שבת');
        });
    });

    describe('parseISODate', () => {
        it('should parse YYYY-MM-DD format', () => {
            const result = parseISODate('2026-01-15');

            expect(result.getFullYear()).toBe(2026);
            expect(result.getMonth()).toBe(0); // January = 0
            expect(result.getDate()).toBe(15);
        });

        it('should handle end of year correctly', () => {
            const result = parseISODate('2025-12-31');

            expect(result.getFullYear()).toBe(2025);
            expect(result.getMonth()).toBe(11); // December = 11
            expect(result.getDate()).toBe(31);
        });

        it('should handle beginning of year correctly', () => {
            const result = parseISODate('2026-01-01');

            expect(result.getFullYear()).toBe(2026);
            expect(result.getMonth()).toBe(0);
            expect(result.getDate()).toBe(1);
        });
    });

    describe('toISODateString', () => {
        it('should format date as YYYY-MM-DD', () => {
            const date = new Date(2026, 0, 15); // January 15, 2026
            const result = toISODateString(date);

            expect(result).toBe('2026-01-15');
        });

        it('should pad single digit month and day', () => {
            const date = new Date(2026, 4, 5); // May 5, 2026
            const result = toISODateString(date);

            expect(result).toBe('2026-05-05');
        });

        it('should handle December correctly', () => {
            const date = new Date(2025, 11, 25); // December 25, 2025
            const result = toISODateString(date);

            expect(result).toBe('2025-12-25');
        });
    });

    describe('parseISODate and toISODateString roundtrip', () => {
        it('should roundtrip correctly', () => {
            const original = '2026-01-15';
            const parsed = parseISODate(original);
            const formatted = toISODateString(parsed);

            expect(formatted).toBe(original);
        });

        it('should roundtrip edge cases correctly', () => {
            const testDates = ['2026-01-01', '2025-12-31', '2026-06-15', '2026-11-30'];

            testDates.forEach(dateStr => {
                const parsed = parseISODate(dateStr);
                const formatted = toISODateString(parsed);
                expect(formatted).toBe(dateStr);
            });
        });
    });
});
