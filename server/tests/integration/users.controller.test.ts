/**
 * @fileoverview Integration tests for Users Controller (Happy Paths)
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import {
    mockTimeReportsPrisma,
    mockPrismaUser,
    resetTimeReportsPrismaMocks
} from '../helpers/mockTimeReportsPrisma';

const MOCK_IDS = {
    ADMIN: '550e8400-e29b-41d4-a716-446655440099',
    USER: '550e8400-e29b-41d4-a716-446655440000',
};

// Mock admin user for auth
const mockAdminUser = {
    id: MOCK_IDS.ADMIN,
    email: 'admin@example.com',
    role: 'ADMIN',
    isActive: true,
};

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'mock-jwt-token'),
        verify: vi.fn(() => ({
            userId: MOCK_IDS.ADMIN,
            email: 'admin@example.com',
            role: 'ADMIN',
        })),
    },
}));

// Mock jwt config
vi.mock('../../src/config/jwt', () => ({
    jwtConfig: {
        secret: 'test-secret',
        expiresIn: '2h',
        expiresInSeconds: 7200,
    },
}));

import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { router } from '../../src/routes';
import * as authRepo from '../../src/modules/auth/auth.repo';

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', router);
    app.use(errorMiddleware);
});

describe('Users Controller - Happy Paths', () => {
    beforeEach(() => {
        resetTimeReportsPrismaMocks();
        vi.clearAllMocks();

        // Setup auth mock - needs to be available for verifyUser in auth middleware
        mockPrismaUser.findUnique.mockResolvedValue(mockAdminUser);
        vi.mocked(authRepo.findUserById).mockResolvedValue(mockAdminUser as any);
    });

    describe('GET /api/users', () => {
        it('should return paginated users list', async () => {
            mockPrismaUser.findMany.mockResolvedValue([{
                id: MOCK_IDS.USER,
                email: 'user@example.com',
                fullName: 'Test User',
                role: 'EMPLOYEE',
                isActive: true
            }]);
            mockPrismaUser.count.mockResolvedValue(1);

            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.data.users).toHaveLength(1);
            expect(response.body.data.pagination.total).toBe(1);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return a user details', async () => {
            // Mock findUnique for the specific user request
            // IMPORTANT: Auth check is handled by authRepo mock, so this mock is ONLY for controller logic
            mockPrismaUser.findUnique
                .mockResolvedValueOnce({
                    id: MOCK_IDS.USER,
                    email: 'user@example.com',
                    fullName: 'Test User',
                    role: 'EMPLOYEE',
                    isActive: true
                });

            const response = await request(app)
                .get(`/api/admin/users/${MOCK_IDS.USER}`)
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe(MOCK_IDS.USER);
        });
    });

    describe('POST /api/users', () => {
        it('should create a new user', async () => {
            // Email unique check (null = unique)
            mockPrismaUser.findUnique
                .mockResolvedValueOnce(null);

            mockPrismaUser.create.mockResolvedValue({
                id: MOCK_IDS.USER,
                email: 'new@example.com',
                fullName: 'New User',
                role: 'EMPLOYEE',
                isActive: true,
                mustChangePassword: true
            });

            const response = await request(app)
                .post('/api/admin/users')
                .set('Authorization', 'Bearer token')
                .send({
                    email: 'new@example.com',
                    password: 'StrongPass123!',
                    fullName: 'New User',
                    role: 'EMPLOYEE'
                });

            expect(response.status).toBe(201);
            expect(response.body.data.email).toBe('new@example.com');
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update user details', async () => {
            mockPrismaUser.findUnique
                .mockResolvedValueOnce({ id: MOCK_IDS.USER, email: 'user@example.com' }); // Existence check

            mockPrismaUser.update.mockResolvedValue({
                id: MOCK_IDS.USER,
                email: 'user@example.com',
                fullName: 'Updated Name',
                role: 'EMPLOYEE'
            });

            const response = await request(app)
                .put(`/api/admin/users/${MOCK_IDS.USER}`)
                .set('Authorization', 'Bearer token')
                .send({ fullName: 'Updated Name' });

            expect(response.status).toBe(200);
            expect(response.body.data.fullName).toBe('Updated Name');
        });
    });

    describe('PUT /api/users/:id/status', () => {
        it('should update user status', async () => {
            mockPrismaUser.findUnique
                .mockResolvedValueOnce({ id: MOCK_IDS.USER }); // Existence check

            mockPrismaUser.update.mockResolvedValue({
                id: MOCK_IDS.USER,
                isActive: false
            });

            const response = await request(app)
                .put(`/api/admin/users/${MOCK_IDS.USER}/status`)
                .set('Authorization', 'Bearer token')
                .send({ isActive: false });

            expect(response.status).toBe(200);
            expect(response.body.data.isActive).toBe(false);
        });
    });

    describe('POST /api/users/:id/reset-password', () => {
        it('should reset user password', async () => {
            mockPrismaUser.findUnique
                .mockResolvedValueOnce({ id: MOCK_IDS.USER }); // Existence check 

            mockPrismaUser.update.mockResolvedValue({
                id: MOCK_IDS.USER
            });

            const response = await request(app)
                .post(`/api/admin/users/${MOCK_IDS.USER}/reset-password`)
                .set('Authorization', 'Bearer token')
                .send({ newPassword: 'StrongPass123!' });

            expect(response.status).toBe(200);
        });
    });
});
