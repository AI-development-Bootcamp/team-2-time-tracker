/**
 * @fileoverview Time Reports routes
 * @module time-reports/timeReports.routes
 */

import { Router } from 'express';
import * as timeReportsController from './timeReports.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
    createTimeEntrySchema,
    updateTimeEntrySchema,
    batchCreateTimeEntriesSchema,
} from './timeReports.schemas';

const router: Router = Router();

/**
 * @swagger
 * /time-entries:
 *   post:
 *     summary: Create a new time entry
 *     tags: [Time Entries]
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
 *               - startTime
 *               - endTime
 *               - location
 *               - taskId
 *               - description
 *             properties:
 *               workDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-15"
 *               startTime:
 *                 type: string
 *                 pattern: '^[0-2][0-9]:[0-5][0-9]$'
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 pattern: '^[0-2][0-9]:[0-5][0-9]$'
 *                 example: "10:30"
 *               location:
 *                 type: string
 *                 enum: [OFFICE, CLIENT, HOME]
 *               taskId:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Time entry created successfully
 *       400:
 *         description: Timer running or validation error
 */
router.post(
    '/',
    authenticate,
    validate(createTimeEntrySchema),
    timeReportsController.create
);

/**
 * @swagger
 * /time-entries/history:
 *   get:
 *     summary: Get paginated time entry history with filters
 *     tags: [Time Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *           enum: [OFFICE, CLIENT, HOME]
 *       - in: query
 *         name: submittedOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: History retrieved successfully
 */
router.get('/history', authenticate, timeReportsController.getHistory);

/**
 * @swagger
 * /time-entries/:id:
 *   get:
 *     summary: Get a single time entry by ID
 *     tags: [Time Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Time entry retrieved successfully
 *       404:
 *         description: Time entry not found
 */
router.get('/:id', authenticate, timeReportsController.getById);

/**
 * @swagger
 * /time-entries/:id:
 *   put:
 *     summary: Update a time entry
 *     tags: [Time Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               location:
 *                 type: string
 *               taskId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Time entry updated successfully
 *       404:
 *         description: Time entry not found
 */
router.put(
    '/:id',
    authenticate,
    validate(updateTimeEntrySchema),
    timeReportsController.update
);

/**
 * @swagger
 * /time-entries/:id:
 *   delete:
 *     summary: Soft delete a time entry
 *     tags: [Time Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Time entry deleted successfully
 *       404:
 *         description: Time entry not found
 */
router.delete('/:id', authenticate, timeReportsController.deleteEntry);

/**
 * @swagger
 * /time-entries/batch:
 *   post:
 *     summary: Create multiple time entries (batch)
 *     tags: [Time Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entries
 *             properties:
 *               entries:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Batch created successfully
 *       400:
 *         description: Validation error
 */
router.post(
    '/batch',
    authenticate,
    validate(batchCreateTimeEntriesSchema),
    timeReportsController.batchCreate
);

export { router as timeReportsRouter };
