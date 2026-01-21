/**
 * @fileoverview Workday routes for daily summary management
 * @module time-reports/workday.routes
 */

import { Router } from 'express';
import * as workdayController from './workday.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { dateParamSchema, monthParamSchema } from './timeReports.schemas';

const router: Router = Router();

/**
 * @swagger
 * /workday/calendar/{month}:
 *   get:
 *     summary: Get monthly calendar view with daily status indicators
 *     tags: [Workday]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *         description: Month in YYYY-MM format
 *         example: "2026-01"
 *     responses:
 *       200:
 *         description: Monthly calendar retrieved successfully
 */
router.get(
    '/calendar/:month',
    authenticate,
    validate(monthParamSchema, 'params'),
    workdayController.getMonthlyCalendar
);

/**
 * @swagger
 * /workday/{date}:
 *   get:
 *     summary: Get workday summary for a specific date
 *     tags: [Workday]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *         example: "2026-01-15"
 *     responses:
 *       200:
 *         description: Workday summary retrieved successfully
 */
router.get(
    '/:date',
    authenticate,
    validate(dateParamSchema, 'params'),
    workdayController.getWorkday
);

/**
 * @swagger
 * /workday/{date}/submit:
 *   post:
 *     summary: Submit workday for approval
 *     tags: [Workday]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *         example: "2026-01-15"
 *     responses:
 *       200:
 *         description: Workday submitted successfully
 *       400:
 *         description: Validation error (month locked, timer running, not 540 minutes)
 */
router.post(
    '/:date/submit',
    authenticate,
    validate(dateParamSchema, 'params'),
    workdayController.submitWorkday
);

/**
 * @swagger
 * /workday/{date}/cancel:
 *   post:
 *     summary: Cancel workday submission
 *     tags: [Workday]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *         example: "2026-01-15"
 *     responses:
 *       200:
 *         description: Workday submission cancelled successfully
 *       400:
 *         description: Validation error (month locked, not submitted)
 */
router.post(
    '/:date/cancel',
    authenticate,
    validate(dateParamSchema, 'params'),
    workdayController.cancelWorkday
);

export { router as workdayRouter };
