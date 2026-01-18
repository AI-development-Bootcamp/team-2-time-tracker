/**
 * @fileoverview Unit tests for timer.service.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    mockTimerPrisma,
    mockPrismaTimer,
    mockPrismaMonthLock,
    mockPrismaTaskAssignment,
    mockPrismaWorkdaySummary,
    resetTimerPrismaMocks,
    createMockTimer,
    createMockTaskAssignment,
    createMockTask,
    createMockMonthLock,
} from '../helpers/mockTimerPrisma';

// Import after mocks
import * as timerService from '../../src/modules/timer/timer.service';
import { BadRequestError, NotFoundError } from '../../src/shared/errors';

describe('timer.service', () => {
    // Store original Date
    const RealDate = Date;

    beforeEach(() => {
        resetTimerPrismaMocks();
        vi.clearAllMocks();

        // Mock Date to return consistent "today"
        const mockDate = new Date('2026-01-17T10:00:00.000Z');
        vi.setSystemTime(mockDate);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('startTimer', () => {
        it('should start a new timer successfully', async () => {
            const mockTimer = createMockTimer();
            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaTimer.findFirst.mockResolvedValue(null);
            mockPrismaTimer.create.mockResolvedValue(mockTimer);

            const result = await timerService.startTimer('test-user-id', '2026-01-17');

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('startedAt');
        });

        it('should throw BadRequestError when workDate is not today', async () => {
            await expect(
                timerService.startTimer('test-user-id', '2026-01-16')
            ).rejects.toThrow(BadRequestError);

            await expect(
                timerService.startTimer('test-user-id', '2026-01-16')
            ).rejects.toThrow('Timer can only be started for today');
        });

        it('should throw BadRequestError when month is locked', async () => {
            const mockLock = createMockMonthLock();
            mockPrismaMonthLock.findFirst.mockResolvedValue(mockLock);

            await expect(
                timerService.startTimer('test-user-id', '2026-01-17')
            ).rejects.toThrow(BadRequestError);

            await expect(
                timerService.startTimer('test-user-id', '2026-01-17')
            ).rejects.toThrow('month is locked');
        });

        it('should throw BadRequestError when timer is already running', async () => {
            const mockTimer = createMockTimer();
            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaTimer.findFirst.mockResolvedValue(mockTimer);

            await expect(
                timerService.startTimer('test-user-id', '2026-01-17')
            ).rejects.toThrow(BadRequestError);

            await expect(
                timerService.startTimer('test-user-id', '2026-01-17')
            ).rejects.toThrow('A timer is already running');
        });
    });

    describe('stopTimer', () => {
        it('should stop timer and create time entry successfully', async () => {
            const startTime = new Date('2026-01-17T09:00:00.000Z');
            const mockTimer = createMockTimer({ startedAt: startTime });
            const mockTask = createMockTask();
            const mockEntry = {
                id: 'test-entry-id',
                userId: 'test-user-id',
                workDate: new Date('2026-01-17'),
                startTime,
                endTime: new Date('2026-01-17T10:00:00.000Z'),
                durationMinutes: 60,
                taskId: 'test-task-id',
                location: 'OFFICE',
                description: 'Working on test task',
                source: 'TIMER',
                timerId: 'test-timer-id',
                task: {
                    id: mockTask.id,
                    name: mockTask.name,
                    project: {
                        id: mockTask.project.id,
                        name: mockTask.project.name,
                        client: {
                            id: mockTask.project.client.id,
                            name: mockTask.project.client.name,
                        },
                    },
                },
            };

            mockPrismaTimer.findFirst.mockResolvedValue(mockTimer);
            mockPrismaTaskAssignment.findFirst.mockResolvedValue(createMockTaskAssignment());
            mockTimerPrisma.$transaction.mockImplementation(async (callback) => {
                // Mock the transaction operations
                mockTimerPrisma.timer.update = vi.fn().mockResolvedValue({});
                mockTimerPrisma.timeEntry.create = vi.fn().mockResolvedValue(mockEntry);
                mockTimerPrisma.workdaySummary.upsert = vi.fn().mockResolvedValue({});
                return callback(mockTimerPrisma);
            });

            const result = await timerService.stopTimer(
                'test-user-id',
                'test-task-id',
                'OFFICE',
                'Working on test task'
            );

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('durationMinutes');
            expect(result).toHaveProperty('task');
        });

        it('should throw NotFoundError when no running timer exists', async () => {
            mockPrismaTimer.findFirst.mockResolvedValue(null);

            await expect(
                timerService.stopTimer('test-user-id', 'test-task-id', 'OFFICE', 'Valid description text')
            ).rejects.toThrow(NotFoundError);

            await expect(
                timerService.stopTimer('test-user-id', 'test-task-id', 'OFFICE', 'Valid description text')
            ).rejects.toThrow('No running timer found');
        });

        it('should throw BadRequestError when description is too short', async () => {
            await expect(
                timerService.stopTimer('test-user-id', 'test-task-id', 'OFFICE', 'short')
            ).rejects.toThrow(BadRequestError);

            await expect(
                timerService.stopTimer('test-user-id', 'test-task-id', 'OFFICE', 'short')
            ).rejects.toThrow('at least 10 characters');
        });

        it('should throw BadRequestError when description is too long', async () => {
            const longDescription = 'a'.repeat(501);

            await expect(
                timerService.stopTimer('test-user-id', 'test-task-id', 'OFFICE', longDescription)
            ).rejects.toThrow(BadRequestError);

            await expect(
                timerService.stopTimer('test-user-id', 'test-task-id', 'OFFICE', longDescription)
            ).rejects.toThrow('at most 500 characters');
        });

        it('should throw BadRequestError when task is not assigned to user', async () => {
            const mockTimer = createMockTimer();
            mockPrismaTimer.findFirst.mockResolvedValue(mockTimer);
            mockPrismaTaskAssignment.findFirst.mockResolvedValue(null);

            await expect(
                timerService.stopTimer('test-user-id', 'test-task-id', 'OFFICE', 'Valid description text')
            ).rejects.toThrow(BadRequestError);

            await expect(
                timerService.stopTimer('test-user-id', 'test-task-id', 'OFFICE', 'Valid description text')
            ).rejects.toThrow('Task is not assigned to you');
        });
    });

    describe('getTimerStatus', () => {
        it('should return running timer status', async () => {
            const startTime = new Date('2026-01-17T09:00:00.000Z');
            const mockTimer = createMockTimer({ startedAt: startTime });
            mockPrismaTimer.findFirst.mockResolvedValue(mockTimer);

            const result = await timerService.getTimerStatus('test-user-id');

            expect(result.isRunning).toBe(true);
            expect(result.elapsedMinutes).toBe(60); // 10:00 - 09:00 = 60 minutes
            expect(result.timer).not.toBeNull();
        });

        it('should return not running status when no timer exists', async () => {
            mockPrismaTimer.findFirst.mockResolvedValue(null);

            const result = await timerService.getTimerStatus('test-user-id');

            expect(result.isRunning).toBe(false);
            expect(result.elapsedMinutes).toBeNull();
            expect(result.timer).toBeNull();
        });
    });

    describe('cancelTimer', () => {
        it('should cancel running timer successfully', async () => {
            const mockTimer = createMockTimer();
            mockPrismaTimer.findFirst.mockResolvedValue(mockTimer);
            mockPrismaTimer.delete.mockResolvedValue(mockTimer);

            await expect(timerService.cancelTimer('test-user-id')).resolves.not.toThrow();
        });

        it('should throw NotFoundError when no running timer exists', async () => {
            mockPrismaTimer.findFirst.mockResolvedValue(null);

            await expect(
                timerService.cancelTimer('test-user-id')
            ).rejects.toThrow(NotFoundError);

            await expect(
                timerService.cancelTimer('test-user-id')
            ).rejects.toThrow('No running timer found');
        });
    });
});
