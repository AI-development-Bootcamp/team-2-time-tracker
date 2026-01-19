/**
 * @fileoverview Unit tests for Users Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as usersService from '../../src/modules/users/users.service';
import * as usersRepo from '../../src/modules/users/users.repo';
import * as authService from '../../src/modules/auth/auth.service';
import { NotFoundError, BadRequestError } from '../../src/shared/errors';

// Mock dependencies
vi.mock('../../src/modules/users/users.repo');
vi.mock('../../src/modules/auth/auth.service');

describe('Users Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('listUsers', () => {
        it('should return paginated users', async () => {
            const mockUsers = [{ id: '1', email: 'test@example.com' }];
            const mockParams = { page: 1, pageSize: 10 };

            vi.mocked(usersRepo.findAllUsers).mockResolvedValue({
                users: mockUsers as any,
                total: 1
            });

            const result = await usersService.listUsers(mockParams);

            expect(result.users).toEqual(mockUsers);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            });
            expect(usersRepo.findAllUsers).toHaveBeenCalledWith(mockParams);
        });

        it('should calculate pagination correctly', async () => {
            vi.mocked(usersRepo.findAllUsers).mockResolvedValue({
                users: [],
                total: 25
            });

            const result = await usersService.listUsers({ page: 2, pageSize: 10 });

            expect(result.pagination.totalPages).toBe(3);
            expect(result.pagination.hasNext).toBe(true);
            expect(result.pagination.hasPrev).toBe(true);
        });
    });

    describe('getUserById', () => {
        it('should return user when found', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            vi.mocked(usersRepo.findUserById).mockResolvedValue(mockUser as any);

            const result = await usersService.getUserById('1');

            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundError when user not found', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue(null);

            await expect(usersService.getUserById('1'))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('createUser', () => {
        const createData = {
            email: 'new@example.com',
            password: 'password',
            fullName: 'New User',
            role: 'EMPLOYEE' as const
        };

        it('should create user successfully', async () => {
            vi.mocked(usersRepo.findUserByEmail).mockResolvedValue(null);
            vi.mocked(authService.hashPassword).mockResolvedValue('hashed_password');
            vi.mocked(usersRepo.createUser).mockResolvedValue({ id: '1', ...createData } as any);

            const result = await usersService.createUser(createData);

            expect(usersRepo.findUserByEmail).toHaveBeenCalledWith(createData.email);
            expect(authService.hashPassword).toHaveBeenCalledWith(createData.password);
            expect(usersRepo.createUser).toHaveBeenCalledWith({
                ...createData,
                password: 'hashed_password'
            });
            expect(result).toBeDefined();
        });

        it('should throw BadRequestError if email exists', async () => {
            vi.mocked(usersRepo.findUserByEmail).mockResolvedValue({ id: '1' } as any);

            await expect(usersService.createUser(createData))
                .rejects.toThrow(BadRequestError);
        });
    });

    describe('updateUser', () => {
        const updateData = { fullName: 'Updated Name' };

        it('should update user successfully', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue({ id: '1', email: 'old@example.com' } as any);
            vi.mocked(usersRepo.updateUser).mockResolvedValue({ id: '1', ...updateData } as any);

            const result = await usersService.updateUser('1', updateData);

            expect(usersRepo.updateUser).toHaveBeenCalledWith('1', updateData);
            expect(result).toBeDefined();
        });

        it('should throw NotFoundError if user does not exist', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue(null);

            await expect(usersService.updateUser('1', updateData))
                .rejects.toThrow(NotFoundError);
        });

        it('should throw BadRequestError if new email is taken', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue({ id: '1', email: 'old@example.com' } as any);
            vi.mocked(usersRepo.findUserByEmail).mockResolvedValue({ id: '2' } as any); // Different user has email

            await expect(usersService.updateUser('1', { email: 'taken@example.com' }))
                .rejects.toThrow(BadRequestError);
        });

        it('should allow updating to same email (case insensitive)', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue({ id: '1', email: 'same@example.com' } as any);
            // findUserByEmail check is skipped if email is effectively same
            // Wait, logic is: if (data.email && data.email.toLowerCase() !== user.email)

            vi.mocked(usersRepo.updateUser).mockResolvedValue({ id: '1' } as any);

            await usersService.updateUser('1', { email: 'SAME@example.com' });

            expect(usersRepo.findUserByEmail).not.toHaveBeenCalled();
            expect(usersRepo.updateUser).toHaveBeenCalled();
        });
    });

    describe('updateUserStatus', () => {
        it('should update status successfully', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue({ id: '1' } as any);
            vi.mocked(usersRepo.updateUserStatus).mockResolvedValue({ id: '1', isActive: false } as any);

            await usersService.updateUserStatus('1', false);

            expect(usersRepo.updateUserStatus).toHaveBeenCalledWith('1', false);
        });

        it('should throw NotFoundError if user does not exist', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue(null);

            await expect(usersService.updateUserStatus('1', false))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('resetUserPassword', () => {
        it('should reset password successfully', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue({ id: '1' } as any);
            vi.mocked(authService.hashPassword).mockResolvedValue('new_hash');
            vi.mocked(usersRepo.resetUserPassword).mockResolvedValue({ id: '1' } as any);

            await usersService.resetUserPassword('1', 'newpass');

            expect(authService.hashPassword).toHaveBeenCalledWith('newpass');
            expect(usersRepo.resetUserPassword).toHaveBeenCalledWith('1', 'new_hash', true);
        });

        it('should throw NotFoundError if user does not exist', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue(null);

            await expect(usersService.resetUserPassword('1', 'newpass'))
                .rejects.toThrow(NotFoundError);
        });
    });
});
