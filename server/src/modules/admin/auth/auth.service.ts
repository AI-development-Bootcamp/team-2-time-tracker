/**
 * @fileoverview Admin authentication service
 * @module admin/auth/auth.service
 *
 * Wraps the existing auth service and enforces ADMIN role restriction.
 */

import * as authService from '../../auth/auth.service';
import { ForbiddenError } from '../../../shared/errors';

const ADMIN_ROLE = 'ADMIN';

/**
 * @description Authenticates an admin user. Uses the existing auth service login
 * and rejects non-ADMIN users.
 * @param {string} email - Admin's email address
 * @param {string} password - Admin's password
 * @param {boolean} [rememberMe=false] - Extend refresh token expiry
 * @returns {Promise<LoginResponse>} Login response with tokens and user info
 * @throws {UnauthorizedError} When credentials are invalid
 * @throws {ForbiddenError} When user is not an ADMIN
 * @example
 * const result = await adminLogin('admin@example.com', 'Password123!');
 */
export async function adminLogin(email: string, password: string, rememberMe = false) {
    const result = await authService.login(email, password, rememberMe);

    if (result.user.role !== ADMIN_ROLE) {
        throw new ForbiddenError('Access denied. Admin privileges required.');
    }

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
