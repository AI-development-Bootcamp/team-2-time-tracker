/**
 * @fileoverview Mock Prisma client for testing
 *
 * This file provides:
 * 1. Shared type definitions for mock delegates (can be imported by test files using vi.hoisted)
 * 2. Pre-created mock instances for tests that don't need vi.hoisted
 * 3. Helper functions for creating mock data
 *
 * For tests that use vi.hoisted() (e.g., endpoint tests that need mocks before route imports),
 * import the types and recreate the mocks inline since vi.hoisted runs before imports resolve.
 */

import { vi, type Mock } from 'vitest';

// =============================================================================
// Shared Type Definitions
// These can be imported in test files that use vi.hoisted() to ensure type safety
// =============================================================================

export type MockUserDelegate = {
    findUnique: Mock;
    findMany: Mock;
    create: Mock;
    update: Mock;
    updateMany: Mock;
    delete: Mock;
    count: Mock;
};

export type MockRefreshTokenDelegate = {
    create: Mock;
    findFirst: Mock;
    findUnique: Mock;
    updateMany: Mock;
    delete: Mock;
};

export type MockTimeEntryDelegate = {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
};

export type MockPrismaClient = {
    user: MockUserDelegate;
    refreshToken: MockRefreshTokenDelegate;
    timeEntry: MockTimeEntryDelegate;
    $connect: Mock;
    $disconnect: Mock;
    $transaction: Mock<(callback: (prisma: MockPrismaClient) => unknown) => unknown>;
};

export type MockBcrypt = {
    compare: Mock;
    hash: Mock;
};

// =============================================================================
// Pre-created Mock Instances
// For tests that don't need vi.hoisted (e.g., service tests)
// =============================================================================

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
