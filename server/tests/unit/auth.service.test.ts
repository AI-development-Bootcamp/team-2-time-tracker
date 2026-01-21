/**
 * @fileoverview Unit tests for auth.service.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
    mockPrisma,
    mockPrismaUser,
    mockPrismaRefreshToken,
    resetPrismaMocks,
    createMockUser,
    createMockRefreshToken,
} from '../helpers/mockPrisma';

// Mock bcrypt
vi.mock('bcrypt', () => ({
    default: {
        compare: vi.fn(),
        hash: vi.fn(),
    },
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'mock-jwt-token'),
        verify: vi.fn(),
    },
}));

// Mock crypto
vi.mock('crypto', () => ({
    randomBytes: vi.fn(() => ({
        toString: () => 'mock-refresh-token',
    })),
}));

// Mock jwt config
vi.mock('../../src/config/jwt', () => ({
    jwtConfig: {
        secret: 'test-secret',
        expiresIn: '2h',
        expiresInSeconds: 7200,
    },
}));

// Import after mocks
import * as authService from '../../src/modules/auth/auth.service';
import { UnauthorizedError, BadRequestError } from '../../src/shared/errors';

const TEST_PASSWORD = process.env.DEFAULT_SEED_PASSWORD || "1";

describe('auth.service', () => {
    beforeEach(() => {
        resetPrismaMocks();
        vi.clearAllMocks();
    });

    describe('login', () => {
        it('should return tokens and user info on successful login', async () => {
            const mockUser = createMockUser();
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as any).mockResolvedValue(true);
            mockPrismaRefreshToken.create.mockResolvedValue(createMockRefreshToken());

            const result = await authService.login('test@example.com', TEST_PASSWORD);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe(mockUser.email);
            expect(result.user.fullName).toBe(mockUser.fullName);
        });

        it('should throw UnauthorizedError for non-existent user', async () => {
            mockPrismaUser.findUnique.mockResolvedValue(null);

            await expect(
                authService.login('nonexistent@example.com', TEST_PASSWORD)
            ).rejects.toThrow(UnauthorizedError);
        });

        it('should throw UnauthorizedError for inactive user', async () => {
            const mockUser = createMockUser({ isActive: false });
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);

            await expect(
                authService.login('test@example.com', TEST_PASSWORD)
            ).rejects.toThrow(UnauthorizedError);
        });

        it('should throw UnauthorizedError for invalid password', async () => {
            const mockUser = createMockUser();
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as any).mockResolvedValue(false);

            await expect(
                authService.login('test@example.com', 'wrongpassword')
            ).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('refreshAccessToken', () => {
        it('should return new access token for valid refresh token', async () => {
            const mockUser = createMockUser();
            const mockToken = createMockRefreshToken({ user: mockUser });
            mockPrismaRefreshToken.findFirst.mockResolvedValue(mockToken);

            const result = await authService.refreshAccessToken('valid-refresh-token');

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('expiresIn');
        });

        it('should throw UnauthorizedError for invalid refresh token', async () => {
            mockPrismaRefreshToken.findFirst.mockResolvedValue(null);

            await expect(
                authService.refreshAccessToken('invalid-token')
            ).rejects.toThrow(UnauthorizedError);
        });

        it('should throw UnauthorizedError for inactive user', async () => {
            const mockUser = createMockUser({ isActive: false });
            const mockToken = createMockRefreshToken({ user: mockUser });
            mockPrismaRefreshToken.findFirst.mockResolvedValue(mockToken);

            await expect(
                authService.refreshAccessToken('valid-refresh-token')
            ).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const mockUser = createMockUser();
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as any).mockResolvedValue(true);
            (bcrypt.hash as any).mockResolvedValue('new-hashed-password');
            mockPrismaUser.update.mockResolvedValue(mockUser);
            mockPrismaRefreshToken.updateMany.mockResolvedValue({ count: 1 });

            await expect(
                authService.changePassword('test-user-id', 'current', 'newpassword')
            ).resolves.not.toThrow();

            expect(mockPrismaUser.update).toHaveBeenCalled();
            expect(mockPrismaRefreshToken.updateMany).toHaveBeenCalled();
        });

        it('should throw BadRequestError for incorrect current password', async () => {
            const mockUser = createMockUser();
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as any).mockResolvedValue(false);

            await expect(
                authService.changePassword('test-user-id', 'wrongcurrent', 'newpassword')
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw UnauthorizedError for non-existent user', async () => {
            mockPrismaUser.findUnique.mockResolvedValue(null);

            await expect(
                authService.changePassword('non-existent-id', 'current', 'newpassword')
            ).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('logout', () => {
        it('should revoke refresh token', async () => {
            mockPrismaRefreshToken.updateMany.mockResolvedValue({ count: 1 });

            await expect(authService.logout('refresh-token')).resolves.not.toThrow();
            expect(mockPrismaRefreshToken.updateMany).toHaveBeenCalled();
        });
    });

    describe('getCurrentUser', () => {
        it('should return user profile', async () => {
            const mockUser = createMockUser();
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);

            const result = await authService.getCurrentUser('test-user-id');

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('fullName');
            expect(result).toHaveProperty('role');
        });

        it('should throw UnauthorizedError for non-existent user', async () => {
            mockPrismaUser.findUnique.mockResolvedValue(null);

            await expect(
                authService.getCurrentUser('non-existent-id')
            ).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('verifyAccessToken', () => {
        it('should return payload for valid token', () => {
            const payload = { userId: 'test', email: 'test@example.com', role: 'EMPLOYEE' };
            (jwt.verify as any).mockReturnValue(payload);

            const result = authService.verifyAccessToken('valid-token');

            expect(result).toEqual(payload);
        });

        it('should throw UnauthorizedError for invalid token', () => {
            (jwt.verify as any).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            expect(() => authService.verifyAccessToken('invalid-token')).toThrow(
                UnauthorizedError
            );
        });
    });

    describe('hashPassword', () => {
        it('should return hashed password', async () => {
            (bcrypt.hash as any).mockResolvedValue('hashed-password');

            const result = await authService.hashPassword(TEST_PASSWORD);

            expect(result).toBe('hashed-password');
            expect(bcrypt.hash).toHaveBeenCalledWith(TEST_PASSWORD, 12);
        });
    });
});
