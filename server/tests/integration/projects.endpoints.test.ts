/**
 * @fileoverview Integration tests for projects endpoints
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Mock Prisma and dependencies BEFORE any imports
vi.mock('@prisma/client');
vi.mock('pg');
vi.mock('@prisma/adapter-pg');

import express, { Express } from 'express';
import request from 'supertest';
import {
    mockPrismaClient,
    mockPrismaProject,
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

describe('Projects Endpoints', () => {
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

    describe('GET /api/admin/projects', () => {
        it('should return 200 and list of projects', async () => {
            const mockProjects = [
                createMockProject({ id: '1', name: 'Project 1' }),
                createMockProject({ id: '2', name: 'Project 2' }),
            ];

            mockPrismaProject.findMany.mockResolvedValue(mockProjects);

            const response = await request(app)
                .get('/api/admin/projects')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0].name).toBe('Project 1');
        });

        it('should filter projects by clientId', async () => {
            const mockProjects = [createMockProject({ clientId: 'client-1' })];

            mockPrismaProject.findMany.mockResolvedValue(mockProjects);

            const response = await request(app)
                .get('/api/admin/projects?clientId=client-1')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(200);
            expect(mockPrismaProject.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { clientId: 'client-1' },
                })
            );
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/api/admin/projects');
            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/admin/projects', () => {
        it('should create a new project with ACTIVE status and TOTAL_HOURS report type', async () => {
            const validClientId = '550e8400-e29b-41d4-a716-446655440000';
            const newProject = createMockProject({
                name: 'New Project',
                clientId: validClientId,
            });

            mockPrismaClient.findUnique.mockResolvedValue({ id: validClientId, name: 'Test Client' });
            mockPrismaProject.create.mockResolvedValue(newProject);

            const response = await request(app)
                .post('/api/admin/projects')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Project',
                    clientId: validClientId,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('New Project');
            expect(mockPrismaProject.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: 'ACTIVE',
                        reportType: 'TOTAL_HOURS',
                    }),
                })
            );
        });

        it('should create project with custom report type', async () => {
            const validClientId = '550e8400-e29b-41d4-a716-446655440000';
            const newProject = createMockProject({
                reportType: 'ENTRY_EXIT',
            });

            mockPrismaClient.findUnique.mockResolvedValue({ id: validClientId });
            mockPrismaProject.create.mockResolvedValue(newProject);

            const response = await request(app)
                .post('/api/admin/projects')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Project',
                    clientId: validClientId,
                    reportType: 'ENTRY_EXIT',
                });

            expect(response.status).toBe(201);
            expect(response.body.data.reportType).toBe('ENTRY_EXIT');
        });

        it('should create project with date range', async () => {
            const validClientId = '550e8400-e29b-41d4-a716-446655440000';
            const newProject = createMockProject({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });

            mockPrismaClient.findUnique.mockResolvedValue({ id: validClientId });
            mockPrismaProject.create.mockResolvedValue(newProject);

            const response = await request(app)
                .post('/api/admin/projects')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Project',
                    clientId: validClientId,
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                });

            expect(response.status).toBe(201);
        });

        it('should return 400 when client does not exist', async () => {
            const nonExistentClientId = '550e8400-e29b-41d4-a716-446655440099';
            mockPrismaClient.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/admin/projects')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Project',
                    clientId: nonExistentClientId,
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 when endDate is before startDate', async () => {
            const validClientId = '550e8400-e29b-41d4-a716-446655440000';
            mockPrismaClient.findUnique.mockResolvedValue({ id: validClientId });

            const response = await request(app)
                .post('/api/admin/projects')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Project',
                    clientId: validClientId,
                    startDate: '2024-12-31',
                    endDate: '2024-01-01',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/admin/projects/:id', () => {
        it('should return project by id', async () => {
            const mockProject = createMockProject();
            mockPrismaProject.findUnique.mockResolvedValue(mockProject);

            const response = await request(app)
                .get('/api/admin/projects/project-1')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe('project-1');
        });

        it('should return 404 when project not found', async () => {
            mockPrismaProject.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/admin/projects/nonexistent')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/admin/projects/:id', () => {
        it('should update project name', async () => {
            const existingProject = createMockProject();
            const updatedProject = createMockProject({ name: 'Updated Name' });

            mockPrismaProject.findUnique.mockResolvedValue(existingProject);
            mockPrismaProject.update.mockResolvedValue(updatedProject);

            const response = await request(app)
                .put('/api/admin/projects/project-1')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe('Updated Name');
        });

        it('should return 404 when project not found', async () => {
            mockPrismaProject.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/admin/projects/nonexistent')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/admin/projects/:id/status', () => {
        it('should update project status', async () => {
            const existingProject = createMockProject();
            const updatedProject = createMockProject({ status: 'INACTIVE' });

            mockPrismaProject.findUnique.mockResolvedValue(existingProject);
            mockPrismaProject.update.mockResolvedValue(updatedProject);

            const response = await request(app)
                .put('/api/admin/projects/project-1/status')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ status: 'INACTIVE' });

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('INACTIVE');
        });
    });

    describe('PUT /api/admin/projects/:id/report-type', () => {
        it('should update project report type', async () => {
            const existingProject = createMockProject();
            const updatedProject = createMockProject({ reportType: 'ENTRY_EXIT' });

            mockPrismaProject.findUnique.mockResolvedValue(existingProject);
            mockPrismaProject.update.mockResolvedValue(updatedProject);

            const response = await request(app)
                .put('/api/admin/projects/project-1/report-type')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ reportType: 'ENTRY_EXIT' });

            expect(response.status).toBe(200);
            expect(response.body.data.reportType).toBe('ENTRY_EXIT');
        });
    });
});
