/**
<<<<<<< HEAD:server/tests/integration/users.controller.test.ts
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
=======
 * @fileoverview Unit tests for users.controller.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import * as usersController from '../../src/modules/users/users.controller';
import * as usersService from '../../src/modules/users/users.service';
import { createMockUser } from '../helpers/mockPrisma';
import { NotFoundError, BadRequestError } from '../../src/shared/errors';

// Mock the users service
vi.mock('../../src/modules/users/users.service');

describe('users.controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {
            params: {},
            query: {},
            body: {},
        };
        mockResponse = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };
        mockNext = vi.fn();
        vi.clearAllMocks();
    });

    describe('listUsers', () => {
        it('should return paginated list of users', async () => {
            const mockUsers = [
                createMockUser({ id: '1', email: 'user1@example.com' }),
                createMockUser({ id: '2', email: 'user2@example.com' }),
            ];

            const mockResult = {
                users: mockUsers,
                pagination: {
                    page: 1,
                    pageSize: 20,
                    total: 2,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false,
                },
            };

            vi.mocked(usersService.listUsers).mockResolvedValue(mockResult);

            mockRequest.query = { page: '1', pageSize: '20' };

            await usersController.listUsers(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(usersService.listUsers).toHaveBeenCalledWith({
                page: 1,
                pageSize: 20,
                status: undefined,
                role: undefined,
                query: undefined,
            });

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult,
            });
        });

        it('should use default values for page and pageSize', async () => {
            const mockResult = {
                users: [],
                pagination: {
                    page: 1,
                    pageSize: 20,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
            };

            vi.mocked(usersService.listUsers).mockResolvedValue(mockResult);

            await usersController.listUsers(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(usersService.listUsers).toHaveBeenCalledWith({
                page: 1,
                pageSize: 20,
                status: undefined,
                role: undefined,
                query: undefined,
            });
        });

        it('should limit pageSize to 100', async () => {
            const mockResult = {
                users: [],
                pagination: {
                    page: 1,
                    pageSize: 100,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
            };

            vi.mocked(usersService.listUsers).mockResolvedValue(mockResult);

            mockRequest.query = { page: '1', pageSize: '200' };

            await usersController.listUsers(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(usersService.listUsers).toHaveBeenCalledWith({
                page: 1,
                pageSize: 100,
                status: undefined,
                role: undefined,
                query: undefined,
            });
        });

        it('should pass filters to service', async () => {
            const mockResult = {
                users: [],
                pagination: {
                    page: 1,
                    pageSize: 20,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
            };

            vi.mocked(usersService.listUsers).mockResolvedValue(mockResult);

            mockRequest.query = {
                page: '2',
                pageSize: '10',
                status: 'inactive',
                role: 'ADMIN',
                query: 'test',
            };

            await usersController.listUsers(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(usersService.listUsers).toHaveBeenCalledWith({
                page: 2,
                pageSize: 10,
                status: 'inactive',
                role: 'ADMIN',
                query: 'test',
            });
        });

        it('should call next with error on service failure', async () => {
            const error = new Error('Service error');
            vi.mocked(usersService.listUsers).mockRejectedValue(error);

            await usersController.listUsers(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockResponse.json).not.toHaveBeenCalled();
        });
    });

    describe('getUser', () => {
        it('should return a single user', async () => {
            const mockUser = createMockUser();
            vi.mocked(usersService.getUserById).mockResolvedValue(mockUser);

            mockRequest.params = { id: 'test-id' };

            await usersController.getUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(usersService.getUserById).toHaveBeenCalledWith('test-id');
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser,
            });
        });

        it('should call next with error when user not found', async () => {
            const error = new NotFoundError('User not found');
            vi.mocked(usersService.getUserById).mockRejectedValue(error);

            mockRequest.params = { id: 'non-existent-id' };

            await usersController.getUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockResponse.json).not.toHaveBeenCalled();
        });
    });

    describe('createUser', () => {
        it('should create a new user and return 201', async () => {
            const mockUser = createMockUser({ email: 'new@example.com' });
            vi.mocked(usersService.createUser).mockResolvedValue(mockUser);

            mockRequest.body = {
                fullName: 'New User',
                email: 'new@example.com',
                password: 'Password123!',
                role: 'EMPLOYEE',
            };

            await usersController.createUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(usersService.createUser).toHaveBeenCalledWith({
                fullName: 'New User',
                email: 'new@example.com',
                password: 'Password123!',
                role: 'EMPLOYEE',
            });

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser,
            });
        });

        it('should call next with error when email already exists', async () => {
            const error = new BadRequestError('Email already exists');
            vi.mocked(usersService.createUser).mockRejectedValue(error);

            mockRequest.body = {
                fullName: 'New User',
                email: 'existing@example.com',
                password: 'Password123!',
                role: 'EMPLOYEE',
            };

            await usersController.createUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockResponse.json).not.toHaveBeenCalled();
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully', async () => {
            const mockUser = createMockUser({ fullName: 'Updated Name' });
            vi.mocked(usersService.updateUser).mockResolvedValue(mockUser);

            mockRequest.params = { id: 'test-id' };
            mockRequest.body = {
                fullName: 'Updated Name',
                email: 'updated@example.com',
            };

            await usersController.updateUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(usersService.updateUser).toHaveBeenCalledWith('test-id', {
                fullName: 'Updated Name',
                email: 'updated@example.com',
            });

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser,
            });
        });

        it('should call next with error when user not found', async () => {
            const error = new NotFoundError('User not found');
            vi.mocked(usersService.updateUser).mockRejectedValue(error);

            mockRequest.params = { id: 'non-existent-id' };
            mockRequest.body = { fullName: 'Updated Name' };

            await usersController.updateUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockResponse.json).not.toHaveBeenCalled();
        });
    });

    describe('updateUserStatus', () => {
        it('should update user status successfully', async () => {
            const mockUser = createMockUser({ isActive: false });
            vi.mocked(usersService.updateUserStatus).mockResolvedValue(mockUser);

            mockRequest.params = { id: 'test-id' };
            mockRequest.body = { isActive: false };

            await usersController.updateUserStatus(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(usersService.updateUserStatus).toHaveBeenCalledWith('test-id', false);

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser,
            });
        });

        it('should call next with error when user not found', async () => {
            const error = new NotFoundError('User not found');
            vi.mocked(usersService.updateUserStatus).mockRejectedValue(error);

            mockRequest.params = { id: 'non-existent-id' };
            mockRequest.body = { isActive: false };

            await usersController.updateUserStatus(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockResponse.json).not.toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully with default requireChangeOnLogin', async () => {
            vi.mocked(usersService.resetUserPassword).mockResolvedValue(undefined);

            mockRequest.params = { id: 'test-id' };
            mockRequest.body = { newPassword: 'NewPassword123!' };

            await usersController.resetPassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(usersService.resetUserPassword).toHaveBeenCalledWith(
                'test-id',
                'NewPassword123!',
                true
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password reset successfully',
            });
        });

        it('should reset password with requireChangeOnLogin=false when specified', async () => {
            vi.mocked(usersService.resetUserPassword).mockResolvedValue(undefined);

            mockRequest.params = { id: 'test-id' };
            mockRequest.body = {
                newPassword: 'NewPassword123!',
                requireChangeOnLogin: false,
            };

            await usersController.resetPassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(usersService.resetUserPassword).toHaveBeenCalledWith(
                'test-id',
                'NewPassword123!',
                false
            );
        });

        it('should call next with error when user not found', async () => {
            const error = new NotFoundError('User not found');
            vi.mocked(usersService.resetUserPassword).mockRejectedValue(error);

            mockRequest.params = { id: 'non-existent-id' };
            mockRequest.body = { newPassword: 'NewPassword123!' };

            await usersController.resetPassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockResponse.json).not.toHaveBeenCalled();
>>>>>>> development:server/tests/unit/users.controller.test.ts
        });
    });
});
