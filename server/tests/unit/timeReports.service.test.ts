/**
 * @fileoverview Unit tests for timeReports.service.ts
 * Note: These tests focus on validation and error handling.
 * Full integration tests cover the complete flow with proper date handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    mockTimerPrisma,
    mockPrismaTimer,
    mockPrismaTimeEntry,
    mockPrismaMonthLock,
    mockPrismaTaskAssignment,
    mockPrismaTask,
    mockPrismaWorkdaySummary,
    resetTimerPrismaMocks,
    createMockTimer,
    createMockTaskAssignment,
    createMockTask,
    createMockTimeEntry,
    createMockMonthLock,
    createMockWorkdaySummary,
} from '../helpers/mockTimerPrisma';

// Import after mocks
import * as timeReportsService from '../../src/modules/time-reports/timeReports.service';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../src/shared/errors';

describe('timeReports.service', () => {
    beforeEach(() => {
        resetTimerPrismaMocks();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('createTimeEntry', () => {
        it('should throw BadRequestError when timer is running', async () => {
            mockPrismaTimer.findFirst.mockResolvedValue(createMockTimer());

            await expect(
                timeReportsService.createTimeEntry('test-user-id', {
                    workDate: '2020-01-15', // Past date
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'OFFICE',
                    taskId: 'test-task-id',
                    description: 'Working on test task implementation',
                })
            ).rejects.toThrow(BadRequestError);

            await expect(
                timeReportsService.createTimeEntry('test-user-id', {
                    workDate: '2020-01-15',
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'OFFICE',
                    taskId: 'test-task-id',
                    description: 'Working on test task implementation',
                })
            ).rejects.toThrow('timer is running');
        });

        it('should throw BadRequestError for future dates', async () => {
            mockPrismaTimer.findFirst.mockResolvedValue(null);

            // Use a clearly future date
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            const futureDateStr = futureDate.toISOString().split('T')[0];

            await expect(
                timeReportsService.createTimeEntry('test-user-id', {
                    workDate: futureDateStr,
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'OFFICE',
                    taskId: 'test-task-id',
                    description: 'Working on test task implementation',
                })
            ).rejects.toThrow(BadRequestError);

            await expect(
                timeReportsService.createTimeEntry('test-user-id', {
                    workDate: futureDateStr,
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'OFFICE',
                    taskId: 'test-task-id',
                    description: 'Working on test task implementation',
                })
            ).rejects.toThrow('future dates');
        });

        it('should throw BadRequestError when description is too short', async () => {
            mockPrismaTimer.findFirst.mockResolvedValue(null);

            await expect(
                timeReportsService.createTimeEntry('test-user-id', {
                    workDate: '2020-01-15',
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'OFFICE',
                    taskId: 'test-task-id',
                    description: 'short', // Too short
                })
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('getTimeEntryById', () => {
        it('should throw NotFoundError when entry does not exist', async () => {
            mockPrismaTimeEntry.findFirst.mockResolvedValue(null);

            await expect(
                timeReportsService.getTimeEntryById('test-user-id', 'non-existent-id')
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError when entry belongs to different user', async () => {
            const mockEntry = createMockTimeEntry({ userId: 'other-user-id' });
            mockPrismaTimeEntry.findFirst.mockResolvedValue(mockEntry);

            await expect(
                timeReportsService.getTimeEntryById('test-user-id', 'test-entry-id')
            ).rejects.toThrow(ForbiddenError);
        });

        it('should return time entry for valid id and user', async () => {
            const mockTask = createMockTask();
            const mockEntry = createMockTimeEntry({
                userId: 'test-user-id',
                task: mockTask,
            });
            mockPrismaTimeEntry.findFirst.mockResolvedValue(mockEntry);

            const result = await timeReportsService.getTimeEntryById('test-user-id', 'test-entry-id');

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('task');
        });
    });

    describe('updateTimeEntry', () => {
        it('should throw BadRequestError when trying to change workDate', async () => {
            await expect(
                timeReportsService.updateTimeEntry('test-user-id', 'test-entry-id', {
                    workDate: '2026-01-18',
                })
            ).rejects.toThrow(BadRequestError);

            await expect(
                timeReportsService.updateTimeEntry('test-user-id', 'test-entry-id', {
                    workDate: '2026-01-18',
                })
            ).rejects.toThrow('workDate is immutable');
        });

        it('should throw NotFoundError when entry does not exist', async () => {
            mockPrismaTimeEntry.findFirst.mockResolvedValue(null);

            await expect(
                timeReportsService.updateTimeEntry('test-user-id', 'non-existent-id', {
                    description: 'Updated description for the task',
                })
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError when entry belongs to different user', async () => {
            const mockEntry = createMockTimeEntry({ userId: 'other-user-id' });
            mockPrismaTimeEntry.findFirst.mockResolvedValue(mockEntry);

            await expect(
                timeReportsService.updateTimeEntry('test-user-id', 'test-entry-id', {
                    description: 'Updated description for the task',
                })
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw BadRequestError when month is locked', async () => {
            const mockEntry = createMockTimeEntry({ userId: 'test-user-id' });
            mockPrismaTimeEntry.findFirst.mockResolvedValue(mockEntry);
            mockPrismaMonthLock.findFirst.mockResolvedValue(createMockMonthLock());

            await expect(
                timeReportsService.updateTimeEntry('test-user-id', 'test-entry-id', {
                    description: 'Updated description for the task',
                })
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('deleteTimeEntry', () => {
        it('should throw NotFoundError when entry does not exist', async () => {
            mockPrismaTimeEntry.findFirst.mockResolvedValue(null);

            await expect(
                timeReportsService.deleteTimeEntry('test-user-id', 'non-existent-id')
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError when entry belongs to different user', async () => {
            const mockEntry = createMockTimeEntry({ userId: 'other-user-id' });
            mockPrismaTimeEntry.findFirst.mockResolvedValue(mockEntry);

            await expect(
                timeReportsService.deleteTimeEntry('test-user-id', 'test-entry-id')
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw BadRequestError when month is locked', async () => {
            const mockEntry = createMockTimeEntry({ userId: 'test-user-id' });
            mockPrismaTimeEntry.findFirst.mockResolvedValue(mockEntry);
            mockPrismaMonthLock.findFirst.mockResolvedValue(createMockMonthLock());

            await expect(
                timeReportsService.deleteTimeEntry('test-user-id', 'test-entry-id')
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('getTimeEntryHistory', () => {
        it('should return paginated history', async () => {
            const mockTask = createMockTask();
            const mockEntries = [
                createMockTimeEntry({ task: mockTask }),
                createMockTimeEntry({ id: 'entry-2', task: mockTask }),
            ];

            mockPrismaTimeEntry.findMany.mockResolvedValue(mockEntries);
            mockPrismaTimeEntry.count.mockResolvedValue(2);

            const result = await timeReportsService.getTimeEntryHistory('test-user-id', {
                page: 1,
                pageSize: 20,
            });

            expect(result).toHaveProperty('entries');
            expect(result).toHaveProperty('pagination');
            expect(result.entries).toHaveLength(2);
            expect(result.pagination.total).toBe(2);
        });
    });

    describe('batchCreateTimeEntries', () => {
        it('should throw BadRequestError when timer is running', async () => {
            mockPrismaTimer.findFirst.mockResolvedValue(createMockTimer());

            await expect(
                timeReportsService.batchCreateTimeEntries('test-user-id', [
                    {
                        workDate: '2020-01-15',
                        startTime: '09:00',
                        endTime: '10:30',
                        location: 'OFFICE',
                        taskId: 'test-task-id',
                        description: 'Working on test task implementation',
                    },
                ])
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError when entries are on different dates', async () => {
            mockPrismaTimer.findFirst.mockResolvedValue(null);

            await expect(
                timeReportsService.batchCreateTimeEntries('test-user-id', [
                    {
                        workDate: '2020-01-15',
                        startTime: '09:00',
                        endTime: '10:30',
                        location: 'OFFICE',
                        taskId: 'test-task-id',
                        description: 'Working on test task implementation',
                    },
                    {
                        workDate: '2020-01-14', // Different date
                        startTime: '11:00',
                        endTime: '12:30',
                        location: 'OFFICE',
                        taskId: 'test-task-id',
                        description: 'Working on another task implementation',
                    },
                ])
            ).rejects.toThrow(BadRequestError);

            await expect(
                timeReportsService.batchCreateTimeEntries('test-user-id', [
                    {
                        workDate: '2020-01-15',
                        startTime: '09:00',
                        endTime: '10:30',
                        location: 'OFFICE',
                        taskId: 'test-task-id',
                        description: 'Working on test task implementation',
                    },
                    {
                        workDate: '2020-01-14',
                        startTime: '11:00',
                        endTime: '12:30',
                        location: 'OFFICE',
                        taskId: 'test-task-id',
                        description: 'Working on another task implementation',
                    },
                ])
            ).rejects.toThrow('same date');
        });
    });
});
