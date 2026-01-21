/**
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
        });
    });
});
