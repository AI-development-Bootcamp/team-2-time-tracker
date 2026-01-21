import { Router } from 'express';
import { selectorsController } from './selectors.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router: Router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /my/assignments:
 *   get:
 *     summary: Get user's task assignments
 *     tags: [Selectors]
 *     responses:
 *       200:
 *         description: List of task assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserAssignmentDto'
 *                     totalTasks:
 *                       type: integer
 */
router.get('/assignments', selectorsController.getUserAssignments);

/**
 * @swagger
 * /my/statistics/{month}:
 *   get:
 *     summary: Get user's monthly statistics
 *     tags: [Selectors]
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2024-03-01
 *         description: Month date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Monthly statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthlyStatisticsDto'
 */
router.get('/statistics/:month', selectorsController.getMonthlyStatistics);

export const myRouter = router;
