/**
 * @fileoverview Unit tests setup with mocks
 */

// Set up test environment variables before any imports that might use them
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
process.env.NODE_ENV = 'test';

import { vi, beforeEach } from 'vitest';

// Create mock objects that can be imported
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

export const mockPrismaTimeEntry = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

export const mockPrisma = {
    user: mockPrismaUser,
    refreshToken: mockPrismaRefreshToken,
    timeEntry: mockPrismaTimeEntry,
    $transaction: vi.fn((callback: (prisma: typeof mockPrisma) => unknown) => callback(mockPrisma)),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
};

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mockPrismaUser).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaRefreshToken).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaTimeEntry).forEach((mock) => mock.mockReset());
});
