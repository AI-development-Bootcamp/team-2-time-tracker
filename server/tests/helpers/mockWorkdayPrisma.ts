/**
 * @fileoverview Mock Prisma client for workday service testing
 */

import { vi } from 'vitest';

export const mockPrismaWorkdaySummary = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
};

export const mockPrismaTimeEntry = {
    findMany: vi.fn(),
    create: vi.fn(),
};

export const mockPrismaMonthLock = {
    findFirst: vi.fn(),
};

export const mockPrismaTimer = {
    findFirst: vi.fn(),
};

export const mockWorkdayPrisma = {
    workdaySummary: mockPrismaWorkdaySummary,
    timeEntry: mockPrismaTimeEntry,
    monthLock: mockPrismaMonthLock,
    timer: mockPrismaTimer,
    $queryRaw: vi.fn(),
    $transaction: vi.fn((callback) => callback(mockWorkdayPrisma)),
};

// Mock the prisma module
vi.mock('../../src/db', () => ({
    prisma: mockWorkdayPrisma,
}));

// Mock the timeReports.repo module
vi.mock('../../src/modules/time-reports/timeReports.repo', () => ({
    findMonthLock: vi.fn(),
    findRunningTimer: vi.fn(),
}));

/**
 * Reset all Prisma mocks
 */
export function resetWorkdayPrismaMocks() {
    Object.values(mockPrismaWorkdaySummary).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTimeEntry).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaMonthLock).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTimer).forEach((mock) => mock.mockReset());
    mockWorkdayPrisma.$queryRaw.mockReset();
}

/**
 * Create a mock workday summary object
 */
export function createMockWorkdaySummary(overrides = {}) {
    return {
        id: 'test-summary-id',
        userId: 'test-user-id',
        workDate: new Date('2026-01-17'),
        targetMinutes: 540,
        workMinutes: 480,
        absenceMinutes: 0,
        status: 'MISSING',
        isSubmitted: false,
        submittedAt: null,
        isLocked: false,
        lockedMonthId: null,
        requiresExactTotal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

/**
 * Create a mock time entry object
 */
export function createMockTimeEntry(overrides = {}) {
    return {
        id: 'test-entry-id',
        userId: 'test-user-id',
        workDate: new Date('2026-01-17'),
        startTime: new Date('2026-01-17T09:00:00.000Z'),
        endTime: new Date('2026-01-17T17:00:00.000Z'),
        durationMinutes: 480,
        taskId: 'test-task-id',
        location: 'OFFICE',
        description: 'Working on task',
        source: 'MANUAL',
        isDeleted: false,
        deletedAt: null,
        task: {
            id: 'test-task-id',
            name: 'Test Task',
            project: {
                id: 'test-project-id',
                name: 'Test Project',
                client: {
                    id: 'test-client-id',
                    name: 'Test Client',
                },
            },
        },
        ...overrides,
    };
}

/**
 * Create a mock month lock object
 */
export function createMockMonthLock(overrides = {}) {
    return {
        id: 'test-lock-id',
        month: new Date('2026-01-01'),
        lockedAt: new Date(),
        lockedByAdminId: 'admin-user-id',
        unlockedAt: null,
        unlockedByAdminId: null,
        ...overrides,
    };
}

