/**
 * @fileoverview Admin authentication controller
 * @module admin/auth/auth.controller
 */

import { Request, Response, NextFunction } from 'express';
import * as adminAuthService from './auth.service';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware';

/**
 * @description Handles admin login requests. Only ADMIN users can authenticate.
 * @param {Request} req - Express request with login credentials
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password, rememberMe } = req.body;
        const result = await adminAuthService.adminLogin(email, password, rememberMe);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @description Handles token refresh for admin users.
 * @param {Request} req - Express request with refresh token
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { refreshToken } = req.body;
        const result = await adminAuthService.refreshAccessToken(refreshToken);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @description Returns current admin user's profile.
 * @param {AuthenticatedRequest} req - Authenticated request
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export async function me(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = await adminAuthService.getCurrentUser(req.user!.userId);

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @description Handles admin logout.
 * @param {Request} req - Express request with refresh token
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { refreshToken } = req.body;
        await adminAuthService.logout(refreshToken);

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
}
