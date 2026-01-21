/**
 * @fileoverview Workday controller for handling HTTP requests
 * @module time-reports/workday.controller
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as workdayService from './workday.service';

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
 *     responses:
 *       200:
 *         description: Workday summary retrieved successfully
 */
export async function getWorkday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const date = req.params.date as string;

        const workday = await workdayService.getWorkday(userId, date);

        res.json({
            success: true,
            data: workday,
        });
    } catch (error) {
        next(error);
    }
}

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
 *     responses:
 *       200:
 *         description: Workday submitted successfully
 *       400:
 *         description: Validation error (month locked, timer running, not 540 minutes)
 */
export async function submitWorkday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const date = req.params.date as string;

        const result = await workdayService.submitWorkday(userId, date);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

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
 *     responses:
 *       200:
 *         description: Workday submission cancelled successfully
 *       400:
 *         description: Validation error (month locked, not submitted)
 */
export async function cancelWorkday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const date = req.params.date as string;

        const result = await workdayService.cancelWorkdaySubmission(userId, date);

        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
}

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
 *     responses:
 *       200:
 *         description: Monthly calendar retrieved successfully
 */
export async function getMonthlyCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const month = req.params.month as string;

        const calendar = await workdayService.getMonthlyCalendar(userId, month);

        res.json({
            success: true,
            data: calendar,
        });
    } catch (error) {
        next(error);
    }
}
