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

/** @swagger POST /absences - Create new absence request */
router.post('/', authenticate, validate(absencesSchemas.createAbsenceSchema), absencesController.createAbsence);

/** @swagger GET /absences - List user's absences with pagination */
router.get('/', authenticate, validate(absencesSchemas.listAbsencesSchema, 'query'), absencesController.listAbsences);

/** @swagger GET /absences/:id - Get single absence by ID */
router.get('/:id', authenticate, validate(absencesSchemas.getAbsenceByIdSchema, 'params'), absencesController.getAbsenceById);

/** @swagger PUT /absences/:id - Update absence request */
router.put('/:id', authenticate, validate(absencesSchemas.getAbsenceByIdSchema, 'params'), validate(absencesSchemas.updateAbsenceSchema), absencesController.updateAbsence);

/** @swagger DELETE /absences/:id - Delete absence request */
router.delete('/:id', authenticate, validate(absencesSchemas.getAbsenceByIdSchema, 'params'), absencesController.deleteAbsence);

/** @swagger POST /absences/:id/documents - Upload document for absence request */
router.post('/:id/documents', authenticate, validate(absencesSchemas.getAbsenceByIdSchema, 'params'), absencesDocuments.uploadMiddleware, absencesDocuments.uploadDocument);

/** @swagger GET /absences/:id/documents - List documents for absence request */
router.get('/:id/documents', authenticate, validate(absencesSchemas.getAbsenceByIdSchema, 'params'), absencesDocuments.listDocuments);

/** @swagger GET /absences/:id/documents/:docId/download - Download document */
router.get('/:id/documents/:docId/download', authenticate, validate(absencesSchemas.documentIdSchema, 'params'), absencesDocuments.downloadDocument);

/** @swagger DELETE /absences/:id/documents/:docId - Delete document from absence request */
router.delete('/:id/documents/:docId', authenticate, validate(absencesSchemas.documentIdSchema, 'params'), absencesDocuments.deleteDocument);

export default router;

