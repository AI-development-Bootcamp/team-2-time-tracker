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
 *     tags: [Absences]
 *     summary: Create new absence request
 *     description: Creates a new absence request with automatic workday expansion (excludes Friday-Saturday). For SICK/RESERVES types without documents, status is set to PENDING_DOCUMENT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAbsenceRequest'
 *     responses:
 *       201:
 *         description: Absence created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateAbsenceResponse'
 *       400:
 *         description: Validation error or month is locked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Overlapping absence exists
 */
router.post('/', authenticate, validate(absencesSchemas.createAbsenceSchema), absencesController.createAbsence);

/**
 * @swagger
 * /absences:
 *   get:
 *     tags: [Absences]
 *     summary: List user's absences
 *     description: Returns paginated list of user's absence requests with days and documents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           format: YYYY-MM
 *           example: '2025-01'
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [VACATION, SICK, RESERVES]
 *     responses:
 *       200:
 *         description: List of absences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListAbsencesResponse'
 */
router.get('/', authenticate, validate(absencesSchemas.listAbsencesSchema, 'query'), absencesController.listAbsences);

/**
 * @swagger
 * /absences/{id}:
 *   get:
 *     tags: [Absences]
 *     summary: Get single absence by ID
 *     description: Returns detailed absence information including days and documents
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
 *         description: Absence details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetAbsenceResponse'
 *       404:
 *         description: Absence not found
 */
router.get('/:id', authenticate, validate(absencesSchemas.getAbsenceByIdSchema, 'params'), absencesController.getAbsenceById);

/**
 * @swagger
 * /absences/{id}:
 *   put:
 *     tags: [Absences]
 *     summary: Update absence request
 *     description: Updates absence request. Month must not be locked. Recalculates workdays on date change.
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
 *             $ref: '#/components/schemas/UpdateAbsenceRequest'
 *     responses:
 *       200:
 *         description: Absence updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetAbsenceResponse'
 *       400:
 *         description: Validation error or month is locked
 *       404:
 *         description: Absence not found
 */
router.put('/:id', authenticate, validate(absencesSchemas.getAbsenceByIdSchema, 'params'), validate(absencesSchemas.updateAbsenceSchema), absencesController.updateAbsence);

/**
 * @swagger
 * /absences/{id}:
 *   delete:
 *     tags: [Absences]
 *     summary: Delete absence request
 *     description: Deletes absence request and all associated days and documents. Month must not be locked.
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
 *         description: Absence deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OkResponse'
 *       400:
 *         description: Month is locked
 *       404:
 *         description: Absence not found
 */
router.delete('/:id', authenticate, validate(absencesSchemas.getAbsenceByIdSchema, 'params'), absencesController.deleteAbsence);

/**
 * @swagger
 * /absences/{id}/documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload document for absence
 *     description: Uploads document to IDrive e2 storage. Changes status from PENDING_DOCUMENT to SUBMITTED. Allowed even if month is locked.
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file (PDF, JPG, PNG). Max 10MB.
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadDocumentResponse'
 *       400:
 *         description: Invalid file type or size
 *       404:
 *         description: Absence not found
 */
router.post('/:id/documents', authenticate, validate(absencesSchemas.getAbsenceByIdSchema, 'params'), absencesDocuments.uploadMiddleware, absencesDocuments.uploadDocument);

/**
 * @swagger
 * /absences/{id}/documents:
 *   get:
 *     tags: [Documents]
 *     summary: List documents for absence
 *     description: Returns list of all documents attached to an absence request
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
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListDocumentsResponse'
 *       404:
 *         description: Absence not found
 */
router.get('/:id/documents', authenticate, validate(absencesSchemas.getAbsenceByIdSchema, 'params'), absencesDocuments.listDocuments);

/**
 * @swagger
 * /absences/{id}/documents/{docId}/download:
 *   get:
 *     tags: [Documents]
 *     summary: Download document
 *     description: Generates signed URL and redirects to download document from IDrive e2
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       302:
 *         description: Redirect to signed download URL
 *       404:
 *         description: Absence or document not found
 */
router.get('/:id/documents/:docId/download', authenticate, validate(absencesSchemas.documentIdSchema, 'params'), absencesDocuments.downloadDocument);

/**
 * @swagger
 * /absences/{id}/documents/{docId}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete document
 *     description: Deletes document from IDrive e2 and database. If last document for SICK/RESERVES, changes status to PENDING_DOCUMENT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OkResponse'
 *       403:
 *         description: User does not own this document
 *       404:
 *         description: Absence or document not found
 */
router.delete('/:id/documents/:docId', authenticate, validate(absencesSchemas.documentIdSchema, 'params'), absencesDocuments.deleteDocument);

export default router;

