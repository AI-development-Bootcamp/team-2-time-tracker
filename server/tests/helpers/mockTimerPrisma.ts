/**
 * @fileoverview Mock Prisma client for timer tests
 */

import { vi } from 'vitest';

export const mockPrismaTimer = {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

export const mockPrismaTimeEntry = {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrismaMonthLock = {
    findFirst: vi.fn(),
};

export const mockPrismaTaskAssignment = {
    findFirst: vi.fn(),
};

export const mockPrismaTask = {
    findUnique: vi.fn(),
};

export const mockPrismaWorkdaySummary = {
    upsert: vi.fn(),
    update: vi.fn(),
};

export const mockTimerPrisma = {
    timer: mockPrismaTimer,
    timeEntry: mockPrismaTimeEntry,
    monthLock: mockPrismaMonthLock,
    taskAssignment: mockPrismaTaskAssignment,
    task: mockPrismaTask,
    workdaySummary: mockPrismaWorkdaySummary,
    $transaction: vi.fn((callback) => callback(mockTimerPrisma)),
};

// Mock the prisma module
vi.mock('../../src/db', () => ({
    prisma: mockTimerPrisma,
}));

/**
 * Reset all Prisma mocks
 */
export function resetTimerPrismaMocks() {
    Object.values(mockPrismaTimer).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTimeEntry).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaMonthLock).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTaskAssignment).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTask).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaWorkdaySummary).forEach((mock) => mock.mockReset());
    mockTimerPrisma.$transaction.mockReset();
    mockTimerPrisma.$transaction.mockImplementation((callback) => callback(mockTimerPrisma));
}

/**
 * Create a mock timer object
 */
export function createMockTimer(overrides = {}) {
    const now = new Date();
    return {
        id: 'test-timer-id',
        userId: 'test-user-id',
        workDate: new Date(now.toISOString().split('T')[0]),
        startedAt: now,
        stoppedAt: null,
        durationMinutes: null,
        isRunning: true,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}

/**
 * Create a mock task assignment
 */
export function createMockTaskAssignment(overrides = {}) {
    return {
        id: 'test-assignment-id',
        userId: 'test-user-id',
        taskId: 'test-task-id',
        assignedByAdminId: 'admin-id',
        createdAt: new Date(),
        ...overrides,
    };
}

/**
 * Create a mock task with project and client
 */
export function createMockTask(overrides = {}) {
    return {
        id: 'test-task-id',
        name: 'Test Task',
        projectId: 'test-project-id',
        status: 'OPEN',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
            id: 'test-project-id',
            name: 'Test Project',
            clientId: 'test-client-id',
            reportType: 'TOTAL_HOURS',
            client: {
                id: 'test-client-id',
                name: 'Test Client',
            },
        },
        ...overrides,
    };
}

/**
 * Create a mock time entry
 */
export function createMockTimeEntry(overrides = {}) {
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(now);
    endTime.setHours(10, 30, 0, 0);

    return {
        id: 'test-entry-id',
        userId: 'test-user-id',
        workDate: new Date(now.toISOString().split('T')[0]),
        startTime,
        endTime,
        durationMinutes: 90,
        taskId: 'test-task-id',
        location: 'OFFICE',
        description: 'Working on test task implementation',
        source: 'MANUAL',
        timerId: null,
        isDeleted: false,
        deletedAt: null,
        deletedByUserId: null,
        createdAt: now,
        updatedAt: now,
        task: createMockTask().project ? {
            ...createMockTask(),
        } : createMockTask(),
        ...overrides,
    };
}

/**
 * Create a mock month lock
 */
export function createMockMonthLock(overrides = {}) {
    return {
        id: 'test-lock-id',
        month: new Date('2026-01-01'),
        lockedAt: new Date(),
        lockedByAdminId: 'admin-id',
        unlockedAt: null,
        unlockedByAdminId: null,
        ...overrides,
    };
}

/**
 * Create a mock workday summary
 */
export function createMockWorkdaySummary(overrides = {}) {
    return {
        id: 'test-summary-id',
        userId: 'test-user-id',
        workDate: new Date(),
        targetMinutes: 540,
        workMinutes: 0,
        absenceMinutes: 0,
        isLocked: false,
        lockedMonthId: null,
        isSubmitted: false,
        submittedAt: null,
        requiresExactTotal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}
