/**
 * @fileoverview Users service for admin user management
 * @module users/users.service
 */

import { NotFoundError, BadRequestError } from '../../shared/errors';
import { hashPassword } from '../auth/auth.service';
import * as usersRepo from './users.repo';

interface ListUsersParams {
    page: number;
    pageSize: number;
    status?: 'active' | 'inactive';
    role?: 'EMPLOYEE' | 'ADMIN';
    query?: string;
}

/**
 * @description Retrieves a paginated list of users with optional filtering.
 * @param {ListUsersParams} params - Filter and pagination parameters
 * @param {number} params.page - Page number (1-indexed)
 * @param {number} params.pageSize - Number of items per page
 * @param {string} [params.status] - Filter by 'active' or 'inactive'
 * @param {string} [params.role] - Filter by 'EMPLOYEE' or 'ADMIN'
 * @param {string} [params.query] - Search in name and email
 * @returns {Promise<{users: AdminUserDto[], pagination: PaginationInfo}>} Users list with pagination metadata
 * @example
 * const result = await listUsers({ page: 1, pageSize: 20, status: 'active' });
 * // { users: [...], pagination: { page: 1, total: 50, ... } }
 */
export async function listUsers(params: ListUsersParams) {
    const { users, total } = await usersRepo.findAllUsers(params);
    const totalPages = Math.ceil(total / params.pageSize);

    return {
        users,
        pagination: {
            page: params.page,
            pageSize: params.pageSize,
            total,
            totalPages,
            hasNext: params.page < totalPages,
            hasPrev: params.page > 1,
        },
    };
}

/**
 * @description Retrieves a single user by their ID.
 * @param {string} id - User's UUID
 * @returns {Promise<AdminUserDto>} User data including id, fullName, email, role, isActive, timestamps
 * @throws {NotFoundError} When user with given ID doesn't exist
 * @example
 * const user = await getUserById('123e4567-e89b-12d3-a456-426614174000');
 */
export async function getUserById(id: string) {
    const user = await usersRepo.findUserById(id);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    return user;
}

/**
 * @description Creates a new user account with hashed password.
 * Email is converted to lowercase for storage.
 * @param {Object} data - User creation data
 * @param {string} data.email - Unique email address
 * @param {string} data.password - Plain text password (will be hashed)
 * @param {string} data.fullName - User's full name (2-100 chars)
 * @param {string} data.role - 'EMPLOYEE' or 'ADMIN'
 * @returns {Promise<AdminUserDto>} Created user with mustChangePassword=true
 * @throws {BadRequestError} When email already exists
 * @example
 * const user = await createUser({
 *   email: 'new@example.com',
 *   password: 'TempPass123!',
 *   fullName: 'New Employee',
 *   role: 'EMPLOYEE'
 * });
 */
export async function createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: 'EMPLOYEE' | 'ADMIN';
}) {
    // Check if email already exists
    const existingUser = await usersRepo.findUserByEmail(data.email);
    if (existingUser) {
        throw new BadRequestError('Email already exists');
    }

    // Hash the password
    const passwordHash = await hashPassword(data.password);

    return usersRepo.createUser({
        ...data,
        password: passwordHash,
    });
}

/**
 * @description Updates a user's name and/or email.
 * @param {string} id - User's UUID
 * @param {Object} data - Fields to update (all optional)
 * @param {string} [data.fullName] - New full name
 * @param {string} [data.email] - New email (checked for uniqueness)
 * @returns {Promise<AdminUserDto>} Updated user
 * @throws {NotFoundError} When user doesn't exist
 * @throws {BadRequestError} When new email is already in use
 * @example
 * const user = await updateUser('user-uuid', { fullName: 'Updated Name' });
 */
export async function updateUser(
    id: string,
    data: { fullName?: string; email?: string }
) {
    // Check user exists
    const user = await usersRepo.findUserById(id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Check email uniqueness if changing email
    if (data.email && data.email.toLowerCase() !== user.email) {
        const existingUser = await usersRepo.findUserByEmail(data.email);
        if (existingUser) {
            throw new BadRequestError('Email already in use');
        }
    }

    return usersRepo.updateUser(id, data);
}

/**
 * @description Activates or deactivates a user account.
 * Deactivated users cannot log in or refresh tokens.
 * @param {string} id - User's UUID
 * @param {boolean} isActive - New active status (true=active, false=inactive)
 * @returns {Promise<AdminUserDto>} Updated user
 * @throws {NotFoundError} When user doesn't exist
 * @example
 * // Deactivate user
 * await updateUserStatus('user-uuid', false);
 */
export async function updateUserStatus(id: string, isActive: boolean) {
    const user = await usersRepo.findUserById(id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    return usersRepo.updateUserStatus(id, isActive);
}

/**
 * @description Resets a user's password (admin action).
 * Does NOT revoke existing refresh tokens.
 * @param {string} id - User's UUID
 * @param {string} newPassword - New plain text password (will be hashed)
 * @param {boolean} [requireChangeOnLogin=true] - Force password change on next login
 * @returns {Promise<void>}
 * @throws {NotFoundError} When user doesn't exist
 * @example
 * await resetUserPassword('user-uuid', 'TempPass123!', true);
 */
export async function resetUserPassword(
    id: string,
    newPassword: string,
    requireChangeOnLogin = true
) {
    const user = await usersRepo.findUserById(id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const passwordHash = await hashPassword(newPassword);
    await usersRepo.resetUserPassword(id, passwordHash, requireChangeOnLogin);
}
