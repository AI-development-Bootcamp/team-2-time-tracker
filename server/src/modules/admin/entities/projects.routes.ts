/**
 * @fileoverview Projects routes for admin project management
 * @module admin/entities/projects.routes
 */

import { Router } from 'express';
import * as projectsController from './projects.controller';
import { authenticate, requireAdmin } from '../../../middlewares/auth.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import {
    createProjectSchema,
    updateProjectSchema,
    updateProjectStatusSchema,
    updateProjectReportTypeSchema,
} from './projects.schemas';

const router: Router = Router();

/**
 * @swagger
 * /admin/projects:
 *   get:
 *     summary: List all projects
 *     tags: [Admin - Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter projects by client ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter projects by user ID (returns projects where user is assigned via task assignments)
 */
router.get('/', authenticate, requireAdmin, projectsController.listProjects);

/**
 * @swagger
 * /admin/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Admin - Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createProjectSchema),
    projectsController.createProject
);

/**
 * @swagger
 * /admin/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Admin - Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, requireAdmin, projectsController.getProject);

/**
 * @swagger
 * /admin/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Admin - Projects]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateProjectSchema),
    projectsController.updateProject
);

/**
 * @swagger
 * /admin/projects/{id}/status:
 *   put:
 *     summary: Update project status
 *     tags: [Admin - Projects]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id/status',
    authenticate,
    requireAdmin,
    validate(updateProjectStatusSchema),
    projectsController.updateProjectStatus
);

/**
 * @swagger
 * /admin/projects/{id}/report-type:
 *   put:
 *     summary: Update project report type
 *     tags: [Admin - Projects]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id/report-type',
    authenticate,
    requireAdmin,
    validate(updateProjectReportTypeSchema),
    projectsController.updateProjectReportType
);

/**
 * @swagger
 * /admin/projects/{id}/users:
 *   get:
 *     summary: Get all users assigned to a project
 *     tags: [Admin - Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 */
router.get('/:id/users', authenticate, requireAdmin, projectsController.getProjectUsers);

export { router as projectsRouter };
