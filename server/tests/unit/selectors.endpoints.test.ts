/**
 * @fileoverview Integration tests for selectors endpoints
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import {
    mockSelectorsPrisma,
    mockPrismaClient,
    mockPrismaProject,
    mockPrismaTask,
    mockPrismaWorkdaySummary,
    mockPrismaTimeEntry,
    mockPrismaUser,
    createMockClient,
    createMockProject,
    createMockTask,
    resetSelectorsPrismaMocks
} from '../helpers/mockSelectorsPrisma';

// Mock user for auth
const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'EMPLOYEE',
    isActive: true,
};

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
import * as authRepo from '../../src/modules/auth/auth.repo';

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', router);
    app.use(errorMiddleware);
});

describe('Selectors Endpoints', () => {
    beforeEach(() => {
        resetSelectorsPrismaMocks();
        vi.clearAllMocks();

        // Setup auth mock
        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        vi.mocked(authRepo.findUserById).mockResolvedValue(mockUser as any);
    });

    describe('GET /api/selectors/clients', () => {
        it('should return list of clients', async () => {
            const mockClients = [createMockClient(), createMockClient({ id: 'client-2', name: 'Client 2' })];
            mockPrismaClient.findMany.mockResolvedValue(mockClients);
            mockPrismaTimeEntry.count.mockResolvedValue(0);

            const response = await request(app)
                .get('/api/selectors/clients')
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(mockPrismaClient.findMany).toHaveBeenCalled();
        });

        it('should sort by frequency if requested', async () => {
            const mockClients = [createMockClient(), createMockClient({ id: 'client-2', name: 'Client 2' })];
            mockPrismaClient.findMany.mockResolvedValue(mockClients);

            // First count call for client-1 returns 2, second for client-2 returns 5
            mockPrismaTimeEntry.count.mockResolvedValueOnce(2).mockResolvedValueOnce(5);

            const response = await request(app)
                .get('/api/selectors/clients?sort=frequency')
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            // Client 2 (5 usages) should be first
            expect(response.body.data[0].id).toBe('client-2');
        });
    });

    describe('GET /api/selectors/projects', () => {
        it('should return projects', async () => {
            const mockProjects = [createMockProject()];
            mockPrismaProject.findMany.mockResolvedValue(mockProjects);
            mockPrismaTimeEntry.count.mockResolvedValue(0);

            const response = await request(app)
                .get('/api/selectors/projects')
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);
        });

        it('should filter by client if provided', async () => {
            const mockProjects = [createMockProject()];
            mockPrismaProject.findMany.mockResolvedValue(mockProjects);

            await request(app)
                .get('/api/selectors/projects?clientId=client-1')
                .set('Authorization', 'Bearer token');

            const calls = mockPrismaProject.findMany.mock.calls[0][0];
            expect(calls.where.clientId).toBe('client-1');
        });
    });

    describe('GET /api/selectors/tasks', () => {
        it('should return tasks', async () => {
            const mockTasks = [createMockTask()];
            mockPrismaTask.findMany.mockResolvedValue(mockTasks);
            mockPrismaTimeEntry.count.mockResolvedValue(0);

            const response = await request(app)
                .get('/api/selectors/tasks')
                .set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);
        });
    });
});
