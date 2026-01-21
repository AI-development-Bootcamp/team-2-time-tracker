/**
 * @fileoverview Mock Prisma client for testing
 */

import { vi } from 'vitest';
import { EntityStatus, ReportType } from '@shared/types';

export enum TaskStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
}

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

export const mockPrismaAbsenceRequest = {
    create: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrismaAbsenceDay = {
    createMany: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
};

export const mockPrismaAbsenceDocument = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
};

export const mockPrismaMonthLock = {
    findFirst: vi.fn(),
};

export const mockPrismaWorkdaySummary = {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
};

export const mockPrismaClient = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrismaProject = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrismaTask = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
};

export const mockPrisma = {
    user: mockPrismaUser,
    refreshToken: mockPrismaRefreshToken,
    absenceRequest: mockPrismaAbsenceRequest,
    absenceDay: mockPrismaAbsenceDay,
    absenceDocument: mockPrismaAbsenceDocument,
    monthLock: mockPrismaMonthLock,
    workdaySummary: mockPrismaWorkdaySummary,
    client: mockPrismaClient,
    project: mockPrismaProject,
    task: mockPrismaTask,
    $transaction: vi.fn((callback) => callback(mockPrisma)),
};

// Mock the prisma module
vi.mock('../../src/db', () => ({
    prisma: mockPrisma,
}));

/**
 * Reset all Prisma mocks
 */
export function resetPrismaMocks() {
    Object.values(mockPrismaUser).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaRefreshToken).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaAbsenceRequest).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaAbsenceDay).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaAbsenceDocument).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaMonthLock).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaWorkdaySummary).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaClient).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaProject).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTask).forEach((mock) => mock.mockReset());
    mockPrisma.$transaction.mockReset();
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
 * Create a mock absence request object
 */
export function createMockAbsenceRequest(overrides = {}) {
    const startDate = new Date('2026-01-15');
    const endDate = new Date('2026-01-15');
    
    return {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'test-user-id',
        type: 'VACATION',
        startDate,
        endDate,
        isHalfDay: false,
        status: 'SUBMITTED',
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        absenceDays: [],
        documents: [],
        ...overrides,
    };
}

/**
 * Create a mock absence day object
 */
export function createMockAbsenceDay(overrides = {}) {
    return {
        id: '223e4567-e89b-12d3-a456-426614174000',
        absenceRequestId: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'test-user-id',
        workDate: new Date('2026-01-15'),
        minutes: 540,
        ...overrides,
    };
}

/**
 * Create a mock absence document object
 */
export function createMockAbsenceDocument(overrides = {}) {
    return {
        id: '323e4567-e89b-12d3-a456-426614174000',
        absenceRequestId: '123e4567-e89b-12d3-a456-426614174000',
        fileUrl: 'https://storage.example.com/absences/test-user-id/123e4567-e89b-12d3-a456-426614174000/file.pdf',
        fileName: 'document.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024,
        uploadedByUserId: 'test-user-id',
        uploadedAt: new Date(),
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
        ...overrides,
    };
}

/**
 * Create a mock project object
 */
export function createMockProject(overrides = {}) {
    return {
        id: 'test-project-id',
        clientId: 'test-client-id',
        name: 'Test Project',
        status: EntityStatus.ACTIVE,
        reportType: ReportType.TOTAL_HOURS,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

/**
 * Create a mock task object
 */
export function createMockTask(overrides = {}) {
    return {
        id: 'test-task-id',
        projectId: 'test-project-id',
        name: 'Test Task',
        status: TaskStatus.OPEN,
        startDate: new Date('2026-01-01'),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}
