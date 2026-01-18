/**
 * @fileoverview Routes for absence management
 * @module absences/absences.routes
 */

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import * as absencesController from './absences.controller';
import * as absencesDocuments from './absences.documents';
import * as absencesSchemas from './absences.schemas';

const router: Router = Router();

/**
 * @swagger
 * /absences:
 *   post:
 *     summary: Create new absence request
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - startDate
 *               - endDate
 *               - isHalfDay
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [VACATION, SICK, RESERVES, OTHER]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               isHalfDay:
 *                 type: boolean
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Absence created successfully
 *       400:
 *         description: Invalid input or overlapping absence
 */
router.post(
    '/',
    authenticate,
    validate(absencesSchemas.createAbsenceSchema),
    absencesController.createAbsence
);

/**
 * @swagger
 * /absences:
 *   get:
 *     summary: List user's absences with pagination
 *     tags: [Absences]
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
 *     responses:
 *       200:
 *         description: List of absences
 */
router.get(
    '/',
    authenticate,
    validate(absencesSchemas.listAbsencesSchema, 'query'),
    absencesController.listAbsences
);

/**
 * @swagger
 * /absences/{id}:
 *   get:
 *     summary: Get single absence by ID
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Absence details
 *       404:
 *         description: Absence not found
 */
router.get(
    '/:id',
    authenticate,
    validate(absencesSchemas.getAbsenceByIdSchema, 'params'),
    absencesController.getAbsenceById
);

/**
 * @swagger
 * /absences/{id}:
 *   put:
 *     summary: Update absence request
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [VACATION, SICK, RESERVES, OTHER]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               isHalfDay:
 *                 type: boolean
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Absence updated successfully
 *       404:
 *         description: Absence not found
 */
router.put(
    '/:id',
    authenticate,
    validate(absencesSchemas.getAbsenceByIdSchema, 'params'),
    validate(absencesSchemas.updateAbsenceSchema),
    absencesController.updateAbsence
);

/**
 * @swagger
 * /absences/{id}:
 *   delete:
 *     summary: Delete absence request
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Absence deleted successfully
 *       404:
 *         description: Absence not found
 */
router.delete(
    '/:id',
    authenticate,
    validate(absencesSchemas.getAbsenceByIdSchema, 'params'),
    absencesController.deleteAbsence
);

// Document Management Routes

/**
 * @swagger
 * /absences/{id}/documents:
 *   post:
 *     summary: Upload document for absence request
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 */
router.post(
    '/:id/documents',
    authenticate,
    validate(absencesSchemas.getAbsenceByIdSchema, 'params'),
    absencesDocuments.uploadMiddleware,
    absencesDocuments.uploadDocument
);

/**
 * @swagger
 * /absences/{id}/documents:
 *   get:
 *     summary: List documents for absence request
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get(
    '/:id/documents',
    authenticate,
    validate(absencesSchemas.getAbsenceByIdSchema, 'params'),
    absencesDocuments.listDocuments
);

/**
 * @swagger
 * /absences/{id}/documents/{docId}/download:
 *   get:
 *     summary: Download document
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document file
 *       404:
 *         description: Document not found
 */
router.get(
    '/:id/documents/:docId/download',
    authenticate,
    validate(absencesSchemas.documentIdSchema, 'params'),
    absencesDocuments.downloadDocument
);

/**
 * @swagger
 * /absences/{id}/documents/{docId}:
 *   delete:
 *     summary: Delete document from absence request
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 */
router.delete(
    '/:id/documents/:docId',
    authenticate,
    validate(absencesSchemas.documentIdSchema, 'params'),
    absencesDocuments.deleteDocument
);

export default router;

