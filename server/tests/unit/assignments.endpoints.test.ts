/**
 * @fileoverview Integration tests for assignments endpoints
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';

// Mock services
vi.mock('../../src/modules/admin/assignments/assignments.service', () => ({
    listTaskAssignments: vi.fn(),
    createTaskAssignment: vi.fn(),
    bulkCreateTaskAssignments: vi.fn(),
    getTaskAssignmentById: vi.fn(),
    deleteTaskAssignment: vi.fn(),
}));

// Mock auth repo
vi.mock('../../src/modules/auth/auth.repo', () => ({
    findUserById: vi.fn((id) => {
        if (id === 'admin-id') {
            return Promise.resolve({
                id: 'admin-id',
                role: 'ADMIN',
                isActive: true,
            });
        } else if (id === 'user-id') {
            return Promise.resolve({
                id: 'user-id',
                role: 'EMPLOYEE',
                isActive: true,
            });
        }
        return Promise.resolve(null);
    }),
}));

// Mock auth middleware dependencies
vi.mock('jsonwebtoken', () => ({
    default: {
        verify: vi.fn((token) => {
            if (token === 'valid-token') {
                return {
                    userId: 'admin-id',
                    email: 'admin@example.com',
                    role: 'ADMIN',
                };
            } else if (token === 'user-token') {
                return {
                    userId: 'user-id',
                    email: 'user@example.com',
                    role: 'EMPLOYEE',
                };
            }
            throw new Error('Invalid token');
        }),
    },
    verify: vi.fn((token) => {
        if (token === 'valid-token') {
            return {
                userId: 'admin-id',
                email: 'admin@example.com',
                role: 'ADMIN',
            };
        } else if (token === 'user-token') {
            return {
                userId: 'user-id',
                email: 'user@example.com',
                role: 'EMPLOYEE',
            };
        }
        throw new Error('Invalid token');
    }),
}));

import * as assignmentsService from '../../src/modules/admin/assignments/assignments.service';
import { assignmentsRouter } from '../../src/modules/admin/assignments/assignments.routes';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { NotFoundError, ValidationError } from '../../src/shared/errors';

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/admin/assignments', assignmentsRouter);
    app.use(errorMiddleware);
});

describe('Assignments Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const adminAuthHeader = 'Bearer valid-token';
    const userAuthHeader = 'Bearer user-token';

    describe('GET /admin/assignments', () => {
        it('should return 200 and list of assignments', async () => {
            const mockAssignments = [{ id: '1', userId: 'u1', taskId: 't1' }];
            vi.mocked(assignmentsService.listTaskAssignments).mockResolvedValue(mockAssignments as any);

            const response = await request(app)
                .get('/admin/assignments')
                .set('Authorization', adminAuthHeader);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockAssignments);
            expect(assignmentsService.listTaskAssignments).toHaveBeenCalledWith({});
        });

        it('should pass query filters', async () => {
            vi.mocked(assignmentsService.listTaskAssignments).mockResolvedValue([]);

            const response = await request(app)
                .get('/admin/assignments')
                .set('Authorization', adminAuthHeader)
                .query({ userId: 'u1', userName: 'john' });

            expect(response.status).toBe(200);
            expect(assignmentsService.listTaskAssignments).toHaveBeenCalledWith({
                userId: 'u1',
                userName: 'john',
            });
        });

        it('should return 403 for non-admin user', async () => {
            const response = await request(app)
                .get('/admin/assignments')
                .set('Authorization', userAuthHeader);

            expect(response.status).toBe(403);
        });
    });

    describe('POST /admin/assignments', () => {
        const validPayload = { userId: 'u1', taskId: 't1' };

        it('should return 201 and created assignment', async () => {
            const mockAssignment = { id: '1', ...validPayload };
            vi.mocked(assignmentsService.createTaskAssignment).mockResolvedValue(mockAssignment as any);

            const response = await request(app)
                .post('/admin/assignments')
                .set('Authorization', adminAuthHeader)
                .send(validPayload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockAssignment);
            expect(assignmentsService.createTaskAssignment).toHaveBeenCalledWith({
                ...validPayload,
                assignedByAdminId: 'admin-id',
            });
        });

        it('should return 400 for validation error (missing fields)', async () => {
            const response = await request(app)
                .post('/admin/assignments')
                .set('Authorization', adminAuthHeader)
                .send({ userId: 'u1' }); // Missing taskId

            expect(response.status).toBe(400);
            expect(assignmentsService.createTaskAssignment).not.toHaveBeenCalled();
        });

        it('should return 400 when service throws ValidationError', async () => {
            vi.mocked(assignmentsService.createTaskAssignment).mockRejectedValue(
                new ValidationError('Duplicate')
            );

            const response = await request(app)
                .post('/admin/assignments')
                .set('Authorization', adminAuthHeader)
                .send(validPayload);

            expect(response.status).toBe(400);
        });
    });

    describe('POST /admin/assignments/bulk', () => {
        const validPayload = { userIds: ['u1', 'u2'], taskIds: ['t1'] };

        it('should return 201 and bulk creation result', async () => {
            const mockResult = { created: [], count: 2 };
            vi.mocked(assignmentsService.bulkCreateTaskAssignments).mockResolvedValue(mockResult as any);

            const response = await request(app)
                .post('/admin/assignments/bulk')
                .set('Authorization', adminAuthHeader)
                .send(validPayload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockResult);
            expect(assignmentsService.bulkCreateTaskAssignments).toHaveBeenCalledWith({
                ...validPayload,
                assignedByAdminId: 'admin-id',
            });
        });

        it('should return 400 for empty arrays', async () => {
            const response = await request(app)
                .post('/admin/assignments/bulk')
                .set('Authorization', adminAuthHeader)
                .send({ userIds: [], taskIds: ['t1'] });

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /admin/assignments/:id', () => {
        it('should return 200 on successful deletion', async () => {
            vi.mocked(assignmentsService.deleteTaskAssignment).mockResolvedValue(undefined);

            const response = await request(app)
                .delete('/admin/assignments/123')
                .set('Authorization', adminAuthHeader);

            expect(response.status).toBe(200);
            expect(assignmentsService.deleteTaskAssignment).toHaveBeenCalledWith('123');
        });

        it('should return 404 when assignment not found', async () => {
            vi.mocked(assignmentsService.deleteTaskAssignment).mockRejectedValue(
                new NotFoundError('Not found')
            );

            const response = await request(app)
                .delete('/admin/assignments/123')
                .set('Authorization', adminAuthHeader);

            expect(response.status).toBe(404);
        });

        it('should return 400 when assignment has time entries', async () => {
            vi.mocked(assignmentsService.deleteTaskAssignment).mockRejectedValue(
                new ValidationError('Time entries exist')
            );

            const response = await request(app)
                .delete('/admin/assignments/123')
                .set('Authorization', adminAuthHeader);

            expect(response.status).toBe(400);
        });
    });
});
