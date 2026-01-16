/**
 * @fileoverview Authentication controller handling HTTP requests
 * @module auth/auth.controller
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

/**
 * Handles user login
 * @param req - Express request with login credentials
 * @param res - Express response
 * @param next - Express next function
 */
export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password, rememberMe } = req.body;
        const result = await authService.login(email, password, rememberMe);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles token refresh
 * @param req - Express request with refresh token
 * @param res - Express response
 * @param next - Express next function
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshAccessToken(refreshToken);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles password change
 * @param req - Authenticated request with password data
 * @param res - Express response
 * @param next - Express next function
 */
export async function changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(req.user!.userId, currentPassword, newPassword);

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Returns current user profile
 * @param req - Authenticated request
 * @param res - Express response
 * @param next - Express next function
 */
export async function me(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const user = await authService.getCurrentUser(req.user!.userId);

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles user logout
 * @param req - Express request with refresh token
 * @param res - Express response
 * @param next - Express next function
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
}
