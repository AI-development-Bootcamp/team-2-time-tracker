/**
 * @fileoverview Mock Prisma client for time reports testing
 */

import { vi } from 'vitest';

export const mockPrismaClient = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
};

export const mockPrismaProject = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
};

export const mockPrismaTask = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
};

export const mockPrismaTaskAssignment = {
    findFirst: vi.fn(),
    findMany: vi.fn(),
};

export const mockPrismaWorkdaySummary = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
};

export const mockPrismaTimeEntry = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrismaMonthLock = {
    findFirst: vi.fn(),
};

export const mockPrismaTimer = {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

export const mockPrismaUser = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
};

export const mockTimeReportsPrisma = {
    client: mockPrismaClient,
    project: mockPrismaProject,
    task: mockPrismaTask,
    taskAssignment: mockPrismaTaskAssignment,
    workdaySummary: mockPrismaWorkdaySummary,
    timeEntry: mockPrismaTimeEntry,
    monthLock: mockPrismaMonthLock,
    timer: mockPrismaTimer,
    user: mockPrismaUser,
    $transaction: vi.fn((callback) => callback(mockTimeReportsPrisma)),
};

// Mock the prisma module
vi.mock('../../src/db', () => ({
    prisma: mockTimeReportsPrisma,
}));

// Mock auth repo
vi.mock('../../src/modules/auth/auth.repo', () => ({
    findUserById: vi.fn(),
}));

/**
 * Reset all Prisma mocks
 */
export function resetTimeReportsPrismaMocks() {
    Object.values(mockPrismaClient).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaProject).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTask).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTaskAssignment).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaWorkdaySummary).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTimeEntry).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaMonthLock).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTimer).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaUser).forEach((mock) => mock.mockReset());
}
