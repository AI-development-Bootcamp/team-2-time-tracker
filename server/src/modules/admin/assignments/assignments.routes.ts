/**
 * @fileoverview Assignments routes for admin task assignment management
 * @module admin/assignments/assignments.routes
 */

import { Router } from 'express';
import * as assignmentsController from './assignments.controller';
import { authenticate, requireAdmin } from '../../../middlewares/auth.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { createTaskAssignmentSchema, bulkCreateTaskAssignmentsSchema } from '@shared/types';

const router: Router = Router();

/**
 * @swagger
 * /admin/assignments:
 *   get:
 *     summary: List all task assignments
 *     tags: [Admin - Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *         description: Filter by task ID
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         description: Search by user full name (case-insensitive, partial match)
 */
router.get('/', authenticate, requireAdmin, assignmentsController.listTaskAssignments);

/**
 * @swagger
 * /admin/assignments:
 *   post:
 *     summary: Create a new task assignment
 *     tags: [Admin - Assignments]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createTaskAssignmentSchema),
    assignmentsController.createTaskAssignment
);

/**
 * @swagger
 * /admin/assignments/bulk:
 *   post:
 *     summary: Create multiple task assignments (cartesian product)
 *     tags: [Admin - Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of task IDs
 *           example:
 *             userIds: ["user-uuid-1", "user-uuid-2"]
 *             taskIds: ["task-uuid-1", "task-uuid-2"]
 *     responses:
 *       201:
 *         description: Bulk assignments created successfully
 */
router.post(
    '/bulk',
    authenticate,
    requireAdmin,
    validate(bulkCreateTaskAssignmentsSchema),
    assignmentsController.bulkCreateTaskAssignments
);


/**
 * @swagger
 * /admin/assignments/{id}:
 *   get:
 *     summary: Get a task assignment by ID
 *     tags: [Admin - Assignments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, requireAdmin, assignmentsController.getTaskAssignment);

/**
 * @swagger
 * /admin/assignments/{id}:
 *   delete:
 *     summary: Delete a task assignment
 *     tags: [Admin - Assignments]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, requireAdmin, assignmentsController.deleteTaskAssignment);

export { router as assignmentsRouter };
