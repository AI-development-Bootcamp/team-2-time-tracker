/**
 * @fileoverview Mock Prisma client for testing
 */

import { vi } from 'vitest';

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

export const mockPrisma = {
    user: mockPrismaUser,
    refreshToken: mockPrismaRefreshToken,
    $transaction: vi.fn((callback) => callback(mockPrisma)),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
};

/**
 * Reset all Prisma mocks
 */
export function resetPrismaMocks() {
    Object.values(mockPrismaUser).forEach((mock) => mock.mockReset());
    Object.values(mockPrismaRefreshToken).forEach((mock) => mock.mockReset());
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
