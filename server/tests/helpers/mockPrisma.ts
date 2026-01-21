/**
 * @fileoverview Mock Prisma client for testing
 */

import { vi } from 'vitest';
import { EntityStatus, ReportType, TaskStatus } from '@shared/types';

// Mock @prisma/client before anything else
vi.mock('@prisma/client', () => ({
    PrismaClient: vi.fn(() => ({
        user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), count: vi.fn() },
        refreshToken: { create: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), delete: vi.fn() },
        client: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
        project: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
        task: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
        timeEntry: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
        taskAssignment: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), createMany: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
        $connect: vi.fn(),
        $disconnect: vi.fn(),
        $transaction: vi.fn((callback) => callback({})),
    })),
    EntityStatus: {
        ACTIVE: 'ACTIVE',
        INACTIVE: 'INACTIVE',
    },
    TaskStatus: {
        OPEN: 'OPEN',
        CLOSED: 'CLOSED',
    },
    ReportType: {
        TOTAL_HOURS: 'TOTAL_HOURS',
        ENTRY_EXIT: 'ENTRY_EXIT',
    },
}));

// Mock pg Pool
vi.mock('pg', () => ({
    Pool: vi.fn(() => ({
        connect: vi.fn(),
        end: vi.fn(),
        query: vi.fn(),
    })),
}));

// Mock @prisma/adapter-pg
vi.mock('@prisma/adapter-pg', () => ({
    PrismaPg: vi.fn(),
}));

export const mockPrismaUser = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrismaRefreshToken = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
};

export const mockPrismaClient = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrismaProject = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrismaTask = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrismaTimeEntry = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrismaTaskAssignment = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};


export const mockPrisma = {
    user: mockPrismaUser,
    refreshToken: mockPrismaRefreshToken,
    client: mockPrismaClient,
    project: mockPrismaProject,
    task: mockPrismaTask,
    timeEntry: mockPrismaTimeEntry,
    taskAssignment: mockPrismaTaskAssignment,
    $transaction: vi.fn((callback) => callback(mockPrisma)),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
};

// Mock the prisma module
vi.mock('../../src/db', () => ({
    prisma: {
        user: mockPrismaUser,
        refreshToken: mockPrismaRefreshToken,
        client: mockPrismaClient,
        project: mockPrismaProject,
        task: mockPrismaTask,
        timeEntry: mockPrismaTimeEntry,
        taskAssignment: mockPrismaTaskAssignment,
        $transaction: vi.fn((callback) => callback(mockPrisma)),
        $connect: vi.fn(),
        $disconnect: vi.fn(),
    },
}));

/**
 * Reset all Prisma mocks
 */
export function resetPrismaMocks() {
    Object.values(mockPrismaUser).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaRefreshToken).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaClient).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaProject).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTask).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTimeEntry).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTaskAssignment).forEach((mock) => mock.mockReset());
}

/**
 * Create a mock user object
 */
export function createMockUser(overrides = {}) {
    return {
        id: 'test-user-id',
        email: 'test@example.com',
        password: '$2b$12$hashedpassword',
        fullName: 'Test User',
        role: 'EMPLOYEE',
        isActive: true,
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

/**
 * Create a mock refresh token object
 */
export function createMockRefreshToken(overrides = {}) {
    return {
        id: 'test-token-id',
        token: 'test-refresh-token',
        userId: 'test-user-id',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        createdAt: new Date(),
        ...overrides,
    };
}

/**
 * Create a mock client object
 */
export function createMockClient(overrides = {}) {
    return {
        id: 'test-client-id',
        name: 'Test Client',
        description: 'Test client description',
        status: EntityStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
            projects: 0,
        },
        ...overrides,
    };
}

/**
 * Create a mock project object
 */
export function createMockProject(overrides = {}) {
    return {
        id: 'test-project-id',
        name: 'Test Project',
        clientId: 'test-client-id',
        status: EntityStatus.ACTIVE,
        reportType: ReportType.TOTAL_HOURS,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        client: {
            id: 'test-client-id',
            name: 'Test Client',
        },
        assignedUsers: [],
        _count: {
            tasks: 0,
        },
        ...overrides,
    };
}

/**
 * Create a mock task object
 */
export function createMockTask(overrides = {}) {
    return {
        id: 'test-task-id',
        name: 'Test Task',
        projectId: 'test-project-id',
        status: TaskStatus.OPEN,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
            id: 'test-project-id',
            name: 'Test Project',
            clientId: 'test-client-id',
            startDate: null,
            endDate: null,
            client: {
                id: 'test-client-id',
                name: 'Test Client',
            },
        },
        _count: {
            assignments: 0,
            timeEntries: 0,
        },
        ...overrides,
    };
}

/**
 * Create a mock task assignment object
 */
export function createMockTaskAssignment(overrides = {}) {
    return {
        id: 'test-assignment-id',
        userId: 'test-user-id',
        taskId: 'test-task-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: createMockUser(),
        task: createMockTask(),
        ...overrides,
    };
}
