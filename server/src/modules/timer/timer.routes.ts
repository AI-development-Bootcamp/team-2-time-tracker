/**
 * @fileoverview Timer routes
 * @module timer/timer.routes
 */

import { Router } from 'express';
import * as timerController from './timer.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { startTimerSchema, stopTimerSchema } from './timer.schemas';

const router: Router = Router();

/**
 * @swagger
 * /timer/start:
 *   post:
 *     summary: Start a timer for the current day
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workDate
 *             properties:
 *               workDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-17"
 *     responses:
 *       201:
 *         description: Timer started successfully
 *       400:
 *         description: Timer already running or month locked
 */
router.post('/start', authenticate, validate(startTimerSchema), timerController.start);

/**
 * @swagger
 * /timer/stop:
 *   post:
 *     summary: Stop the running timer and create a time entry
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - location
 *               - description
 *             properties:
 *               taskId:
 *                 type: string
 *                 format: uuid
 *               location:
 *                 type: string
 *                 enum: [OFFICE, CLIENT, HOME]
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Timer stopped and time entry created
 *       404:
 *         description: No running timer found
 */
router.post('/stop', authenticate, validate(stopTimerSchema), timerController.stop);

/**
 * @swagger
 * /timer/status:
 *   get:
 *     summary: Get current timer status
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Timer status returned
 */
router.get('/status', authenticate, timerController.getStatus);

/**
 * @swagger
 * /timer/cancel:
 *   delete:
 *     summary: Cancel the running timer without saving
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Timer cancelled
 *       404:
 *         description: No running timer found
 */
router.delete('/cancel', authenticate, timerController.cancel);

export { router as timerRouter };
