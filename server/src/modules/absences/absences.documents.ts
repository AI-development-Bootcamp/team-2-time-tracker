/**
 * @fileoverview Document management for absences
 * @module absences/absences.documents
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../shared/errors';
import { uploadConfig, hebrewFileErrors } from '../../config/upload';
import * as storageService from '../../shared/storage.service';
import { prisma } from '../../db';
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
    storage,
    limits: {
        fileSize: uploadConfig.maxFileSize,
    },
    fileFilter: (_req, file, cb) => {
        if (uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestError(hebrewFileErrors.INVALID_FILE_TYPE));
        }
    },
}).single('file');

/**
 * Upload a document for an absence request
 * POST /api/absences/:id/documents
 */
export async function uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const { id: absenceId } = req.params;

        // Verify absence exists and belongs to user
        const absence = await prisma.absenceRequest.findFirst({
            where: { id: absenceId, userId },
        });

        if (!absence) {
            throw new NotFoundError('Absence not found');
        }

        // Check if file was uploaded
        const file = req.file;
        if (!file) {
            throw new BadRequestError(hebrewFileErrors.NO_FILE_UPLOADED);
        }

        // Validate file size (additional check)
        if (!storageService.isValidFileSize(file.size)) {
            throw new BadRequestError(hebrewFileErrors.FILE_TOO_LARGE);
        }

        // Generate file path and upload to storage
        const filePath = storageService.generateFilePath(userId, absenceId, file.originalname);
        const fileUrl = await storageService.uploadFile(file.buffer, filePath, file.mimetype);

        // Save document metadata to database
        const document = await prisma.absenceDocument.create({
            data: {
                absenceRequestId: absenceId,
                fileUrl,
                fileName: file.originalname,
                mimeType: file.mimetype,
                fileSize: file.size,
                uploadedByUserId: userId,
            },
        });

        // Update absence status to SUBMITTED if it was PENDING_DOCUMENT
        if (absence.status === 'PENDING_DOCUMENT') {
            await prisma.absenceRequest.update({
                where: { id: absenceId },
                data: { status: 'SUBMITTED' },
            });
        }

        res.status(201).json({
            success: true,
            data: {
                id: document.id,
                fileName: document.fileName,
                url: document.fileUrl,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * List documents for an absence request
 * GET /api/absences/:id/documents
 */
export async function listDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const { id: absenceId } = req.params;

        // Verify absence exists and belongs to user
        const absence = await prisma.absenceRequest.findFirst({
            where: { id: absenceId, userId },
        });

        if (!absence) {
            throw new NotFoundError('Absence not found');
        }

        // Get documents
        const documents = await prisma.absenceDocument.findMany({
            where: { absenceRequestId: absenceId },
            orderBy: { uploadedAt: 'desc' },
        });

        res.json({
            success: true,
            data: documents.map((doc) => ({
                id: doc.id,
                fileName: doc.fileName,
                fileUrl: doc.fileUrl,
                fileSize: doc.fileSize,
                mimeType: doc.mimeType,
                uploadedByUserId: doc.uploadedByUserId,
                uploadedAt: doc.uploadedAt.toISOString(),
            })),
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Download a document (returns signed URL)
 * GET /api/absences/:id/documents/:docId/download
 */
export async function downloadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const { id: absenceId, docId } = req.params;

        // Verify absence exists and belongs to user
        const absence = await prisma.absenceRequest.findFirst({
            where: { id: absenceId, userId },
        });

        if (!absence) {
            throw new NotFoundError('Absence not found');
        }

        // Get document
        const document = await prisma.absenceDocument.findFirst({
            where: { id: docId, absenceRequestId: absenceId },
        });

        if (!document) {
            throw new NotFoundError('Document not found');
        }

        // Generate signed URL for download
        const signedUrl = await storageService.getSignedDownloadUrl(document.fileUrl);

        res.redirect(signedUrl);
    } catch (error) {
        next(error);
    }
}

/**
 * Delete a document from an absence request
 * DELETE /api/absences/:id/documents/:docId
 */
export async function deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const { id: absenceId, docId } = req.params;

        // Verify absence exists and belongs to user
        const absence = await prisma.absenceRequest.findFirst({
            where: { id: absenceId, userId },
            include: { documents: true },
        });

        if (!absence) {
            throw new NotFoundError('Absence not found');
        }

        // Get document
        const document = await prisma.absenceDocument.findFirst({
            where: { id: docId, absenceRequestId: absenceId },
        });

        if (!document) {
            throw new NotFoundError('Document not found');
        }

        // Verify user owns the document
        if (document.uploadedByUserId !== userId) {
            throw new ForbiddenError('You cannot delete this document');
        }

        // Delete file from storage
        await storageService.deleteFile(document.fileUrl);

        // Delete document from database
        await prisma.absenceDocument.delete({
            where: { id: docId },
        });

        // Check if absence needs to go back to PENDING_DOCUMENT
        const remainingDocuments = await prisma.absenceDocument.count({
            where: { absenceRequestId: absenceId },
        });

        if (
            remainingDocuments === 0 &&
            (absence.type === 'SICK' || absence.type === 'RESERVES')
        ) {
            await prisma.absenceRequest.update({
                where: { id: absenceId },
                data: { status: 'PENDING_DOCUMENT' },
            });
        }

        res.json({
            success: true,
            message: 'Document deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}
