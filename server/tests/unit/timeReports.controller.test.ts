/**
 * @fileoverview Integration tests for Time Reports Controller (Happy Paths)
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import {
    mockTimeReportsPrisma,
    mockPrismaWorkdaySummary,
    mockPrismaTimeEntry,
    mockPrismaTask,
    mockPrismaTaskAssignment,
    mockPrismaUser,
    mockPrismaMonthLock,
    mockPrismaTimer,
    resetTimeReportsPrismaMocks
} from '../helpers/mockTimeReportsPrisma';

const MOCK_IDS = {
    USER: '550e8400-e29b-41d4-a716-446655440000',
    CLIENT: '550e8400-e29b-41d4-a716-446655440001',
    PROJECT: '550e8400-e29b-41d4-a716-446655440002',
    TASK: '550e8400-e29b-41d4-a716-446655440003',
    ASSIGNMENT: '550e8400-e29b-41d4-a716-446655440004',
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

describe('Time Reports Controller - Happy Paths', () => {
    beforeEach(() => {
        resetTimeReportsPrismaMocks();
        vi.clearAllMocks();

        // Setup auth mock
        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        vi.mocked(authRepo.findUserById).mockResolvedValue(mockUser as any);

        // Default mocks
        mockPrismaTimer.findFirst.mockResolvedValue(null); // No running timer
        mockPrismaMonthLock.findFirst.mockResolvedValue(null); // Month not locked
    });

    describe('POST /api/time-entries', () => {
        it('should create a time entry successfully', async () => {
            const entryData = {
                workDate: '2026-01-17',
                startTime: '09:00',
                endTime: '10:00',
                location: 'OFFICE',
                taskId: MOCK_IDS.TASK,
                description: 'Working on feature',
            };

            // Mock task assignment
            mockPrismaTaskAssignment.findFirst.mockResolvedValue({ id: MOCK_IDS.ASSIGNMENT });

            // Mock task
            mockPrismaTask.findUnique.mockResolvedValue({
                id: MOCK_IDS.TASK,
                projectId: MOCK_IDS.PROJECT,
                project: { reportType: 'HOURLY', client: { id: MOCK_IDS.CLIENT } }
            });

            // Mock transaction result
            mockPrismaTimeEntry.create.mockResolvedValue({
                id: MOCK_IDS.ENTRY,
                userId: MOCK_IDS.USER,
                ...entryData,
                workDate: new Date(entryData.workDate),
                startTime: new Date('2026-01-17T09:00:00Z'),
                endTime: new Date('2026-01-17T10:00:00Z'),
                durationMinutes: 60,
                source: 'MANUAL',
                task: {
                    id: MOCK_IDS.TASK,
                    name: 'Test Task',
                    project: { id: MOCK_IDS.PROJECT, name: 'Project', client: { id: MOCK_IDS.CLIENT, name: 'Client' } }
                }
            });
            mockPrismaWorkdaySummary.upsert.mockResolvedValue({});

            const response = await request(app)
                .post('/api/time-entries')
                .set('Authorization', 'Bearer token')
                .send(entryData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(MOCK_IDS.ENTRY);
        });
    });

    describe('GET /api/time-entries/history', () => {
        it('should return history with pagination', async () => {
            mockPrismaTimeEntry.findMany.mockResolvedValue([]);
            mockPrismaTimeEntry.count.mockResolvedValue(0);

            const response = await request(app)
                .get('/api/time-entries/history')
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.entries).toEqual([]);
            expect(response.body.data.pagination).toBeDefined();
        });
    });

    describe('POST /api/time-entries/batch', () => {
        it('should create batch entries successfully', async () => {
            const entriesData = [
                {
                    workDate: '2026-01-17',
                    startTime: '09:00',
                    endTime: '10:00',
                    location: 'OFFICE',
                    taskId: MOCK_IDS.TASK,
                    description: 'Batch entry 1 description',
                },
                {
                    workDate: '2026-01-17',
                    startTime: '10:00',
                    endTime: '11:00',
                    location: 'OFFICE',
                    taskId: MOCK_IDS.TASK,
                    description: 'Batch entry 2 description',
                }
            ];

            // Mock task assignment & task (called in loop)
            mockPrismaTaskAssignment.findFirst.mockResolvedValue({ id: MOCK_IDS.ASSIGNMENT });
            mockPrismaTask.findUnique.mockResolvedValue({
                id: MOCK_IDS.TASK,
                projectId: MOCK_IDS.PROJECT,
                project: { reportType: 'HOURLY', client: { id: MOCK_IDS.CLIENT } }
            });

            // Mock transaction result for create
            mockPrismaTimeEntry.create.mockImplementation((args) => {
                return Promise.resolve({
                    ...args.data,
                    id: '550e8400-e29b-41d4-a716-446655449999', // dummy ID
                    source: 'MANUAL',
                    task: {
                        id: MOCK_IDS.TASK,
                        name: 'Test Task',
                        project: { id: MOCK_IDS.PROJECT, name: 'Project', client: { id: MOCK_IDS.CLIENT, name: 'Client' } }
                    }
                });
            });
            mockPrismaWorkdaySummary.upsert.mockResolvedValue({});

            const response = await request(app)
                .post('/api/time-entries/batch')
                .set('Authorization', 'Bearer token')
                .send({ entries: entriesData });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.created).toHaveLength(2);
        });
    });

    describe('GET /api/time-entries/:id', () => {
        it('should return a single time entry', async () => {
            mockPrismaTimeEntry.findFirst.mockResolvedValue({
                id: MOCK_IDS.ENTRY,
                userId: MOCK_IDS.USER,
                workDate: new Date('2026-01-17'),
                startTime: new Date('2026-01-17T09:00:00Z'),
                endTime: new Date('2026-01-17T10:00:00Z'),
                durationMinutes: 60,
                taskId: MOCK_IDS.TASK,
                location: 'OFFICE',
                description: 'Description',
                source: 'MANUAL',
                task: {
                    id: MOCK_IDS.TASK,
                    name: 'Test Task',
                    project: { id: MOCK_IDS.PROJECT, name: 'Project', client: { id: MOCK_IDS.CLIENT, name: 'Client' } }
                }
            });

            const response = await request(app)
                .get(`/api/time-entries/${MOCK_IDS.ENTRY}`)
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe(MOCK_IDS.ENTRY);
        });
    });

    describe('PUT /api/time-entries/:id', () => {
        it('should update a time entry', async () => {
            // Mock existing entry
            mockPrismaTimeEntry.findFirst.mockResolvedValueOnce({
                id: MOCK_IDS.ENTRY,
                userId: MOCK_IDS.USER,
                workDate: new Date('2026-01-17'),
                startTime: new Date('2026-01-17T09:00:00Z'),
                endTime: new Date('2026-01-17T10:00:00Z'),
                durationMinutes: 60,
                taskId: MOCK_IDS.TASK,
                task: {
                    project: { id: MOCK_IDS.PROJECT, reportType: 'HOURLY' }
                }
            }).mockResolvedValueOnce({ // Repeated call inside transaction maybe? No, repo check first.
                id: MOCK_IDS.ENTRY,
                userId: MOCK_IDS.USER,
                // ...
            });

            // Mock task lookup
            mockPrismaTask.findUnique.mockResolvedValue({
                id: MOCK_IDS.TASK,
                project: { reportType: 'HOURLY' }
            });

            // Mock update result
            mockPrismaTimeEntry.update.mockResolvedValue({
                id: MOCK_IDS.ENTRY,
                userId: MOCK_IDS.USER,
                workDate: new Date('2026-01-17'),
                startTime: new Date('2026-01-17T09:00:00Z'),
                endTime: new Date('2026-01-17T11:00:00Z'), // Changed to 2 hours
                durationMinutes: 120,
                taskId: MOCK_IDS.TASK,
                location: 'OFFICE',
                description: 'Updated',
                source: 'MANUAL',
                task: {
                    id: MOCK_IDS.TASK,
                    name: 'Test Task',
                    project: { id: MOCK_IDS.PROJECT, name: 'Project', client: { id: MOCK_IDS.CLIENT, name: 'Client' } }
                }
            });

            const response = await request(app)
                .put(`/api/time-entries/${MOCK_IDS.ENTRY}`)
                .set('Authorization', 'Bearer token')
                .send({
                    endTime: '11:00'
                });

            expect(response.status).toBe(200);
            expect(response.body.data.durationMinutes).toBe(120);
        });
    });

    describe('DELETE /api/time-entries/:id', () => {
        it('should delete a time entry', async () => {
            // Mock existing entry
            mockPrismaTimeEntry.findFirst.mockResolvedValue({
                id: MOCK_IDS.ENTRY,
                userId: MOCK_IDS.USER,
                workDate: new Date('2026-01-17'),
                durationMinutes: 60,
            });


            const response = await request(app)
                .delete(`/api/time-entries/${MOCK_IDS.ENTRY}`)
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.data.isDeleted).toBe(true);
        });
    });
});
