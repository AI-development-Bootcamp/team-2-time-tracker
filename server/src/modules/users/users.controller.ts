/**
 * @fileoverview Users controller for admin user management
 * @module users/users.controller
 */

import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service';

/**
 * List all users with filtering and pagination
 */
export async function listUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100);
        const status = req.query.status as 'active' | 'inactive' | undefined;
        const role = req.query.role as 'EMPLOYEE' | 'ADMIN' | undefined;
        const query = req.query.query as string | undefined;

        const result = await usersService.listUsers({ page, pageSize, status, role, query });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get a single user by ID
 */
export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const user = await usersService.getUserById(id);

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new user
 */
export async function createUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { fullName, email, password, role } = req.body;
        const user = await usersService.createUser({ fullName, email, password, role });

        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update a user
 */
export async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { fullName, email } = req.body;
        const user = await usersService.updateUser(id, { fullName, email });

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update user status (activate/deactivate)
 */
export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { isActive } = req.body;
        const user = await usersService.updateUserStatus(id, isActive);

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Reset user password
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { newPassword, requireChangeOnLogin = true } = req.body;
        await usersService.resetUserPassword(id, newPassword, requireChangeOnLogin);

        res.json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        next(error);
    }
}
