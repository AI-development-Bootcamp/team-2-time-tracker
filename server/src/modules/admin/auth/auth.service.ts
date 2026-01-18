/**
 * @fileoverview Admin authentication service
 * @module admin/auth/auth.service
 *
 * Wraps the existing auth service and enforces ADMIN role restriction.
 */

import * as authService from '../../auth/auth.service';
import { findUserByEmail } from '../../users/users.repo';
import { ForbiddenError, UnauthorizedError } from '../../../shared/errors';

const ADMIN_ROLE = 'ADMIN';

/**
 * @description Authenticates an admin user. Validates role BEFORE issuing tokens
 * to prevent orphaned tokens for non-admin users.
 * @param {string} email - Admin's email address
 * @param {string} password - Admin's password
 * @param {boolean} [rememberMe=false] - Extend refresh token expiry
 * @returns {Promise<LoginResponse>} Login response with tokens and user info
 * @throws {UnauthorizedError} When credentials are invalid or user not found
 * @throws {ForbiddenError} When user is not an ADMIN
 * @example
 * const result = await adminLogin('admin@example.com', 'Password123!');
 */
export async function adminLogin(email: string, password: string, rememberMe = false) {
    // Validate role BEFORE calling authService.login to prevent token creation for non-admins
    const user = await findUserByEmail(email);

    if (!user) {
        throw new UnauthorizedError('Invalid credentials');
    }

    if (user.role !== ADMIN_ROLE) {
        throw new ForbiddenError('Access denied. Admin privileges required.');
    }

    // Now that role is validated, proceed with login (which validates password)
    const result = await authService.login(email, password, rememberMe);

    return result;
}

/**
 * @description Refreshes an access token using a refresh token.
 * Delegates to existing auth service.
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<{token: string, expiresIn: number}>} New access token
 * @throws {UnauthorizedError} When refresh token is invalid
 */
export async function refreshAccessToken(refreshToken: string) {
    return authService.refreshAccessToken(refreshToken);
}

/**
 * @description Gets the current admin user's profile.
 * Delegates to existing auth service.
 * @param {string} userId - Admin user's ID
 * @returns {Promise<UserProfile>} User profile data
 * @throws {UnauthorizedError} When user not found
 */
export async function getCurrentUser(userId: string) {
    return authService.getCurrentUser(userId);
}

/**
 * @description Logs out an admin user by revoking the refresh token.
 * Delegates to existing auth service.
 * @param {string} refreshToken - The refresh token to revoke
 * @returns {Promise<void>}
 */
export async function logout(refreshToken: string) {
    return authService.logout(refreshToken);
}
