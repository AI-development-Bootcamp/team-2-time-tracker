/**
 * @fileoverview Tasks routes for admin task management
 * @module admin/entities/tasks.routes
 */

import { Router } from 'express';
import * as tasksController from './tasks.controller';
import { authenticate, requireAdmin } from '../../../middlewares/auth.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from './tasks.schemas';

const router: Router = Router();

/**
 * @swagger
 * /admin/tasks:
 *   get:
 *     summary: List all tasks
 *     tags: [Admin - Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter tasks by project ID
 */
router.get('/', authenticate, requireAdmin, tasksController.listTasks);

/**
 * @swagger
 * /admin/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Admin - Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, requireAdmin, validate(createTaskSchema), tasksController.createTask);

/**
 * @swagger
 * /admin/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Admin - Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, requireAdmin, tasksController.getTask);

/**
 * @swagger
 * /admin/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Admin - Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, requireAdmin, validate(updateTaskSchema), tasksController.updateTask);

/**
 * @swagger
 * /admin/tasks/{id}/status:
 *   put:
 *     summary: Update task status
 *     tags: [Admin - Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id/status',
    authenticate,
    requireAdmin,
    validate(updateTaskStatusSchema),
    tasksController.updateTaskStatus
);

export { router as tasksRouter };
