/**
 * @fileoverview Integration tests for time-entries endpoints
 * Tests focus on API validation and authentication.
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';

// Mock user for auth
const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'EMPLOYEE',
    isActive: true,
};

// Mock prisma before importing routes
vi.mock('../../src/db', () => ({
    prisma: {
        timer: {
            findFirst: vi.fn(),
        },
        timeEntry: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
        },
        monthLock: {
            findFirst: vi.fn(),
        },
        taskAssignment: {
            findFirst: vi.fn(),
        },
        task: {
            findUnique: vi.fn(),
        },
        workdaySummary: {
            upsert: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findUnique: vi.fn(() => Promise.resolve(mockUser)),
        },
        $transaction: vi.fn((callback) => callback({})),
    },
}));

// Mock jsonwebtoken to return authenticated user
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

// Mock jwt config
vi.mock('../../src/config/jwt', () => ({
    jwtConfig: {
        secret: 'test-secret',
        expiresIn: '2h',
        expiresInSeconds: 7200,
    },
}));

// Import after mocks
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { router } from '../../src/routes';

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', router);
    app.use(errorMiddleware);
});

describe('Time Entries Endpoints - Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/time-entries', () => {
        it('should return 400 for invalid date format', async () => {
            const response = await request(app)
                .post('/api/time-entries')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    workDate: 'invalid-date',
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'OFFICE',
                    taskId: 'a0000000-0000-0000-0000-000000000001',
                    description: 'Working on test task implementation',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid time format', async () => {
            const response = await request(app)
                .post('/api/time-entries')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    workDate: '2026-01-17',
                    startTime: '9:00', // Invalid - should be 09:00
                    endTime: '10:30',
                    location: 'OFFICE',
                    taskId: 'a0000000-0000-0000-0000-000000000001',
                    description: 'Working on test task implementation',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for description too short', async () => {
            const response = await request(app)
                .post('/api/time-entries')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    workDate: '2026-01-17',
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'OFFICE',
                    taskId: 'a0000000-0000-0000-0000-000000000001',
                    description: 'short',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid location', async () => {
            const response = await request(app)
                .post('/api/time-entries')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    workDate: '2026-01-17',
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'INVALID',
                    taskId: 'a0000000-0000-0000-0000-000000000001',
                    description: 'Working on test task implementation',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid taskId', async () => {
            const response = await request(app)
                .post('/api/time-entries')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    workDate: '2026-01-17',
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'OFFICE',
                    taskId: 'not-a-uuid',
                    description: 'Working on test task implementation',
                });

            expect(response.status).toBe(400);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/time-entries')
                .send({
                    workDate: '2026-01-17',
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'OFFICE',
                    taskId: 'a0000000-0000-0000-0000-000000000001',
                    description: 'Working on test task implementation',
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/time-entries/history', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/api/time-entries/history');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/time-entries/batch', () => {
        it('should return 400 when entries array is empty', async () => {
            const response = await request(app)
                .post('/api/time-entries/batch')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    entries: [],
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 when entries is missing', async () => {
            const response = await request(app)
                .post('/api/time-entries/batch')
                .set('Authorization', 'Bearer valid-token')
                .send({});

            expect(response.status).toBe(400);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/time-entries/batch')
                .send({
                    entries: [],
                });

            expect(response.status).toBe(401);
        });
    });
});
