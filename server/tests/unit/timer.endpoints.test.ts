/**
 * @fileoverview Integration tests for timer endpoints
 * Tests focus on API validation and authentication.
 */

import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
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
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        monthLock: {
            findFirst: vi.fn(),
        },
        taskAssignment: {
            findFirst: vi.fn(),
        },
        timeEntry: {
            create: vi.fn(),
        },
        workdaySummary: {
            upsert: vi.fn(),
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

describe('Timer Endpoints - Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/timer/start', () => {
        it('should return 400 for invalid date format', async () => {
            const response = await request(app)
                .post('/api/timer/start')
                .set('Authorization', 'Bearer valid-token')
                .send({ workDate: 'invalid-date' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for missing workDate', async () => {
            const response = await request(app)
                .post('/api/timer/start')
                .set('Authorization', 'Bearer valid-token')
                .send({});

            expect(response.status).toBe(400);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/timer/start')
                .send({ workDate: '2026-01-17' });

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/timer/stop', () => {
        it('should return 400 for description too short', async () => {
            const response = await request(app)
                .post('/api/timer/stop')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    taskId: 'a0000000-0000-0000-0000-000000000001',
                    location: 'OFFICE',
                    description: 'short',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid taskId', async () => {
            const response = await request(app)
                .post('/api/timer/stop')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    taskId: 'not-a-uuid',
                    location: 'OFFICE',
                    description: 'Valid description text',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid location', async () => {
            const response = await request(app)
                .post('/api/timer/stop')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    taskId: 'a0000000-0000-0000-0000-000000000001',
                    location: 'INVALID',
                    description: 'Valid description text',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/timer/stop')
                .set('Authorization', 'Bearer valid-token')
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/timer/status', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/api/timer/status');

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/timer/cancel', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).delete('/api/timer/cancel');

            expect(response.status).toBe(401);
        });
    });
});
