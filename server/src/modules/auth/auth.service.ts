/**
 * @fileoverview Authentication service with JWT and bcrypt
 * @module auth/auth.service
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { jwtConfig } from '../../config/jwt';
import { UnauthorizedError, BadRequestError } from '../../shared/errors';
import * as authRepo from './auth.repo';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REMEMBER_ME_EXPIRY_DAYS = 30;

interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * @description Validates user credentials and generates access/refresh tokens for authentication.
 * Checks email/password, verifies account is active, and returns tokens with user info.
 * @param {string} email - User's email address (case-insensitive lookup)
 * @param {string} password - User's password to verify against stored hash
 * @param {boolean} [rememberMe=false] - If true, extends refresh token to 30 days (default: 7 days)
 * @returns {Promise<LoginResponse>} Object containing tokens, expiry, user info, and mustChangePassword flag
 * @throws {UnauthorizedError} When email not found, password incorrect, or account deactivated
 * @example
 * const result = await login('user@example.com', process.env.DEFAULT_SEED_PASSWORD!, true);
 * // { token: 'eyJ...', refreshToken: 'abc...', expiresIn: 7200, user: {...}, mustChangePassword: false }
 */
export async function login(email: string, password: string, rememberMe = false) {
    const user = await authRepo.findUserByEmail(email);

    if (!user) {
        throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
        throw new UnauthorizedError('Account is deactivated');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await generateTokens(user.id, user.email, user.role, rememberMe);

    return {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: jwtConfig.expiresInSeconds,
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
        mustChangePassword: user.mustChangePassword,
    };
}

/**
 * @description Generates a new access token using a valid refresh token.
 * Validates the refresh token exists, is not expired/revoked, and user is active.
 * @param {string} refreshToken - The refresh token obtained from login
 * @returns {Promise<{token: string, expiresIn: number}>} New access token and expiry in seconds
 * @throws {UnauthorizedError} When refresh token is invalid/expired or user is deactivated
 * @example
 * const { token } = await refreshAccessToken('dGhpcyBpcyBhIHJlZnJlc2g...');
 */
export async function refreshAccessToken(refreshToken: string) {
    const storedToken = await authRepo.findRefreshToken(refreshToken);

    if (!storedToken) {
        throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const { user } = storedToken;

    if (!user.isActive) {
        throw new UnauthorizedError('Account is deactivated');
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role);

    return {
        token: accessToken,
        expiresIn: jwtConfig.expiresInSeconds,
    };
}

/**
 * @description Changes a user's password after verifying their current password.
 * Also revokes all refresh tokens, forcing re-login on all devices.
 * @param {string} userId - User's UUID
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password to set (should meet complexity requirements)
 * @returns {Promise<void>}
 * @throws {UnauthorizedError} When user not found
 * @throws {BadRequestError} When current password is incorrect
 * @example
 * await changePassword('user-uuid', 'OldPass123!', 'NewPass456!');
 */
export async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
) {
    const user = await authRepo.findUserById(userId);

    if (!user) {
        throw new UnauthorizedError('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
        throw new BadRequestError('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await authRepo.updateUserPassword(userId, newPasswordHash);

    // Revoke all refresh tokens on password change
    await authRepo.revokeAllUserRefreshTokens(userId);
}

/**
 * @description Logs out a user by revoking their refresh token.
 * The refresh token is marked as revoked in the database.
 * @param {string} refreshToken - The refresh token to revoke
 * @returns {Promise<void>}
 * @example
 * await logout('dGhpcyBpcyBhIHJlZnJlc2g...');
 */
export async function logout(refreshToken: string) {
    await authRepo.revokeRefreshToken(refreshToken);
}

/**
 * @description Retrieves the current user's profile information.
 * @param {string} userId - User's UUID
 * @returns {Promise<UserProfile>} User profile with id, fullName, email, role, isActive
 * @throws {UnauthorizedError} When user not found
 * @example
 * const user = await getCurrentUser('user-uuid');
 * // { id: '...', fullName: 'John Doe', email: 'john@example.com', role: 'EMPLOYEE', isActive: true }
 */
export async function getCurrentUser(userId: string) {
    const user = await authRepo.findUserById(userId);

    if (!user) {
        throw new UnauthorizedError('User not found');
    }

    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
    };
}

/**
 * Generates access and refresh tokens
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @param rememberMe - Extend refresh token expiry
 * @returns Access token and refresh token
 */
async function generateTokens(
    userId: string,
    email: string,
    role: string,
    rememberMe: boolean
) {
    const accessToken = generateAccessToken(userId, email, role);
    const refreshToken = randomBytes(40).toString('hex');
    const expiryDays = rememberMe ? REMEMBER_ME_EXPIRY_DAYS : REFRESH_TOKEN_EXPIRY_DAYS;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    await authRepo.createRefreshToken(userId, refreshToken, expiresAt);

    return { accessToken, refreshToken };
}

/**
 * Generates a JWT access token
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @returns JWT access token
 */
function generateAccessToken(userId: string, email: string, role: string): string {
    const payload: TokenPayload = { userId, email, role };
    return jwt.sign(payload, jwtConfig.secret as jwt.Secret, {
        expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn'],
    });
}

/**
 * @description Verifies a JWT access token and returns the decoded payload.
 * @param {string} token - JWT access token to verify
 * @returns {TokenPayload} Decoded payload with userId, email, role
 * @throws {UnauthorizedError} When token is invalid or expired
 * @example
 * const payload = verifyAccessToken('eyJhbGci...');
 * // { userId: '...', email: 'user@example.com', role: 'EMPLOYEE' }
 */
export function verifyAccessToken(token: string): TokenPayload {
    try {
        return jwt.verify(token, jwtConfig.secret as jwt.Secret) as TokenPayload;
    } catch {
        throw new UnauthorizedError('Invalid or expired token');
    }
}

/**
 * @description Hashes a password using bcrypt with 12 rounds.
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Bcrypt hash of the password
 * @example
 * const hash = await hashPassword(process.env.DEFAULT_SEED_PASSWORD!);
 * // '$2b$12$...' (bcrypt hash)
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}
