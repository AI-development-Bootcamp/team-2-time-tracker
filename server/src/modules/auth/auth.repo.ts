/**
 * @fileoverview Authentication repository for database operations
 * @module auth/auth.repo
 */

import { prisma } from '../../db';

/**
 * Find a user by their email address
 * @param email - The email address to search for
 * @returns The user if found, null otherwise
 */
export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
}

/**
 * Find a user by their ID
 * @param id - The user ID
 * @returns The user if found, null otherwise
 */
export async function findUserById(id: string) {
    return prisma.user.findUnique({
        where: { id },
    });
}

/**
 * Update user password hash
 * @param userId - The user ID
 * @param passwordHash - The new password hash
 * @returns The updated user
 */
export async function updateUserPassword(userId: string, passwordHash: string) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            password: passwordHash,
            mustChangePassword: false,
        },
    });
}

/**
 * Create a refresh token record
 * @param userId - The user ID
 * @param token - The refresh token
 * @param expiresAt - Token expiration date
 * @returns The created refresh token record
 */
export async function createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
) {
    return prisma.refreshToken.create({
        data: {
            userId,
            token,
            expiresAt,
        },
    });
}

/**
 * Find a valid refresh token
 * @param token - The refresh token to find
 * @returns The refresh token if found and not revoked, null otherwise
 */
export async function findRefreshToken(token: string) {
    return prisma.refreshToken.findFirst({
        where: {
            token,
            revokedAt: null,
            expiresAt: { gt: new Date() },
        },
        include: { user: true },
    });
}

/**
 * Revoke a refresh token (add to blacklist)
 * @param token - The refresh token to revoke
 */
export async function revokeRefreshToken(token: string) {
    return prisma.refreshToken.updateMany({
        where: { token },
        data: { revokedAt: new Date() },
    });
}

/**
 * Revoke all refresh tokens for a user
 * @param userId - The user ID
 */
export async function revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}
