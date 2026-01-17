/**
 * @fileoverview Authentication middleware for JWT validation and role checking
 * @module middlewares/auth.middleware
 */

import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../shared/errors';
import { verifyAccessToken } from '../modules/auth/auth.service';
import * as authRepo from '../modules/auth/auth.repo';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

/**
 * @description Middleware to authenticate requests using JWT access tokens.
 * Extracts token from Authorization header, validates it, and verifies user is active.
 * Attaches user payload to req.user on success.
 * @param {AuthenticatedRequest} req - Express request with optional user property
 * @param {Response} _res - Express response (unused)
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 * @throws {UnauthorizedError} When no token provided, token invalid, or user inactive
 * @example
 * // Usage in routes
 * router.get('/profile', authenticate, controller.getProfile);
 */
export async function authenticate(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);

        // Verify user still exists and is active
        const user = await authRepo.findUserById(payload.userId);
        if (!user || !user.isActive) {
            throw new UnauthorizedError('User account is not active');
        }

        req.user = payload;
        next();
    } catch (error) {
        next(error);
    }
}

/**
 * @description Middleware factory that creates role-based access control middleware.
 * Must be used after authenticate middleware.
 * @param {string} requiredRole - The role required to access the route ('ADMIN' or 'EMPLOYEE')
 * @returns {Function} Express middleware function
 * @throws {UnauthorizedError} When user is not authenticated
 * @throws {ForbiddenError} When user's role doesn't match required role
 * @example
 * // Require admin role
 * router.get('/admin/stats', authenticate, requireRole('ADMIN'), controller.getStats);
 */
export function requireRole(requiredRole: string) {
    return (
        req: AuthenticatedRequest,
        _res: Response,
        next: NextFunction
    ): void => {
        if (!req.user) {
            next(new UnauthorizedError('Authentication required'));
            return;
        }

        if (req.user.role !== requiredRole) {
            next(new ForbiddenError('Insufficient permissions'));
            return;
        }

        next();
    };
}

/**
 * @description Pre-configured middleware that requires ADMIN role.
 * Shorthand for requireRole('ADMIN').
 * @example
 * router.get('/admin/users', authenticate, requireAdmin, usersController.list);
 */
export const requireAdmin = requireRole('ADMIN');
