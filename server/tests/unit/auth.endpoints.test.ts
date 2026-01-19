/**
 * @fileoverview Unit tests for auth endpoints with mocks
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';

// Use vi.hoisted to define all mocks that vi.mock needs to reference
const { mockBcrypt, mockPrismaUser, mockPrismaRefreshToken, mockPrisma } = vi.hoisted(() => {
    const mockBcrypt = {
        compare: vi.fn(),
        hash: vi.fn(),
    };

    const mockPrismaUser = {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    };

    const mockPrismaRefreshToken = {
        create: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
    };

    const mockPrismaTimeEntry = {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };

    const mockPrisma: Record<string, unknown> = {
        user: mockPrismaUser,
        refreshToken: mockPrismaRefreshToken,
        timeEntry: mockPrismaTimeEntry,
        $connect: vi.fn(),
        $disconnect: vi.fn(),
    };
    mockPrisma.$transaction = vi.fn((callback: (prisma: typeof mockPrisma) => unknown) => callback(mockPrisma));

    return { mockBcrypt, mockPrismaUser, mockPrismaRefreshToken, mockPrisma };
});

// Mock bcrypt
vi.mock('bcrypt', () => ({
    default: mockBcrypt,
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'mock-jwt-token'),
        verify: vi.fn(() => ({
            userId: 'test-user-id',
            email: 'test@example.com',
            role: 'EMPLOYEE',
        })),
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

// Mock the database module
vi.mock('../../src/db', () => ({
    prisma: mockPrisma,
}));

// Import after mocks are set up
import { router } from '../../src/routes';
import { errorMiddleware } from '../../src/middlewares/error.middleware';

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', router);
    app.use(errorMiddleware);
});

describe('Auth Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/auth/login', () => {
        it('should return 200 and tokens on successful login', async () => {
            const mockUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                password: '$2b$12$hashedpassword',
                firstName: 'Test',
                lastName: 'User',
                role: 'EMPLOYEE',
                isActive: true,
                mustChangePassword: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);
            mockBcrypt.compare.mockResolvedValue(true);
            mockPrismaRefreshToken.create.mockResolvedValue({
                id: 'test-token-id',
                token: 'test-refresh-token',
                userId: 'test-user-id',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                revokedAt: null,
                createdAt: new Date(),
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data).toHaveProperty('user');
        });

        it('should return 401 for invalid credentials', async () => {
            mockPrismaUser.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'wrong@example.com', password: 'password123' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ password: 'password123' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'not-an-email', password: 'password123' });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('should return new access token', async () => {
            const mockUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'EMPLOYEE',
                isActive: true,
            };
            const mockToken = {
                id: 'test-token-id',
                token: 'test-refresh-token',
                userId: 'test-user-id',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                revokedAt: null,
                createdAt: new Date(),
                user: mockUser,
            };
            mockPrismaRefreshToken.findFirst.mockResolvedValue(mockToken);

            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'valid-refresh-token' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
        });

        it('should return 401 for invalid refresh token', async () => {
            mockPrismaRefreshToken.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token' });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user for authenticated request', async () => {
            const mockUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'EMPLOYEE',
                isActive: true,
                mustChangePassword: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);

            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('email');
        });

        it('should return 401 for missing token', async () => {
            const response = await request(app).get('/api/auth/me');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const mockUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'EMPLOYEE',
                isActive: true,
                mustChangePassword: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);
            mockPrismaRefreshToken.updateMany.mockResolvedValue({ count: 1 });

            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', 'Bearer valid-token')
                .send({ refreshToken: 'refresh-token' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const response = await request(app).get('/api/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('version');
        });
    });
});
