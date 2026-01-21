/**
 * @fileoverview Mock Prisma client for selectors testing
 */

import { vi } from 'vitest';

export const mockPrismaClient = {
    findMany: vi.fn(),
};

export const mockPrismaProject = {
    findMany: vi.fn(),
};

export const mockPrismaTask = {
    findMany: vi.fn(),
};

export const mockPrismaTaskAssignment = {
    findMany: vi.fn(),
};

export const mockPrismaWorkdaySummary = {
    findMany: vi.fn(),
};

export const mockPrismaTimeEntry = {
    count: vi.fn(),
};

export const mockPrismaUser = {
    findUnique: vi.fn(),
};

export const mockSelectorsPrisma = {
    client: mockPrismaClient,
    project: mockPrismaProject,
    task: mockPrismaTask,
    taskAssignment: mockPrismaTaskAssignment,
    workdaySummary: mockPrismaWorkdaySummary,
    timeEntry: mockPrismaTimeEntry,
    user: mockPrismaUser,
};

// Mock the prisma module
vi.mock('../../src/db', () => ({
    prisma: mockSelectorsPrisma,
}));

// Mock auth repo
vi.mock('../../src/modules/auth/auth.repo', () => ({
    findUserById: vi.fn(),
}));


/**
 * Reset all Prisma mocks
 */
export function resetSelectorsPrismaMocks() {
    Object.values(mockPrismaClient).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaProject).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTask).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTaskAssignment).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaWorkdaySummary).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTimeEntry).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaUser).forEach((mock) => mock.mockReset());
}

// Helpers to create mock data
export function createMockClient(overrides = {}) {
    return { id: 'client-1', name: 'Test Client', ...overrides };
}

export function createMockProject(overrides = {}) {
    return { id: 'project-1', name: 'Test Project', clientId: 'client-1', ...overrides };
}

export function createMockTask(overrides = {}) {
    return {
        id: 'task-1',
        name: 'Test Task',
        projectId: 'project-1',
        project: { reportType: 'HOURLY' },
        ...overrides
    };
}
