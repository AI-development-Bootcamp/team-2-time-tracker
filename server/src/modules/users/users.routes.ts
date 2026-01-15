/**
 * @fileoverview Users routes for admin user management
 * @module users/users.routes
 */

import { Router } from 'express';
import * as usersController from './users.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
    createUserSchema,
    updateUserSchema,
    updateUserStatusSchema,
    resetPasswordSchema,
} from './users.schemas';

const router: Router = Router();

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, requireAdmin, usersController.listUsers);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createUserSchema),
    usersController.createUser
);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, requireAdmin, usersController.getUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateUserSchema),
    usersController.updateUser
);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id/status',
    authenticate,
    requireAdmin,
    validate(updateUserStatusSchema),
    usersController.updateUserStatus
);

/**
 * @swagger
 * /admin/users/{id}/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/:id/reset-password',
    authenticate,
    requireAdmin,
    validate(resetPasswordSchema),
    usersController.resetPassword
);

export { router as usersRouter };
