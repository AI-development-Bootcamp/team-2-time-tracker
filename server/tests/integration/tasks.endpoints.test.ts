/**
 * @fileoverview Integration tests for tasks endpoints
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Mock Prisma and dependencies BEFORE any imports
vi.mock('@prisma/client');
vi.mock('pg');
vi.mock('@prisma/adapter-pg');

import express, { Express } from 'express';
import request from 'supertest';
import {
    mockPrismaProject,
    mockPrismaTask,
    mockPrismaTimeEntry,
    resetPrismaMocks,
    createMockUser,
    mockPrismaUser,
} from '../helpers/mockPrisma';
import { router } from '../../src/routes';
import { errorMiddleware } from '../../src/middlewares/error.middleware';

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'mock-jwt-token'),
        verify: vi.fn(() => ({
            userId: 'admin-user-id',
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

// Helper to create mock task
const createMockTask = (overrides?: any) => ({
    id: 'task-1',
    name: 'Test Task',
    projectId: 'project-1',
    status: 'OPEN',
    startDate: null,
    endDate: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    project: {
        id: 'project-1',
        name: 'Test Project',
        clientId: 'client-1',
        startDate: null,
        endDate: null,
        client: {
            id: 'client-1',
            name: 'Test Client',
        },
    },
    _count: {
        assignments: 0,
        timeEntries: 0,
    },
    ...overrides,
});

// Helper to create mock project
const createMockProject = (overrides?: any) => ({
    id: 'project-1',
    name: 'Test Project',
    clientId: 'client-1',
    status: 'ACTIVE',
    reportType: 'TOTAL_HOURS',
    startDate: null,
    endDate: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    client: {
        id: 'client-1',
        name: 'Test Client',
    },
    _count: {
        tasks: 0,
    },
    ...overrides,
});

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', router);
    app.use(errorMiddleware);
});

describe('Tasks Endpoints', () => {
    beforeEach(() => {
        resetPrismaMocks();
        vi.clearAllMocks();

        // Mock admin user for authentication
        const mockAdminUser = createMockUser({
            id: 'admin-user-id',
            email: 'admin@example.com',
            role: 'ADMIN',
            isActive: true,
        });
        mockPrismaUser.findUnique.mockResolvedValue(mockAdminUser);
    });

    describe('GET /api/admin/tasks', () => {
        it('should return 200 and list of tasks', async () => {
            const mockTasks = [
                createMockTask({ id: '1', name: 'Task 1' }),
                createMockTask({ id: '2', name: 'Task 2' }),
            ];

            mockPrismaTask.findMany.mockResolvedValue(mockTasks);

            const response = await request(app)
                .get('/api/admin/tasks')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0].name).toBe('Task 1');
        });

        it('should filter tasks by projectId', async () => {
            const mockTasks = [createMockTask({ projectId: 'project-1' })];

            mockPrismaTask.findMany.mockResolvedValue(mockTasks);

            const response = await request(app)
                .get('/api/admin/tasks?projectId=project-1')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(200);
            expect(mockPrismaTask.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { projectId: 'project-1' },
                })
            );
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/api/admin/tasks');
            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/admin/tasks', () => {
        it('should create a new task with OPEN status', async () => {
            const validProjectId = '550e8400-e29b-41d4-a716-446655440001';
            const newTask = createMockTask({ name: 'New Task' });

            mockPrismaProject.findUnique.mockResolvedValue(createMockProject());
            mockPrismaTask.create.mockResolvedValue(newTask);

            const response = await request(app)
                .post('/api/admin/tasks')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Task',
                    projectId: validProjectId,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('New Task');
            expect(mockPrismaTask.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: 'OPEN',
                    }),
                })
            );
        });

        it('should create task with date range', async () => {
            const validProjectId = '550e8400-e29b-41d4-a716-446655440001';
            const newTask = createMockTask({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });

            mockPrismaProject.findUnique.mockResolvedValue(createMockProject());
            mockPrismaTask.create.mockResolvedValue(newTask);

            const response = await request(app)
                .post('/api/admin/tasks')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Task',
                    projectId: validProjectId,
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                });

            expect(response.status).toBe(201);
        });

        it('should return 404 when project does not exist', async () => {
            const nonExistentProjectId = '550e8400-e29b-41d4-a716-446655440099';
            mockPrismaProject.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/admin/tasks')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Task',
                    projectId: nonExistentProjectId,
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 when endDate is before startDate', async () => {
            const validProjectId = '550e8400-e29b-41d4-a716-446655440001';
            mockPrismaProject.findUnique.mockResolvedValue(createMockProject());

            const response = await request(app)
                .post('/api/admin/tasks')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Task',
                    projectId: validProjectId,
                    startDate: '2024-12-31',
                    endDate: '2024-01-01',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 when task dates are outside project dates', async () => {
            const validProjectId = '550e8400-e29b-41d4-a716-446655440001';
            mockPrismaProject.findUnique.mockResolvedValue(
                createMockProject({
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-06-30'),
                })
            );

            const response = await request(app)
                .post('/api/admin/tasks')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Task',
                    projectId: validProjectId,
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/admin/tasks/:id', () => {
        it('should return task by id', async () => {
            const mockTask = createMockTask();
            mockPrismaTask.findUnique.mockResolvedValue(mockTask);

            const response = await request(app)
                .get('/api/admin/tasks/task-1')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe('task-1');
        });

        it('should return 404 when task not found', async () => {
            mockPrismaTask.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/admin/tasks/nonexistent')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/admin/tasks/:id', () => {
        it('should update task name', async () => {
            const existingTask = createMockTask();
            const updatedTask = createMockTask({ name: 'Updated Task' });

            mockPrismaTask.findUnique.mockResolvedValue(existingTask);
            mockPrismaProject.findUnique.mockResolvedValue(createMockProject());
            mockPrismaTask.update.mockResolvedValue(updatedTask);

            const response = await request(app)
                .put('/api/admin/tasks/task-1')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ name: 'Updated Task' });

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe('Updated Task');
        });

        it('should return 404 when task not found', async () => {
            mockPrismaTask.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/admin/tasks/nonexistent')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ name: 'Updated Task' });

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/admin/tasks/:id/status', () => {
        it('should update task status to CLOSED', async () => {
            const existingTask = createMockTask({ _count: { timeEntries: 0 } });
            const updatedTask = createMockTask({ status: 'CLOSED' });

            mockPrismaTask.findUnique.mockResolvedValue(existingTask);
            mockPrismaTimeEntry.count.mockResolvedValue(0);
            mockPrismaTask.update.mockResolvedValue(updatedTask);

            const response = await request(app)
                .put('/api/admin/tasks/task-1/status')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ status: 'CLOSED' });

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('CLOSED');
        });

        it('should return 400 when trying to close task with time entries', async () => {
            const existingTask = createMockTask({ _count: { timeEntries: 5 } });

            mockPrismaTask.findUnique.mockResolvedValue(existingTask);
            mockPrismaTimeEntry.count.mockResolvedValue(5);

            const response = await request(app)
                .put('/api/admin/tasks/task-1/status')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ status: 'CLOSED' });

            expect(response.status).toBe(400);
            expect(response.body.error.message).toContain('logged time');
        });

        it('should allow reopening a closed task', async () => {
            const existingTask = createMockTask({ status: 'CLOSED' });
            const updatedTask = createMockTask({ status: 'OPEN' });

            mockPrismaTask.findUnique.mockResolvedValue(existingTask);
            mockPrismaTask.update.mockResolvedValue(updatedTask);

            const response = await request(app)
                .put('/api/admin/tasks/task-1/status')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ status: 'OPEN' });

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('OPEN');
        });
    });
});
