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
 * @route POST /absences
 * @desc Create new absence request
 * @access Private
 */
router.post(
    '/',
    authenticate,
    validate(absencesSchemas.createAbsenceSchema),
    absencesController.createAbsence
);

/**
 * @route GET /absences
 * @desc List user's absences with pagination
 * @access Private
 */
router.get(
    '/',
    authenticate,
    validate(absencesSchemas.listAbsencesSchema, 'query'),
    absencesController.listAbsences
);

/**
 * @route GET /absences/:id
 * @desc Get single absence by ID
 * @access Private
 */
router.get(
    '/:id',
    authenticate,
    validate(absencesSchemas.getAbsenceByIdSchema, 'params'),
    absencesController.getAbsenceById
);

/**
 * @route PUT /absences/:id
 * @desc Update absence request
 * @access Private
 */
router.put(
    '/:id',
    authenticate,
    validate(absencesSchemas.getAbsenceByIdSchema, 'params'),
    validate(absencesSchemas.updateAbsenceSchema),
    absencesController.updateAbsence
);

/**
 * @route DELETE /absences/:id
 * @desc Delete absence request
 * @access Private
 */
router.delete(
    '/:id',
    authenticate,
    validate(absencesSchemas.getAbsenceByIdSchema, 'params'),
    absencesController.deleteAbsence
);

// Document Management Routes

/**
 * @route POST /absences/:id/documents
 * @desc Upload document for absence request
 * @access Private
 */
router.post(
    '/:id/documents',
    authenticate,
    validate(absencesSchemas.getAbsenceByIdSchema, 'params'),
    absencesDocuments.uploadMiddleware,
    absencesDocuments.uploadDocument
);

/**
 * @route GET /absences/:id/documents
 * @desc List documents for absence request
 * @access Private
 */
router.get(
    '/:id/documents',
    authenticate,
    validate(absencesSchemas.getAbsenceByIdSchema, 'params'),
    absencesDocuments.listDocuments
);

/**
 * @route GET /absences/:id/documents/:docId/download
 * @desc Download document
 * @access Private
 */
router.get(
    '/:id/documents/:docId/download',
    authenticate,
    validate(absencesSchemas.documentIdSchema, 'params'),
    absencesDocuments.downloadDocument
);

/**
 * @route DELETE /absences/:id/documents/:docId
 * @desc Delete document from absence request
 * @access Private
 */
router.delete(
    '/:id/documents/:docId',
    authenticate,
    validate(absencesSchemas.documentIdSchema, 'params'),
    absencesDocuments.deleteDocument
);

export default router;

