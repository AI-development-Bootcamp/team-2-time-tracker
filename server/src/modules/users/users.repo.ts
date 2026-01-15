/**
 * @fileoverview Users repository for admin user management
 * @module users/users.repo
 */

import { prisma } from '../../db';

interface ListUsersParams {
    page: number;
    pageSize: number;
    status?: 'active' | 'inactive';
    role?: 'EMPLOYEE' | 'ADMIN';
    query?: string;
}

/**
 * Find all users with filtering and pagination
 * @param params - Filter and pagination parameters
 * @returns Users list with pagination info
 */
export async function findAllUsers(params: ListUsersParams) {
    const { page, pageSize, status, role, query } = params;
    const skip = (page - 1) * pageSize;

    const where: {
        isActive?: boolean;
        role?: 'EMPLOYEE' | 'ADMIN';
        OR?: Array<{ fullName?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>;
    } = {};

    if (status === 'active') {
        where.isActive = true;
    } else if (status === 'inactive') {
        where.isActive = false;
    }

    if (role) {
        where.role = role;
    }

    if (query) {
        where.OR = [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                mustChangePassword: true,
                createdAt: true,
                updatedAt: true,
            },
        }),
        prisma.user.count({ where }),
    ]);

    return { users, total };
}

/**
 * Find a user by ID
 * @param id - User ID
 * @returns User or null
 */
export async function findUserById(id: string) {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

/**
 * Find a user by email
 * @param email - User email
 * @returns User or null
 */
export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
}

/**
 * Create a new user
 * @param data - User creation data
 * @returns Created user
 */
export async function createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: 'EMPLOYEE' | 'ADMIN';
}) {
    return prisma.user.create({
        data: {
            email: data.email.toLowerCase(),
            password: data.password,
            fullName: data.fullName,
            role: data.role,
            mustChangePassword: true,
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

/**
 * Update a user
 * @param id - User ID
 * @param data - Update data
 * @returns Updated user
 */
export async function updateUser(
    id: string,
    data: { fullName?: string; email?: string }
) {
    const updateData: { fullName?: string; email?: string } = {};
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.email) updateData.email = data.email.toLowerCase();

    return prisma.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

/**
 * Update user status (active/inactive)
 * @param id - User ID
 * @param isActive - New active status
 * @returns Updated user
 */
export async function updateUserStatus(id: string, isActive: boolean) {
    return prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

/**
 * Reset user password
 * @param id - User ID
 * @param passwordHash - New password hash
 * @param requireChange - Require password change on login
 * @returns Updated user
 */
export async function resetUserPassword(
    id: string,
    passwordHash: string,
    requireChange: boolean
) {
    return prisma.user.update({
        where: { id },
        data: {
            password: passwordHash,
            mustChangePassword: requireChange,
        },
    });
}
