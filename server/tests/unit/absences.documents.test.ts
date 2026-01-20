/**
 * @fileoverview Unit tests for absences.documents.ts - Document upload and database operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/middlewares/auth.middleware';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../src/shared/errors';

// Mock dependencies before imports
vi.mock('../../src/db', () => {
    const mockPrismaAbsenceRequest = {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
    };

    const mockPrismaAbsenceDocument = {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
    };

    return {
        prisma: {
            absenceRequest: mockPrismaAbsenceRequest,
            absenceDocument: mockPrismaAbsenceDocument,
        },
    };
});

vi.mock('../../src/shared/storage.service', () => ({
    generateFilePath: vi.fn(),
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    getSignedDownloadUrl: vi.fn(),
    isValidFileSize: vi.fn(),
    isValidMimeType: vi.fn(),
}));

vi.mock('../../src/config/upload', () => ({
    uploadConfig: {
        maxFileSize: 10 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    hebrewFileErrors: {
        FILE_TOO_LARGE: 'גודל הקובץ חורג מ-10MB',
        INVALID_FILE_TYPE: 'סוג קובץ לא נתמך. יש להעלות PDF, JPG או PNG',
        NO_FILE_UPLOADED: 'לא הועלה קובץ',
    },
}));

vi.mock('../../src/config/storage', () => ({
    fileConstraints: {
        maxFileSize: 10 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    },
}));

// Import after mocks are set up
import * as absencesDocuments from '../../src/modules/absences/absences.documents';
import * as storageService from '../../src/shared/storage.service';
import { prisma } from '../../src/db';

// Access the mocked functions
const mockPrismaAbsenceRequest = prisma.absenceRequest as any;
const mockPrismaAbsenceDocument = prisma.absenceDocument as any;

// Mock helper functions
function createMockAbsenceRequest(overrides?: any) {
    return {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'test-user-id',
        type: 'VACATION',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-01-15'),
        isHalfDay: false,
        status: 'SUBMITTED',
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        absenceDays: [],
        documents: [],
        ...overrides,
    };
}

function createMockAbsenceDocument(overrides?: any) {
    return {
        id: '323e4567-e89b-12d3-a456-426614174000',
        absenceRequestId: '123e4567-e89b-12d3-a456-426614174000',
        fileUrl: 'https://storage.example.com/absences/test-user-id/123e4567-e89b-12d3-a456-426614174000/file.pdf',
        fileName: 'document.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024,
        uploadedByUserId: 'test-user-id',
        uploadedAt: new Date(),
        ...overrides,
    };
}

function resetPrismaMocks() {
    Object.values(mockPrismaAbsenceRequest).forEach((mock: any) => mock.mockReset?.());
    Object.values(mockPrismaAbsenceDocument).forEach((mock: any) => mock.mockReset?.());
}

describe('absences.documents', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        resetPrismaMocks();
        vi.clearAllMocks();

        mockRequest = {
            user: { userId: 'test-user-id', email: 'test@example.com', role: 'EMPLOYEE' },
            params: { id: 'test-absence-id' },
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            redirect: vi.fn().mockReturnThis(),
        };

        mockNext = vi.fn();
    });

    describe('uploadDocument', () => {
        it('should upload document and save metadata to database', async () => {
            const mockAbsence = createMockAbsenceRequest({
                id: 'test-absence-id',
                userId: 'test-user-id',
                status: 'PENDING_DOCUMENT',
                type: 'SICK',
            });

            const mockFile = {
                fieldname: 'file',
                originalname: 'medical-certificate.pdf',
                encoding: '7bit',
                mimetype: 'application/pdf',
                buffer: Buffer.from('fake pdf content'),
                size: 102400, // 100KB
            } as Express.Multer.File;

            const mockDocument = createMockAbsenceDocument({
                id: 'doc-id',
                absenceRequestId: 'test-absence-id',
                fileUrl: 'https://storage.example.com/absences/test-user-id/test-absence-id/file.pdf',
                fileName: 'medical-certificate.pdf',
                mimeType: 'application/pdf',
                fileSize: 102400,
                uploadedByUserId: 'test-user-id',
            });

            mockRequest.file = mockFile;

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            vi.mocked(storageService.isValidFileSize).mockReturnValue(true);
            vi.mocked(storageService.generateFilePath).mockReturnValue(
                'absences/test-user-id/test-absence-id/file.pdf'
            );
            vi.mocked(storageService.uploadFile).mockResolvedValue(
                'https://storage.example.com/absences/test-user-id/test-absence-id/file.pdf'
            );
            mockPrismaAbsenceDocument.create.mockResolvedValue(mockDocument);
            mockPrismaAbsenceRequest.update.mockResolvedValue({
                ...mockAbsence,
                status: 'SUBMITTED',
            });

            await absencesDocuments.uploadDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            // Verify storage service was called correctly
            expect(storageService.generateFilePath).toHaveBeenCalledWith(
                'test-user-id',
                'test-absence-id',
                'medical-certificate.pdf'
            );
            expect(storageService.uploadFile).toHaveBeenCalledWith(
                mockFile.buffer,
                'absences/test-user-id/test-absence-id/file.pdf',
                'application/pdf'
            );

            // Verify document metadata was saved to database
            expect(mockPrismaAbsenceDocument.create).toHaveBeenCalledWith({
                data: {
                    absenceRequestId: 'test-absence-id',
                    fileUrl: 'https://storage.example.com/absences/test-user-id/test-absence-id/file.pdf',
                    fileName: 'medical-certificate.pdf',
                    mimeType: 'application/pdf',
                    fileSize: 102400,
                    uploadedByUserId: 'test-user-id',
                },
            });

            // Verify absence status was updated
            expect(mockPrismaAbsenceRequest.update).toHaveBeenCalledWith({
                where: { id: 'test-absence-id' },
                data: { status: 'SUBMITTED' },
            });

            // Verify response
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    id: 'doc-id',
                    fileName: 'medical-certificate.pdf',
                    url: 'https://storage.example.com/absences/test-user-id/test-absence-id/file.pdf',
                },
            });
        });

        it('should not update status if absence is already SUBMITTED', async () => {
            const mockAbsence = createMockAbsenceRequest({
                id: 'test-absence-id',
                userId: 'test-user-id',
                status: 'SUBMITTED',
                type: 'SICK',
            });

            const mockFile = {
                fieldname: 'file',
                originalname: 'additional-document.pdf',
                encoding: '7bit',
                mimetype: 'application/pdf',
                buffer: Buffer.from('fake pdf content'),
                size: 50000,
            } as Express.Multer.File;

            const mockDocument = createMockAbsenceDocument();

            mockRequest.file = mockFile;

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            vi.mocked(storageService.isValidFileSize).mockReturnValue(true);
            vi.mocked(storageService.generateFilePath).mockReturnValue('path/to/file.pdf');
            vi.mocked(storageService.uploadFile).mockResolvedValue('https://storage.example.com/file.pdf');
            mockPrismaAbsenceDocument.create.mockResolvedValue(mockDocument);

            await absencesDocuments.uploadDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            // Verify status was NOT updated since it was already SUBMITTED
            expect(mockPrismaAbsenceRequest.update).not.toHaveBeenCalled();
        });

        it('should throw BadRequestError when no file is uploaded', async () => {
            const mockAbsence = createMockAbsenceRequest();

            mockRequest.file = undefined;
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);

            await absencesDocuments.uploadDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        });

        it('should throw BadRequestError when file size is invalid', async () => {
            const mockAbsence = createMockAbsenceRequest();
            const mockFile = {
                fieldname: 'file',
                originalname: 'large-file.pdf',
                encoding: '7bit',
                mimetype: 'application/pdf',
                buffer: Buffer.from('fake pdf content'),
                size: 15 * 1024 * 1024, // 15MB (exceeds 10MB limit)
            } as Express.Multer.File;

            mockRequest.file = mockFile;
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            vi.mocked(storageService.isValidFileSize).mockReturnValue(false);

            await absencesDocuments.uploadDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        });

        it('should throw NotFoundError when absence does not exist', async () => {
            const mockFile = {
                fieldname: 'file',
                originalname: 'document.pdf',
                encoding: '7bit',
                mimetype: 'application/pdf',
                buffer: Buffer.from('fake pdf content'),
                size: 50000,
            } as Express.Multer.File;

            mockRequest.file = mockFile;
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            await absencesDocuments.uploadDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
        });

        it('should handle different file types (JPEG)', async () => {
            const mockAbsence = createMockAbsenceRequest({
                status: 'PENDING_DOCUMENT',
            });

            const mockFile = {
                fieldname: 'file',
                originalname: 'scan.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('fake image content'),
                size: 200000,
            } as Express.Multer.File;

            const mockDocument = createMockAbsenceDocument({
                fileName: 'scan.jpg',
                mimeType: 'image/jpeg',
            });

            mockRequest.file = mockFile;

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            vi.mocked(storageService.isValidFileSize).mockReturnValue(true);
            vi.mocked(storageService.generateFilePath).mockReturnValue('path/to/scan.jpg');
            vi.mocked(storageService.uploadFile).mockResolvedValue('https://storage.example.com/scan.jpg');
            mockPrismaAbsenceDocument.create.mockResolvedValue(mockDocument);
            mockPrismaAbsenceRequest.update.mockResolvedValue(mockAbsence);

            await absencesDocuments.uploadDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(storageService.uploadFile).toHaveBeenCalledWith(
                mockFile.buffer,
                'path/to/scan.jpg',
                'image/jpeg'
            );

            expect(mockPrismaAbsenceDocument.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        mimeType: 'image/jpeg',
                        fileName: 'scan.jpg',
                    }),
                })
            );
        });

        it('should handle different file types (PNG)', async () => {
            const mockAbsence = createMockAbsenceRequest({
                status: 'PENDING_DOCUMENT',
            });

            const mockFile = {
                fieldname: 'file',
                originalname: 'screenshot.png',
                encoding: '7bit',
                mimetype: 'image/png',
                buffer: Buffer.from('fake png content'),
                size: 150000,
            } as Express.Multer.File;

            const mockDocument = createMockAbsenceDocument({
                fileName: 'screenshot.png',
                mimeType: 'image/png',
            });

            mockRequest.file = mockFile;

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            vi.mocked(storageService.isValidFileSize).mockReturnValue(true);
            vi.mocked(storageService.generateFilePath).mockReturnValue('path/to/screenshot.png');
            vi.mocked(storageService.uploadFile).mockResolvedValue('https://storage.example.com/screenshot.png');
            mockPrismaAbsenceDocument.create.mockResolvedValue(mockDocument);
            mockPrismaAbsenceRequest.update.mockResolvedValue(mockAbsence);

            await absencesDocuments.uploadDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(storageService.uploadFile).toHaveBeenCalledWith(
                mockFile.buffer,
                'path/to/screenshot.png',
                'image/png'
            );
        });
    });

    describe('listDocuments', () => {
        it('should list all documents for an absence', async () => {
            const mockAbsence = createMockAbsenceRequest();
            const mockDocuments = [
                createMockAbsenceDocument({ id: 'doc-1', fileName: 'document1.pdf' }),
                createMockAbsenceDocument({ id: 'doc-2', fileName: 'document2.jpg' }),
            ];

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findMany.mockResolvedValue(mockDocuments);

            await absencesDocuments.listDocuments(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            // Verify database query
            expect(mockPrismaAbsenceDocument.findMany).toHaveBeenCalledWith({
                where: { absenceRequestId: 'test-absence-id' },
                orderBy: { uploadedAt: 'desc' },
            });

            // Verify response
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'doc-1',
                        fileName: 'document1.pdf',
                    }),
                    expect.objectContaining({
                        id: 'doc-2',
                        fileName: 'document2.jpg',
                    }),
                ]),
            });
        });

        it('should return empty array when no documents exist', async () => {
            const mockAbsence = createMockAbsenceRequest();

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findMany.mockResolvedValue([]);

            await absencesDocuments.listDocuments(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: [],
            });
        });

        it('should throw NotFoundError when absence does not exist', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            await absencesDocuments.listDocuments(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });

    describe('downloadDocument', () => {
        it('should generate signed URL and redirect to it', async () => {
            const mockAbsence = createMockAbsenceRequest();
            const mockDocument = createMockAbsenceDocument({
                fileUrl: 'https://storage.example.com/absences/user/absence/file.pdf',
            });

            mockRequest.params = { id: 'test-absence-id', docId: 'test-doc-id' };
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(mockDocument);
            vi.mocked(storageService.getSignedDownloadUrl).mockResolvedValue(
                'https://storage.example.com/signed-url?signature=xyz'
            );

            await absencesDocuments.downloadDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            // Verify signed URL generation
            expect(storageService.getSignedDownloadUrl).toHaveBeenCalledWith(
                'https://storage.example.com/absences/user/absence/file.pdf'
            );

            // Verify redirect
            expect(mockResponse.redirect).toHaveBeenCalledWith(
                'https://storage.example.com/signed-url?signature=xyz'
            );
        });

        it('should throw NotFoundError when document does not exist', async () => {
            const mockAbsence = createMockAbsenceRequest();

            mockRequest.params = { id: 'test-absence-id', docId: 'non-existent-doc-id' };
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(null);

            await absencesDocuments.downloadDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });

    describe('deleteDocument', () => {
        it('should delete document from storage and database', async () => {
            const mockDocument = createMockAbsenceDocument({
                id: 'test-doc-id',
                uploadedByUserId: 'test-user-id',
                fileUrl: 'https://storage.example.com/file.pdf',
            });

            const mockAbsence = createMockAbsenceRequest({
                type: 'VACATION',
                status: 'SUBMITTED',
                documents: [mockDocument],
            });

            mockRequest.params = { id: 'test-absence-id', docId: 'test-doc-id' };
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(mockDocument);
            mockPrismaAbsenceDocument.count.mockResolvedValue(0);
            mockPrismaAbsenceDocument.delete.mockResolvedValue(mockDocument);
            vi.mocked(storageService.deleteFile).mockResolvedValue();

            await absencesDocuments.deleteDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            // Verify file was deleted from storage
            expect(storageService.deleteFile).toHaveBeenCalledWith('https://storage.example.com/file.pdf');

            // Verify document was deleted from database
            expect(mockPrismaAbsenceDocument.delete).toHaveBeenCalledWith({
                where: { id: 'test-doc-id' },
            });

            // Verify response
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Document deleted successfully',
            });
        });

        it('should update absence status to PENDING_DOCUMENT when deleting last document for SICK type', async () => {
            const mockDocument = createMockAbsenceDocument({
                id: 'test-doc-id',
                uploadedByUserId: 'test-user-id',
            });

            const mockAbsence = createMockAbsenceRequest({
                type: 'SICK',
                status: 'SUBMITTED',
                documents: [mockDocument],
            });

            mockRequest.params = { id: 'test-absence-id', docId: 'test-doc-id' };
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(mockDocument);
            mockPrismaAbsenceDocument.count.mockResolvedValue(0); // No remaining documents
            mockPrismaAbsenceDocument.delete.mockResolvedValue(mockDocument);
            mockPrismaAbsenceRequest.update.mockResolvedValue({
                ...mockAbsence,
                status: 'PENDING_DOCUMENT',
            });
            vi.mocked(storageService.deleteFile).mockResolvedValue();

            await absencesDocuments.deleteDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            // Verify status was updated back to PENDING_DOCUMENT
            expect(mockPrismaAbsenceRequest.update).toHaveBeenCalledWith({
                where: { id: 'test-absence-id' },
                data: { status: 'PENDING_DOCUMENT' },
            });
        });

        it('should update absence status to PENDING_DOCUMENT when deleting last document for RESERVES type', async () => {
            const mockDocument = createMockAbsenceDocument({
                uploadedByUserId: 'test-user-id',
            });

            const mockAbsence = createMockAbsenceRequest({
                type: 'RESERVES',
                status: 'SUBMITTED',
                documents: [mockDocument],
            });

            mockRequest.params = { id: 'test-absence-id', docId: 'test-doc-id' };
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(mockDocument);
            mockPrismaAbsenceDocument.count.mockResolvedValue(0);
            mockPrismaAbsenceDocument.delete.mockResolvedValue(mockDocument);
            mockPrismaAbsenceRequest.update.mockResolvedValue(mockAbsence);
            vi.mocked(storageService.deleteFile).mockResolvedValue();

            await absencesDocuments.deleteDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(mockPrismaAbsenceRequest.update).toHaveBeenCalledWith({
                where: { id: 'test-absence-id' },
                data: { status: 'PENDING_DOCUMENT' },
            });
        });

        it('should not update absence status when documents remain after deletion', async () => {
            const mockDocument = createMockAbsenceDocument({
                uploadedByUserId: 'test-user-id',
            });

            const mockAbsence = createMockAbsenceRequest({
                type: 'SICK',
                status: 'SUBMITTED',
                documents: [mockDocument],
            });

            mockRequest.params = { id: 'test-absence-id', docId: 'test-doc-id' };
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(mockDocument);
            mockPrismaAbsenceDocument.count.mockResolvedValue(2); // Still has other documents
            mockPrismaAbsenceDocument.delete.mockResolvedValue(mockDocument);
            vi.mocked(storageService.deleteFile).mockResolvedValue();

            await absencesDocuments.deleteDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            // Verify status was NOT updated
            expect(mockPrismaAbsenceRequest.update).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenError when user does not own the document', async () => {
            const mockDocument = createMockAbsenceDocument({
                uploadedByUserId: 'different-user-id', // Different user
            });

            const mockAbsence = createMockAbsenceRequest({
                documents: [mockDocument],
            });

            mockRequest.params = { id: 'test-absence-id', docId: 'test-doc-id' };
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(mockDocument);

            await absencesDocuments.deleteDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
            expect(storageService.deleteFile).not.toHaveBeenCalled();
            expect(mockPrismaAbsenceDocument.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError when document does not exist', async () => {
            const mockAbsence = createMockAbsenceRequest();

            mockRequest.params = { id: 'test-absence-id', docId: 'non-existent-doc-id' };
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(null);

            await absencesDocuments.deleteDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
        });

        it('should throw NotFoundError when absence does not exist', async () => {
            mockRequest.params = { id: 'non-existent-absence-id', docId: 'test-doc-id' };
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            await absencesDocuments.deleteDocument(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });
});
