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
 *     description: Retrieves a list of all task assignments with optional filtering by userId, taskId, projectId, or userName. Returns enriched data including user details (name, email) and full task hierarchy (task → project → client).
 *     tags: [Admin - Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter assignments by user ID
 *         example: e5f6a7b8-c9d0-1234-ef01-34567890abcd
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter assignments by task ID
 *         example: c3d4e5f6-a7b8-9012-cdef-123456789012
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter assignments by project ID (returns all task assignments within the project)
 *         example: b2c3d4e5-f6a7-8901-bcde-f12345678901
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         description: Search assignments by user full name (case-insensitive, partial match)
 *         example: John
 *     responses:
 *       200:
 *         description: Task assignments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListTaskAssignmentsResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, requireAdmin, assignmentsController.listTaskAssignments);

/**
 * @swagger
 * /admin/assignments:
 *   post:
 *     summary: Create a new task assignment
 *     description: Assigns a single user to a single task. The operation is idempotent - if the assignment already exists, it returns a validation error with code VALIDATION_DUPLICATE_ASSIGNMENT.
 *     tags: [Admin - Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskAssignmentRequest'
 *     responses:
 *       201:
 *         description: Task assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskAssignmentResponse'
 *       400:
 *         description: Invalid request - User or task not found, or duplicate assignment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               userNotFound:
 *                 value:
 *                   success: false
 *                   error:
 *                     code: VALIDATION_USER_NOT_FOUND
 *                     message: User not found
 *               taskNotFound:
 *                 value:
 *                   success: false
 *                   error:
 *                     code: VALIDATION_TASK_NOT_FOUND
 *                     message: Task not found
 *               duplicateAssignment:
 *                 value:
 *                   success: false
 *                   error:
 *                     code: VALIDATION_DUPLICATE_ASSIGNMENT
 *                     message: Task assignment already exists for this user and task
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *     summary: Create multiple task assignments using cartesian product
 *     description: |
 *       Creates assignments for all combinations of provided userIds and taskIds using cartesian product logic.
 *       For example: 2 users × 3 tasks = 6 assignments.
 *       
 *       **Cartesian Product Logic:**
 *       Given userIds [U1, U2] and taskIds [T1, T2, T3], the following assignments are created:
 *       - U1 → T1
 *       - U1 → T2
 *       - U1 → T3
 *       - U2 → T1
 *       - U2 → T2
 *       - U2 → T3
 *       
 *       **Duplicate Handling:**
 *       The operation is idempotent - existing assignments are skipped without error. Only newly created assignments are returned in the response.
 *     tags: [Admin - Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkCreateTaskAssignmentsRequest'
 *     responses:
 *       201:
 *         description: Bulk assignments created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkCreateTaskAssignmentsResponse'
 *             example:
 *               success: true
 *               data:
 *                 created:
 *                   - id: d4e5f6a7-b8c9-0123-defg-234567890123
 *                     userId: e5f6a7b8-c9d0-1234-ef01-34567890abcd
 *                     taskId: c3d4e5f6-a7b8-9012-cdef-123456789012
 *                     userName: John Doe
 *                     userEmail: john.doe@example.com
 *                     taskName: Design Homepage
 *                     projectId: b2c3d4e5-f6a7-8901-bcde-f12345678901
 *                     projectName: Website Redesign
 *                     clientId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                     clientName: Acme Corporation
 *                     createdAt: '2026-01-20T10:00:00.000Z'
 *                   - id: e5f6a7b8-c9d0-1234-ef01-34567890bcde
 *                     userId: e5f6a7b8-c9d0-1234-ef01-34567890abcd
 *                     taskId: d4e5f6a7-b8c9-0123-defg-234567890123
 *                     userName: John Doe
 *                     userEmail: john.doe@example.com
 *                     taskName: Implement Backend
 *                     projectId: b2c3d4e5-f6a7-8901-bcde-f12345678901
 *                     projectName: Website Redesign
 *                     clientId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                     clientName: Acme Corporation
 *                     createdAt: '2026-01-20T10:00:00.000Z'
 *                 count: 2
 *       400:
 *         description: Invalid request - Empty arrays or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *     summary: Get a single task assignment by ID
 *     description: Retrieves detailed information about a specific task assignment including user details and full task hierarchy (task → project → client).
 *     tags: [Admin - Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *         example: d4e5f6a7-b8c9-0123-defg-234567890123
 *     responses:
 *       200:
 *         description: Task assignment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskAssignmentResponse'
 *       404:
 *         description: Task assignment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticate, requireAdmin, assignmentsController.getTaskAssignment);

/**
 * @swagger
 * /admin/assignments/{id}:
 *   delete:
 *     summary: Delete a task assignment
 *     description: |
 *       Removes a task assignment. This operation will fail if the assignment has associated time entries.
 *       
 *       **Important:** To prevent data integrity issues, assignments with existing time entries cannot be deleted.
 *       The user must first delete all time entries associated with this assignment.
 *     tags: [Admin - Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *         example: d4e5f6a7-b8c9-0123-defg-234567890123
 *     responses:
 *       200:
 *         description: Task assignment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentDeleteResponse'
 *       400:
 *         description: Cannot delete assignment with existing time entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentWithTimeEntriesError'
 *       404:
 *         description: Task assignment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticate, requireAdmin, assignmentsController.deleteTaskAssignment);

export { router as assignmentsRouter };
