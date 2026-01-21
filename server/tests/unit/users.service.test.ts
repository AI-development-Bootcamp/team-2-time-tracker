/**
<<<<<<< HEAD
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
=======
 * @fileoverview Unit tests for users.service.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import {
    mockPrisma,
    mockPrismaUser,
    resetPrismaMocks,
    createMockUser,
} from '../helpers/mockPrisma';

// Mock bcrypt
vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

// Import after mocks
import * as usersService from '../../src/modules/users/users.service';
import * as usersRepo from '../../src/modules/users/users.repo';
import { NotFoundError, BadRequestError } from '../../src/shared/errors';

// Mock the users repository
vi.mock('../../src/modules/users/users.repo');

describe('users.service', () => {
    beforeEach(() => {
        resetPrismaMocks();
>>>>>>> development
        vi.clearAllMocks();
    });

    describe('listUsers', () => {
<<<<<<< HEAD
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
=======
        it('should return paginated users with metadata', async () => {
            const mockUsers = [
                createMockUser({ id: '1', email: 'user1@example.com' }),
                createMockUser({ id: '2', email: 'user2@example.com' }),
            ];

            vi.mocked(usersRepo.findAllUsers).mockResolvedValue({
                users: mockUsers,
                total: 50,
            });

            const result = await usersService.listUsers({
                page: 1,
                pageSize: 20,
                status: 'active',
            });

            expect(result.users).toHaveLength(2);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.pageSize).toBe(20);
            expect(result.pagination.total).toBe(50);
            expect(result.pagination.totalPages).toBe(3);
            expect(result.pagination.hasNext).toBe(true);
            expect(result.pagination.hasPrev).toBe(false);
        });

        it('should handle last page pagination correctly', async () => {
            const mockUsers = [createMockUser()];

            vi.mocked(usersRepo.findAllUsers).mockResolvedValue({
                users: mockUsers,
                total: 21,
            });

            const result = await usersService.listUsers({
                page: 2,
                pageSize: 20,
            });

            expect(result.pagination.page).toBe(2);
            expect(result.pagination.hasNext).toBe(false);
            expect(result.pagination.hasPrev).toBe(true);
        });

        it('should pass filters to repository', async () => {
            vi.mocked(usersRepo.findAllUsers).mockResolvedValue({
                users: [],
                total: 0,
            });

            await usersService.listUsers({
                page: 1,
                pageSize: 20,
                status: 'inactive',
                role: 'ADMIN',
                query: 'test',
            });

            expect(usersRepo.findAllUsers).toHaveBeenCalledWith({
                page: 1,
                pageSize: 20,
                status: 'inactive',
                role: 'ADMIN',
                query: 'test',
            });
        });
>>>>>>> development
    });

    describe('getUserById', () => {
        it('should return user when found', async () => {
<<<<<<< HEAD
            const mockUser = { id: '1', email: 'test@example.com' };
            vi.mocked(usersRepo.findUserById).mockResolvedValue(mockUser as any);

            const result = await usersService.getUserById('1');

            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundError when user not found', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue(null);

            await expect(usersService.getUserById('1'))
                .rejects.toThrow(NotFoundError);
=======
            const mockUser = createMockUser();
            vi.mocked(usersRepo.findUserById).mockResolvedValue(mockUser);

            const result = await usersService.getUserById('test-id');

            expect(result).toEqual(mockUser);
            expect(usersRepo.findUserById).toHaveBeenCalledWith('test-id');
        });

        it('should throw NotFoundError when user does not exist', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue(null);

            await expect(usersService.getUserById('non-existent-id')).rejects.toThrow(
                NotFoundError
            );
>>>>>>> development
        });
    });

    describe('createUser', () => {
<<<<<<< HEAD
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
=======
        it('should create user with hashed password', async () => {
            const mockUser = createMockUser({ email: 'new@example.com' });

            vi.mocked(usersRepo.findUserByEmail).mockResolvedValue(null);
            vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
            vi.mocked(usersRepo.createUser).mockResolvedValue(mockUser);

            const result = await usersService.createUser({
                email: 'new@example.com',
                password: 'Password123!',
                fullName: 'New User',
                role: 'EMPLOYEE',
            });

            expect(result).toEqual(mockUser);
            expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
            expect(usersRepo.createUser).toHaveBeenCalledWith({
                email: 'new@example.com',
                password: 'hashed-password',
                fullName: 'New User',
                role: 'EMPLOYEE',
            });
        });

        it('should throw BadRequestError when email already exists', async () => {
            const existingUser = createMockUser({ email: 'existing@example.com' });
            vi.mocked(usersRepo.findUserByEmail).mockResolvedValue(existingUser);

            await expect(
                usersService.createUser({
                    email: 'existing@example.com',
                    password: 'Password123!',
                    fullName: 'New User',
                    role: 'EMPLOYEE',
                })
            ).rejects.toThrow(BadRequestError);
            expect(usersRepo.createUser).not.toHaveBeenCalled();
        });

        it('should check email case-insensitively', async () => {
            const existingUser = createMockUser({ email: 'test@example.com' });
            vi.mocked(usersRepo.findUserByEmail).mockResolvedValue(existingUser);

            await expect(
                usersService.createUser({
                    email: 'Test@Example.Com',
                    password: 'Password123!',
                    fullName: 'New User',
                    role: 'EMPLOYEE',
                })
            ).rejects.toThrow(BadRequestError);
        });

        it('should create user with requireChangeOnLogin=true', async () => {
            const mockUser = createMockUser({
                email: 'new@example.com',
                requireChangeOnLogin: true,
            });

            vi.mocked(usersRepo.findUserByEmail).mockResolvedValue(null);
            vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
            vi.mocked(usersRepo.createUser).mockResolvedValue(mockUser);

            const result = await usersService.createUser({
                email: 'new@example.com',
                password: 'Password123!',
                fullName: 'New User',
                role: 'EMPLOYEE',
            });

            expect(result.requireChangeOnLogin).toBe(true);
            expect(usersRepo.createUser).toHaveBeenCalledWith({
                email: 'new@example.com',
                password: 'hashed-password',
                fullName: 'New User',
                role: 'EMPLOYEE',
            });
>>>>>>> development
        });
    });

    describe('updateUser', () => {
<<<<<<< HEAD
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
=======
        it('should update user successfully', async () => {
            const existingUser = createMockUser({ email: 'old@example.com' });
            const updatedUser = createMockUser({
                fullName: 'Updated Name',
                email: 'new@example.com',
            });

            vi.mocked(usersRepo.findUserById).mockResolvedValue(existingUser);
            vi.mocked(usersRepo.findUserByEmail).mockResolvedValue(null);
            vi.mocked(usersRepo.updateUser).mockResolvedValue(updatedUser);

            const result = await usersService.updateUser('test-id', {
                fullName: 'Updated Name',
                email: 'new@example.com',
            });

            expect(result).toEqual(updatedUser);
            expect(usersRepo.updateUser).toHaveBeenCalledWith('test-id', {
                fullName: 'Updated Name',
                email: 'new@example.com',
            });
        });

        it('should throw NotFoundError when user does not exist', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue(null);

            await expect(
                usersService.updateUser('non-existent-id', { fullName: 'Updated Name' })
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw BadRequestError when new email is already in use', async () => {
            const existingUser = createMockUser({
                id: 'user-1',
                email: 'user1@example.com',
            });
            const otherUser = createMockUser({ id: 'user-2', email: 'user2@example.com' });

            vi.mocked(usersRepo.findUserById).mockResolvedValue(existingUser);
            vi.mocked(usersRepo.findUserByEmail).mockResolvedValue(otherUser);

            await expect(
                usersService.updateUser('user-1', { email: 'user2@example.com' })
            ).rejects.toThrow(BadRequestError);
        });

        it('should allow keeping the same email', async () => {
            const existingUser = createMockUser({ email: 'test@example.com' });

            vi.mocked(usersRepo.findUserById).mockResolvedValue(existingUser);
            vi.mocked(usersRepo.updateUser).mockResolvedValue(existingUser);

            const result = await usersService.updateUser('test-id', {
                email: 'test@example.com',
                fullName: 'Updated Name',
            });

            expect(result).toEqual(existingUser);
            expect(usersRepo.findUserByEmail).not.toHaveBeenCalled();
>>>>>>> development
        });
    });

    describe('updateUserStatus', () => {
<<<<<<< HEAD
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
=======
        it('should update user status successfully', async () => {
            const mockUser = createMockUser({ isActive: true });
            const updatedUser = createMockUser({ isActive: false });

            vi.mocked(usersRepo.findUserById).mockResolvedValue(mockUser);
            vi.mocked(usersRepo.updateUserStatus).mockResolvedValue(updatedUser);

            const result = await usersService.updateUserStatus('test-id', false);

            expect(result).toEqual(updatedUser);
            expect(usersRepo.updateUserStatus).toHaveBeenCalledWith('test-id', false);
        });

        it('should throw NotFoundError when user does not exist', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue(null);

            await expect(
                usersService.updateUserStatus('non-existent-id', false)
            ).rejects.toThrow(NotFoundError);
>>>>>>> development
        });
    });

    describe('resetUserPassword', () => {
<<<<<<< HEAD
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
=======
        it('should reset password with requireChangeOnLogin=true by default', async () => {
            const mockUser = createMockUser();

            vi.mocked(usersRepo.findUserById).mockResolvedValue(mockUser);
            vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
            vi.mocked(usersRepo.resetUserPassword).mockResolvedValue(mockUser);

            await usersService.resetUserPassword('test-id', 'NewPassword123!');

            expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 12);
            expect(usersRepo.resetUserPassword).toHaveBeenCalledWith(
                'test-id',
                'new-hashed-password',
                true
            );
        });

        it('should reset password with requireChangeOnLogin=false when specified', async () => {
            const mockUser = createMockUser();

            vi.mocked(usersRepo.findUserById).mockResolvedValue(mockUser);
            vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
            vi.mocked(usersRepo.resetUserPassword).mockResolvedValue(mockUser);

            await usersService.resetUserPassword('test-id', 'NewPassword123!', false);

            expect(usersRepo.resetUserPassword).toHaveBeenCalledWith(
                'test-id',
                'new-hashed-password',
                false
            );
        });

        it('should throw NotFoundError when user does not exist', async () => {
            vi.mocked(usersRepo.findUserById).mockResolvedValue(null);

            await expect(
                usersService.resetUserPassword('non-existent-id', 'NewPassword123!')
            ).rejects.toThrow(NotFoundError);
>>>>>>> development
        });
    });
});
