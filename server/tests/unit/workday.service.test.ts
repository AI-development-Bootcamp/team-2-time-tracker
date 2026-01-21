/**
 * @fileoverview Unit tests for workday.service.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    mockWorkdayPrisma,
    mockPrismaWorkdaySummary,
    mockPrismaTimeEntry,
    mockPrismaAbsenceDay,
    resetWorkdayPrismaMocks,
    createMockWorkdaySummary,
    createMockTimeEntry,
    createMockMonthLock,
} from '../helpers/mockWorkdayPrisma';

// Mock the repo module before importing service
import * as timeReportsRepo from '../../src/modules/time-reports/timeReports.repo';
vi.mocked(timeReportsRepo);

// Import after mocks
import * as workdayService from '../../src/modules/time-reports/workday.service';
import { BadRequestError } from '../../src/shared/errors';

describe('workday.service', () => {
    beforeEach(() => {
        resetWorkdayPrismaMocks();
        vi.clearAllMocks();

        // Mock Date to return consistent "today"
        const mockDate = new Date('2026-01-17T10:00:00.000Z');
        vi.setSystemTime(mockDate);

        // Default: no month lock
        vi.mocked(timeReportsRepo.findMonthLock).mockResolvedValue(null);
        // Default: no running timer
        vi.mocked(timeReportsRepo.findRunningTimer).mockResolvedValue(null);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('getWorkday', () => {
        it('should return workday summary for a date with entries', async () => {
            const mockSummary = createMockWorkdaySummary();
            const mockEntry = createMockTimeEntry();

            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(mockSummary);
            mockPrismaTimeEntry.findMany.mockResolvedValue([mockEntry]);
            mockPrismaAbsenceDay.findMany.mockResolvedValue([]);
            mockWorkdayPrisma.$queryRaw.mockResolvedValue([{ minutes: 0 }]);
            mockPrismaWorkdaySummary.update.mockResolvedValue(mockSummary);

            const result = await workdayService.getWorkday('test-user-id', '2026-01-17');

            expect(result).toHaveProperty('date', '2026-01-17');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('summary');
            expect(result.summary).toHaveProperty('targetMinutes', 540);
            expect(result.timeEntries).toHaveLength(1);
        });

        it('should create workday summary if it does not exist', async () => {
            const mockSummary = createMockWorkdaySummary();

            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(null);
            mockPrismaTimeEntry.findMany.mockResolvedValue([]);
            mockPrismaAbsenceDay.findMany.mockResolvedValue([]);
            mockWorkdayPrisma.$queryRaw.mockResolvedValue([{ minutes: 0 }]);
            mockPrismaWorkdaySummary.create.mockResolvedValue(mockSummary);

            const result = await workdayService.getWorkday('test-user-id', '2026-01-17');

            expect(mockPrismaWorkdaySummary.create).toHaveBeenCalled();
            expect(result).toHaveProperty('date', '2026-01-17');
        });

        it('should include absence minutes in total calculation', async () => {
            const mockSummary = createMockWorkdaySummary({ absenceMinutes: 60 });

            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(mockSummary);
            mockPrismaTimeEntry.findMany.mockResolvedValue([]);
            mockPrismaAbsenceDay.findMany.mockResolvedValue([{ minutes: 60, absenceRequest: { type: 'SICK' } }]);
            mockWorkdayPrisma.$queryRaw.mockResolvedValue([{ minutes: 60 }]);
            mockPrismaWorkdaySummary.update.mockResolvedValue({
                ...mockSummary,
                absenceMinutes: 60,
            });

            const result = await workdayService.getWorkday('test-user-id', '2026-01-17');

            expect(result.summary.absenceMinutes).toBe(60);
        });

        it('should return FULL status when total equals 540', async () => {
            const mockSummary = createMockWorkdaySummary({
                workMinutes: 540,
                status: 'FULL',
            });

            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(mockSummary);
            mockPrismaTimeEntry.findMany.mockResolvedValue([
                createMockTimeEntry({ durationMinutes: 540 }),
            ]);
            mockPrismaAbsenceDay.findMany.mockResolvedValue([]);
            mockWorkdayPrisma.$queryRaw.mockResolvedValue([{ minutes: 0 }]);
            mockPrismaWorkdaySummary.update.mockResolvedValue(mockSummary);

            const result = await workdayService.getWorkday('test-user-id', '2026-01-17');

            expect(result.status).toBe('FULL');
        });

        it('should return EXCEPTION status when total exceeds 540', async () => {
            const mockSummary = createMockWorkdaySummary({
                workMinutes: 600,
                status: 'EXCEPTION',
            });

            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(mockSummary);
            mockPrismaTimeEntry.findMany.mockResolvedValue([
                createMockTimeEntry({ durationMinutes: 600 }),
            ]);
            mockPrismaAbsenceDay.findMany.mockResolvedValue([]);
            mockWorkdayPrisma.$queryRaw.mockResolvedValue([{ minutes: 0 }]);
            mockPrismaWorkdaySummary.update.mockResolvedValue(mockSummary);

            const result = await workdayService.getWorkday('test-user-id', '2026-01-17');

            expect(result.status).toBe('EXCEPTION');
        });
    });

    describe('submitWorkday', () => {
        it('should submit workday successfully when total equals 540', async () => {
            const mockSummary = createMockWorkdaySummary({
                workMinutes: 540,
                status: 'FULL',
            });

            vi.mocked(timeReportsRepo.findMonthLock).mockResolvedValue(null);
            vi.mocked(timeReportsRepo.findRunningTimer).mockResolvedValue(null);

            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(mockSummary);
            mockPrismaTimeEntry.findMany.mockResolvedValue([
                createMockTimeEntry({ durationMinutes: 540 }),
            ]);
            mockPrismaAbsenceDay.findMany.mockResolvedValue([]);
            mockWorkdayPrisma.$queryRaw.mockResolvedValue([{ minutes: 0 }]);

            // First call (inside getWorkday) returns regular summary
            mockPrismaWorkdaySummary.update.mockResolvedValueOnce(mockSummary);

            // Second call (inside submitWorkday) returns submitted summary
            mockPrismaWorkdaySummary.update.mockResolvedValueOnce({
                ...mockSummary,
                isSubmitted: true,
                submittedAt: new Date(),
            });

            const result = await workdayService.submitWorkday('test-user-id', '2026-01-17');

            expect(result).toHaveProperty('date', '2026-01-17');
            expect(result).toHaveProperty('isSubmitted', true);
            expect(result).toHaveProperty('submittedAt');
        });

        it('should throw BadRequestError when month is locked', async () => {
            const mockLock = createMockMonthLock();
            vi.mocked(timeReportsRepo.findMonthLock).mockResolvedValue(mockLock);

            await expect(
                workdayService.submitWorkday('test-user-id', '2026-01-17')
            ).rejects.toThrow(BadRequestError);

            await expect(
                workdayService.submitWorkday('test-user-id', '2026-01-17')
            ).rejects.toThrow('month is locked');
        });

        it('should throw BadRequestError when timer is running', async () => {
            vi.mocked(timeReportsRepo.findRunningTimer).mockResolvedValue({
                id: 'timer-id',
                userId: 'test-user-id',
                workDate: new Date('2026-01-17'),
                startedAt: new Date(),
                stoppedAt: null,
                durationMinutes: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                isRunning: true,
            });

            await expect(
                workdayService.submitWorkday('test-user-id', '2026-01-17')
            ).rejects.toThrow(BadRequestError);

            await expect(
                workdayService.submitWorkday('test-user-id', '2026-01-17')
            ).rejects.toThrow('timer is still running');
        });

        it('should throw BadRequestError when total does not equal 540', async () => {
            const mockSummary = createMockWorkdaySummary({ workMinutes: 480 });

            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(mockSummary);
            mockPrismaTimeEntry.findMany.mockResolvedValue([
                createMockTimeEntry({ durationMinutes: 480 }),
            ]);
            mockPrismaAbsenceDay.findMany.mockResolvedValue([]);
            mockWorkdayPrisma.$queryRaw.mockResolvedValue([{ minutes: 0 }]);
            mockPrismaWorkdaySummary.update.mockResolvedValue(mockSummary);

            await expect(
                workdayService.submitWorkday('test-user-id', '2026-01-17')
            ).rejects.toThrow(BadRequestError);

            await expect(
                workdayService.submitWorkday('test-user-id', '2026-01-17')
            ).rejects.toThrow('total minutes');
        });

        it('should throw BadRequestError when workday is already submitted', async () => {
            const mockSummary = createMockWorkdaySummary({
                workMinutes: 540,
                isSubmitted: true,
            });

            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(mockSummary);
            mockPrismaTimeEntry.findMany.mockResolvedValue([
                createMockTimeEntry({ durationMinutes: 540 }),
            ]);
            mockPrismaAbsenceDay.findMany.mockResolvedValue([]);
            mockWorkdayPrisma.$queryRaw.mockResolvedValue([{ minutes: 0 }]);
            mockPrismaWorkdaySummary.update.mockResolvedValue(mockSummary);

            await expect(
                workdayService.submitWorkday('test-user-id', '2026-01-17')
            ).rejects.toThrow(BadRequestError);

            await expect(
                workdayService.submitWorkday('test-user-id', '2026-01-17')
            ).rejects.toThrow('already submitted');
        });
    });

    describe('cancelWorkdaySubmission', () => {
        it('should cancel workday submission successfully', async () => {
            const mockSummary = createMockWorkdaySummary({
                isSubmitted: true,
                submittedAt: new Date(),
            });

            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(mockSummary);
            mockPrismaWorkdaySummary.update.mockResolvedValue({
                ...mockSummary,
                isSubmitted: false,
                submittedAt: null,
            });

            const result = await workdayService.cancelWorkdaySubmission('test-user-id', '2026-01-17');

            expect(result).toHaveProperty('message');
            expect(mockPrismaWorkdaySummary.update).toHaveBeenCalled();
        });

        it('should throw BadRequestError when month is locked', async () => {
            const mockLock = createMockMonthLock();
            vi.mocked(timeReportsRepo.findMonthLock).mockResolvedValue(mockLock);

            await expect(
                workdayService.cancelWorkdaySubmission('test-user-id', '2026-01-17')
            ).rejects.toThrow(BadRequestError);

            await expect(
                workdayService.cancelWorkdaySubmission('test-user-id', '2026-01-17')
            ).rejects.toThrow('month is locked');
        });

        it('should throw BadRequestError when workday is not submitted', async () => {
            const mockSummary = createMockWorkdaySummary({ isSubmitted: false });

            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(mockSummary);

            await expect(
                workdayService.cancelWorkdaySubmission('test-user-id', '2026-01-17')
            ).rejects.toThrow(BadRequestError);

            await expect(
                workdayService.cancelWorkdaySubmission('test-user-id', '2026-01-17')
            ).rejects.toThrow('not submitted');
        });

        it('should throw BadRequestError when no workday exists', async () => {
            mockPrismaWorkdaySummary.findUnique.mockResolvedValue(null);

            await expect(
                workdayService.cancelWorkdaySubmission('test-user-id', '2026-01-17')
            ).rejects.toThrow(BadRequestError);

            await expect(
                workdayService.cancelWorkdaySubmission('test-user-id', '2026-01-17')
            ).rejects.toThrow('No workday found');
        });
    });

    describe('getMonthlyCalendar', () => {
        it('should return monthly calendar with all days', async () => {
            mockPrismaWorkdaySummary.findMany.mockResolvedValue([]);

            const result = await workdayService.getMonthlyCalendar('test-user-id', '2026-01');

            expect(result).toHaveProperty('month', '2026-01');
            expect(result).toHaveProperty('days');
            expect(result.days.length).toBeGreaterThan(0);
            expect(result).toHaveProperty('summary');
        });

        it('should mark weekends correctly', async () => {
            mockPrismaWorkdaySummary.findMany.mockResolvedValue([]);

            const result = await workdayService.getMonthlyCalendar('test-user-id', '2026-01');

            // Find a Saturday (2026-01-03 is a Saturday)
            const saturday = result.days.find((d) => d.date === '2026-01-03');
            expect(saturday?.status).toBe('WEEKEND');
        });

        it('should include workday summaries for days with entries', async () => {
            const mockSummary = createMockWorkdaySummary({
                workDate: new Date('2026-01-15'),
                workMinutes: 540,
                status: 'FULL',
                isSubmitted: true,
            });

            mockPrismaWorkdaySummary.findMany.mockResolvedValue([mockSummary]);

            const result = await workdayService.getMonthlyCalendar('test-user-id', '2026-01');

            const day15 = result.days.find((d) => d.date === '2026-01-15');
            expect(day15?.status).toBe('FULL');
            expect(day15?.isSubmitted).toBe(true);
        });

        it('should calculate monthly totals correctly', async () => {
            const summaries = [
                createMockWorkdaySummary({
                    workDate: new Date('2026-01-06'),
                    workMinutes: 540,
                }),
                createMockWorkdaySummary({
                    workDate: new Date('2026-01-07'),
                    workMinutes: 480,
                }),
            ];

            mockPrismaWorkdaySummary.findMany.mockResolvedValue(summaries);

            const result = await workdayService.getMonthlyCalendar('test-user-id', '2026-01');

            expect(result.summary.totalWorkMinutes).toBe(1020); // 540 + 480
            expect(result.summary.balanceMinutes).toBeLessThan(0);
        });
    });
});
