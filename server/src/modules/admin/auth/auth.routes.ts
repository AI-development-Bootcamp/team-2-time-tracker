/**
 * @fileoverview Admin authentication routes
 * @module admin/auth/auth.routes
 */

import { Router } from 'express';
import * as adminAuthController from './auth.controller';
import { authenticate, requireAdmin } from '../../../middlewares/auth.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { loginSchema, refreshTokenSchema, logoutSchema } from '../../auth/auth.schemas';

const router: Router = Router();

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Authenticate admin user
 *     description: Login endpoint for admin users only. Non-admin users will be rejected.
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: User is not an admin
 */
router.post('/login', validate(loginSchema), adminAuthController.login);

/**
 * @swagger
 * /admin/auth/refresh:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', validate(refreshTokenSchema), adminAuthController.refresh);

/**
 * @swagger
 * /admin/auth/me:
 *   get:
 *     summary: Get current admin user profile
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not an admin
 */
router.get('/me', authenticate, requireAdmin, adminAuthController.me);

/**
 * @swagger
 * /admin/auth/logout:
 *   post:
 *     summary: Logout admin user
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authenticate, requireAdmin, validate(logoutSchema), adminAuthController.logout);

export { router as adminAuthRouter };
