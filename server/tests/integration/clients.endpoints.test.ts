/**
 * @fileoverview Integration tests for clients endpoints
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
    resetPrismaMocks,
    createMockClient,
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

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', router);
    app.use(errorMiddleware);
});

describe('Clients Endpoints', () => {
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

    describe('GET /api/admin/clients', () => {
        it('should return 200 and list of clients', async () => {
            const mockClients = [
                createMockClient({ id: '1', name: 'Client 1' }),
                createMockClient({ id: '2', name: 'Client 2' }),
            ];

            mockPrismaClient.findMany.mockResolvedValue(mockClients);

            const response = await request(app)
                .get('/api/admin/clients')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0].name).toBe('Client 1');
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/api/admin/clients');

            expect(response.status).toBe(401);
        });

        it('should return empty array when no clients exist', async () => {
            mockPrismaClient.findMany.mockResolvedValue([]);

            const response = await request(app)
                .get('/api/admin/clients')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(0);
        });
    });

    describe('POST /api/admin/clients', () => {
        it('should create a new client with name and description', async () => {
            const newClient = createMockClient({
                name: 'New Client',
                description: 'New client description',
            });

            mockPrismaClient.create.mockResolvedValue(newClient);

            const response = await request(app)
                .post('/api/admin/clients')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Client',
                    description: 'New client description',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('New Client');
            expect(response.body.data.description).toBe('New client description');
            expect(response.body.data.status).toBe('ACTIVE');
        });

        it('should create a new client with name only', async () => {
            const newClient = createMockClient({
                name: 'New Client',
                description: null,
            });

            mockPrismaClient.create.mockResolvedValue(newClient);

            const response = await request(app)
                .post('/api/admin/clients')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Client',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('New Client');
        });

        it('should return 400 for missing name', async () => {
            const response = await request(app)
                .post('/api/admin/clients')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    description: 'Description without name',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for empty name', async () => {
            const response = await request(app)
                .post('/api/admin/clients')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: '',
                });

            expect(response.status).toBe(400);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/admin/clients')
                .send({
                    name: 'New Client',
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/admin/clients/:id', () => {
        it('should return client by id', async () => {
            const mockClient = createMockClient({
                id: 'test-client-id',
                name: 'Test Client',
            });

            mockPrismaClient.findUnique.mockResolvedValue(mockClient);

            const response = await request(app)
                .get('/api/admin/clients/test-client-id')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe('test-client-id');
            expect(response.body.data.name).toBe('Test Client');
        });

        it('should return 404 when client not found', async () => {
            mockPrismaClient.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/admin/clients/non-existent-id')
                .set('Authorization', 'Bearer valid-admin-token');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/api/admin/clients/test-id');

            expect(response.status).toBe(401);
        });
    });

    describe('PUT /api/admin/clients/:id', () => {
        it('should update client name and description', async () => {
            const existingClient = createMockClient({
                id: 'test-id',
                name: 'Old Name',
            });
            const updatedClient = createMockClient({
                id: 'test-id',
                name: 'Updated Name',
                description: 'Updated description',
            });

            mockPrismaClient.findUnique.mockResolvedValue(existingClient);
            mockPrismaClient.update.mockResolvedValue(updatedClient);

            const response = await request(app)
                .put('/api/admin/clients/test-id')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'Updated Name',
                    description: 'Updated description',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Name');
            expect(response.body.data.description).toBe('Updated description');
        });

        it('should update only name', async () => {
            const existingClient = createMockClient();
            const updatedClient = createMockClient({ name: 'New Name' });

            mockPrismaClient.findUnique.mockResolvedValue(existingClient);
            mockPrismaClient.update.mockResolvedValue(updatedClient);

            const response = await request(app)
                .put('/api/admin/clients/test-id')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Name',
                });

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe('New Name');
        });

        it('should return 404 when client not found', async () => {
            mockPrismaClient.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/admin/clients/non-existent-id')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'Updated Name',
                });

            expect(response.status).toBe(404);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .put('/api/admin/clients/test-id')
                .send({
                    name: 'Updated Name',
                });

            expect(response.status).toBe(401);
        });
    });

    describe('PUT /api/admin/clients/:id/status', () => {
        it('should update client status to INACTIVE', async () => {
            const existingClient = createMockClient({ status: 'ACTIVE' });
            const updatedClient = createMockClient({ status: 'INACTIVE' });

            mockPrismaClient.findUnique.mockResolvedValue(existingClient);
            mockPrismaClient.update.mockResolvedValue(updatedClient);

            const response = await request(app)
                .put('/api/admin/clients/test-id/status')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    status: 'INACTIVE',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('INACTIVE');
        });

        it('should update client status to ACTIVE', async () => {
            const existingClient = createMockClient({ status: 'INACTIVE' });
            const updatedClient = createMockClient({ status: 'ACTIVE' });

            mockPrismaClient.findUnique.mockResolvedValue(existingClient);
            mockPrismaClient.update.mockResolvedValue(updatedClient);

            const response = await request(app)
                .put('/api/admin/clients/test-id/status')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    status: 'ACTIVE',
                });

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('ACTIVE');
        });

        it('should return 400 for invalid status', async () => {
            const response = await request(app)
                .put('/api/admin/clients/test-id/status')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    status: 'INVALID_STATUS',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for missing status', async () => {
            const response = await request(app)
                .put('/api/admin/clients/test-id/status')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({});

            expect(response.status).toBe(400);
        });

        it('should return 404 when client not found', async () => {
            mockPrismaClient.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/admin/clients/non-existent-id/status')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    status: 'INACTIVE',
                });

            expect(response.status).toBe(404);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .put('/api/admin/clients/test-id/status')
                .send({
                    status: 'INACTIVE',
                });

            expect(response.status).toBe(401);
        });
    });
});
