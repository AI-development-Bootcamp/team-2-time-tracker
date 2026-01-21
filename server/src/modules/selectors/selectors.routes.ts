import { Router } from 'express';
import { selectorsController } from './selectors.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router: Router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /selectors/clients:
 *   get:
 *     summary: Get clients list
 *     tags: [Selectors]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [alpha, frequency]
 *         description: Sort order (default alpha)
 *     responses:
 *       200:
 *         description: List of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClientSelectorDto'
 */
router.get('/clients', selectorsController.getClients);

/**
 * @swagger
 * /selectors/projects:
 *   get:
 *     summary: Get projects list
 *     tags: [Selectors]
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by client ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [alpha, frequency]
 *         description: Sort order (default alpha)
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectSelectorDto'
 */
router.get('/projects', selectorsController.getProjects);

/**
 * @swagger
 * /selectors/tasks:
 *   get:
 *     summary: Get tasks list
 *     tags: [Selectors]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by project ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [alpha, frequency]
 *         description: Sort order (default alpha)
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskSelectorDto'
 */
router.get('/tasks', selectorsController.getTasks);

export const selectorsRouter = router;
