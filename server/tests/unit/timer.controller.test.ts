/**
 * @fileoverview Integration tests for Timer Controller (Happy Paths)
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import {
    mockTimeReportsPrisma,
    mockPrismaTimer,
    mockPrismaMonthLock,
    mockPrismaUser,
    mockPrismaTaskAssignment,
    mockPrismaWorkdaySummary,
    mockPrismaTimeEntry,
    resetTimeReportsPrismaMocks
} from '../helpers/mockTimeReportsPrisma';

const MOCK_IDS = {
    USER: '550e8400-e29b-41d4-a716-446655440000',
    TIMER: '550e8400-e29b-41d4-a716-446655440010',
    TASK: '550e8400-e29b-41d4-a716-446655440003',
    PROJECT: '550e8400-e29b-41d4-a716-446655440002',
    CLIENT: '550e8400-e29b-41d4-a716-446655440001',
    ENTRY: '550e8400-e29b-41d4-a716-446655440005',
};

// Mock user for auth
const mockUser = {
    id: MOCK_IDS.USER,
    email: 'test@example.com',
    role: 'EMPLOYEE',
    isActive: true,
};

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'mock-jwt-token'),
        verify: vi.fn(() => ({
            userId: MOCK_IDS.USER,
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

describe('Timer Controller - Happy Paths', () => {
    beforeEach(() => {
        resetTimeReportsPrismaMocks();
        vi.clearAllMocks();

        // Setup auth mock
        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        vi.mocked(authRepo.findUserById).mockResolvedValue(mockUser as any);

        // Default mocks
        mockPrismaMonthLock.findFirst.mockResolvedValue(null); // Month not locked
        mockPrismaTimer.findFirst.mockResolvedValue(null); // No running timer by default
    });

    describe('POST /api/timer/start', () => {
        it('should start a timer successfully', async () => {
            const today = new Date().toISOString().split('T')[0];

            mockPrismaTimer.create.mockResolvedValue({
                id: MOCK_IDS.TIMER,
                startedAt: new Date(),
                userId: MOCK_IDS.USER
            });

            const response = await request(app)
                .post('/api/timer/start')
                .set('Authorization', 'Bearer token')
                .send({ workDate: today });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(MOCK_IDS.TIMER);
        });
    });

    describe('GET /api/timer/status', () => {
        it('should return status when no timer is running', async () => {
            mockPrismaTimer.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/timer/status')
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.data.isRunning).toBe(false);
        });

        it('should return status when timer IS running', async () => {
            const startedAt = new Date(Date.now() - 3600000); // 1 hour ago
            mockPrismaTimer.findFirst.mockResolvedValue({
                id: MOCK_IDS.TIMER,
                userId: MOCK_IDS.USER,
                workDate: new Date(),
                startedAt: startedAt,
                isRunning: true,
                createdAt: startedAt,
                updatedAt: startedAt,
            });

            const response = await request(app)
                .get('/api/timer/status')
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.data.isRunning).toBe(true);
            expect(response.body.data.elapsedMinutes).toBeGreaterThanOrEqual(59);
        });
    });

    describe('POST /api/timer/stop', () => {
        it('should stop timer and create entry', async () => {
            const startedAt = new Date(Date.now() - 3600000); // 1 hour ago

            // Mock running timer
            mockPrismaTimer.findFirst.mockResolvedValue({
                id: MOCK_IDS.TIMER,
                userId: MOCK_IDS.USER,
                workDate: new Date(),
                startedAt: startedAt,
                isRunning: true,
            });

            // Mock task assignment
            mockPrismaTaskAssignment.findFirst.mockResolvedValue({ id: 'assignment-1' });

            // Mock transaction result (Time Entry)
            mockPrismaTimeEntry.create.mockResolvedValue({
                id: MOCK_IDS.ENTRY,
                userId: MOCK_IDS.USER,
                workDate: new Date(),
                startTime: startedAt,
                endTime: new Date(),
                durationMinutes: 60,
                location: 'OFFICE',
                description: 'Stopped timer',
                source: 'TIMER',
                task: {
                    id: MOCK_IDS.TASK,
                    name: 'Test Task',
                    project: { id: MOCK_IDS.PROJECT, name: 'Project', client: { id: MOCK_IDS.CLIENT, name: 'Client' } }
                }
            });
            mockPrismaTimer.update.mockResolvedValue({});
            mockPrismaWorkdaySummary.upsert.mockResolvedValue({});

            const response = await request(app)
                .post('/api/timer/stop')
                .set('Authorization', 'Bearer token')
                .send({
                    taskId: MOCK_IDS.TASK,
                    location: 'OFFICE',
                    description: 'Stopped timer description',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(MOCK_IDS.ENTRY);
        });
    });

    describe('DELETE /api/timer/cancel', () => {
        it('should cancel timer successfully', async () => {
            // Mock running timer
            mockPrismaTimer.findFirst.mockResolvedValue({
                id: MOCK_IDS.TIMER,
                userId: MOCK_IDS.USER,
                isRunning: true
            });

            mockPrismaTimer.delete.mockResolvedValue({ id: MOCK_IDS.TIMER });

            const response = await request(app)
                .delete('/api/timer/cancel')
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
