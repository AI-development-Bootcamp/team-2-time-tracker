/**
 * @fileoverview Integration tests for absence endpoints
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { router } from '../../src/routes';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import {
    mockPrisma,
    mockPrismaUser,
    mockPrismaAbsenceRequest,
    mockPrismaAbsenceDay,
    mockPrismaAbsenceDocument,
    mockPrismaMonthLock,
    mockPrismaWorkdaySummary,
    resetPrismaMocks,
    createMockUser,
    createMockAbsenceRequest,
    createMockAbsenceDay,
    createMockAbsenceDocument,
} from '../helpers/mockPrisma';

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'mock-jwt-token'),
        verify: vi.fn(() => ({
            userId: 'test-user-id',
            email: 'test@example.com',
            role: 'EMPLOYEE',
        })),
    },
}));

// Mock auth repo
vi.mock('../../src/modules/auth/auth.repo', () => ({
    findUserById: vi.fn(() => Promise.resolve({
        id: 'test-user-id',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'EMPLOYEE',
        isActive: true,
    })),
}));

// Mock storage service
vi.mock('../../src/shared/storage.service', () => ({
    generateFilePath: vi.fn(() => 'absences/test-user-id/123e4567-e89b-12d3-a456-426614174000/file.pdf'),
    uploadFile: vi.fn(() => Promise.resolve('https://storage.example.com/absences/test-user-id/123e4567-e89b-12d3-a456-426614174000/file.pdf')),
    deleteFile: vi.fn(() => Promise.resolve()),
    getSignedDownloadUrl: vi.fn(() => Promise.resolve('https://storage.example.com/signed-url')),
    isValidFileSize: vi.fn(() => true),
    isValidMimeType: vi.fn(() => true),
    isStorageConfigured: vi.fn(() => true),
}));

// Mock multer
vi.mock('multer', () => {
    const memoryStorage = vi.fn(() => ({}));
    const mockMulter = vi.fn(() => ({
        single: vi.fn(() => (req: any, res: any, next: any) => {
            // For supertest, the file is attached via .attach() and multer will parse it
            // Since we're mocking, we'll create a mock file object if not already present
            if (!req.file && req.body) {
                // This is a fallback - supertest should handle the file attachment
                // but if multer is called, we need to mock the file object
                req.file = {
                    fieldname: 'file',
                    originalname: 'document.pdf',
                    encoding: '7bit',
                    mimetype: 'application/pdf',
                    buffer: Buffer.from('fake file content'),
                    size: 1024,
                };
            }
            next();
        }),
    }));
    // Attach memoryStorage to the default export
    (mockMulter as any).memoryStorage = memoryStorage;
    return {
        default: mockMulter,
    };
});

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', router);
    app.use(errorMiddleware);
});

describe('Absence Endpoints', () => {
    beforeEach(() => {
        resetPrismaMocks();
        vi.clearAllMocks();
        // Mock user lookup for authentication
        mockPrismaUser.findUnique.mockResolvedValue(createMockUser());
        // Set default transaction mock
        mockPrisma.$transaction.mockImplementation(async (callback) => {
            return callback(mockPrisma);
        });
    });

    describe('POST /api/absences', () => {
        it('should create a new absence request successfully', async () => {
            const mockAbsence = createMockAbsenceRequest({
                type: 'VACATION',
                startDate: new Date('2026-01-15'),
                endDate: new Date('2026-01-15'),
                isHalfDay: false,
                absenceDays: [
                    createMockAbsenceDay({
                        workDate: new Date('2026-01-15'),
                        minutes: 540,
                    }),
                ],
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    ...mockPrisma,
                    absenceRequest: {
                        ...mockPrismaAbsenceRequest,
                        create: vi.fn().mockResolvedValue(mockAbsence),
                        findUnique: vi.fn().mockResolvedValue(mockAbsence),
                    },
                    absenceDay: {
                        ...mockPrismaAbsenceDay,
                        createMany: vi.fn().mockResolvedValue({ count: 1 }),
                    },
                    workdaySummary: {
                        ...mockPrismaWorkdaySummary,
                        findUnique: vi.fn().mockResolvedValue(null),
                        create: vi.fn().mockResolvedValue({}),
                    },
                };
                return callback(tx);
            });

            const response = await request(app)
                .post('/api/absences')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    type: 'VACATION',
                    startDate: '2026-01-15',
                    endDate: '2026-01-15',
                    isHalfDay: false,
                    note: 'Vacation day',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.type).toBe('VACATION');
        });

        it('should create absence with PENDING_DOCUMENT status for SICK type', async () => {
            const mockAbsence = createMockAbsenceRequest({
                type: 'SICK',
                status: 'PENDING_DOCUMENT',
                absenceDays: [
                    createMockAbsenceDay({
                        workDate: new Date('2026-01-15'),
                        minutes: 540,
                    }),
                ],
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    ...mockPrisma,
                    absenceRequest: {
                        ...mockPrismaAbsenceRequest,
                        create: vi.fn().mockResolvedValue(mockAbsence),
                        findUnique: vi.fn().mockResolvedValue(mockAbsence),
                    },
                    absenceDay: {
                        ...mockPrismaAbsenceDay,
                        createMany: vi.fn().mockResolvedValue({ count: 1 }),
                    },
                    workdaySummary: {
                        ...mockPrismaWorkdaySummary,
                        findUnique: vi.fn().mockResolvedValue(null),
                        create: vi.fn().mockResolvedValue({}),
                    },
                };
                return callback(tx);
            });

            const response = await request(app)
                .post('/api/absences')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    type: 'SICK',
                    startDate: '2026-01-15',
                    endDate: '2026-01-15',
                    isHalfDay: false,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('PENDING_DOCUMENT');
        });

        it('should return 400 for invalid date range', async () => {
            const response = await request(app)
                .post('/api/absences')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    type: 'VACATION',
                    startDate: '2026-01-20',
                    endDate: '2026-01-15',
                    isHalfDay: false,
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/absences')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    type: 'VACATION',
                    startDate: '2026-01-15',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid absence type', async () => {
            const response = await request(app)
                .post('/api/absences')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    type: 'INVALID_TYPE',
                    startDate: '2026-01-15',
                    endDate: '2026-01-15',
                    isHalfDay: false,
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for overlapping absence', async () => {
            const existingAbsence = createMockAbsenceRequest();

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(existingAbsence);

            const response = await request(app)
                .post('/api/absences')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    type: 'VACATION',
                    startDate: '2026-01-15',
                    endDate: '2026-01-15',
                    isHalfDay: false,
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for locked month', async () => {
            mockPrismaMonthLock.findFirst.mockResolvedValue({
                id: 'lock-id',
                month: new Date('2026-01-01'),
                lockedAt: new Date(),
                unlockedAt: null,
            });

            const response = await request(app)
                .post('/api/absences')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    type: 'VACATION',
                    startDate: '2026-01-15',
                    endDate: '2026-01-15',
                    isHalfDay: false,
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 for missing authentication', async () => {
            const response = await request(app).post('/api/absences').send({
                type: 'VACATION',
                startDate: '2026-01-15',
                endDate: '2026-01-15',
                isHalfDay: false,
            });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/absences', () => {
        it('should list user absences with pagination', async () => {
            const mockAbsences = [
                createMockAbsenceRequest({ id: 'absence-1' }),
                createMockAbsenceRequest({ id: 'absence-2' }),
            ];

            mockPrismaAbsenceRequest.findMany.mockResolvedValue(mockAbsences);
            mockPrismaAbsenceRequest.count.mockResolvedValue(2);

            const response = await request(app)
                .get('/api/absences')
                .set('Authorization', 'Bearer valid-token')
                .query({ page: 1, pageSize: 20 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('items');
            expect(response.body.data).toHaveProperty('pagination');
            expect(response.body.data.items).toHaveLength(2);
            expect(response.body.data.pagination.total).toBe(2);
        });

        it('should use default pagination values', async () => {
            mockPrismaAbsenceRequest.findMany.mockResolvedValue([]);
            mockPrismaAbsenceRequest.count.mockResolvedValue(0);

            const response = await request(app)
                .get('/api/absences')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.data.pagination.page).toBe(1);
            expect(response.body.data.pagination.pageSize).toBe(20);
        });

        it('should return 401 for missing authentication', async () => {
            const response = await request(app).get('/api/absences');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/absences/:id', () => {
        it('should get absence by ID successfully', async () => {
            const mockAbsence = createMockAbsenceRequest({
                absenceDays: [createMockAbsenceDay()],
                documents: [],
            });

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);

            const response = await request(app)
                .get('/api/absences/123e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.id).toBe('123e4567-e89b-12d3-a456-426614174000');
        });

        it('should return 404 for non-existent absence', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/absences/999e4567-e89b-12d3-a456-426614174999')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid UUID format', async () => {
            const response = await request(app)
                .get('/api/absences/invalid-id')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(400);
        });

        it('should return 401 for missing authentication', async () => {
            const response = await request(app).get('/api/absences/123e4567-e89b-12d3-a456-426614174000');

            expect(response.status).toBe(401);
        });
    });

    describe('PUT /api/absences/:id', () => {
        it('should update absence successfully', async () => {
            const existingAbsence = createMockAbsenceRequest({
                absenceDays: [createMockAbsenceDay()],
            });
            const updatedAbsence = createMockAbsenceRequest({
                ...existingAbsence,
                type: 'SICK',
                note: 'Updated note',
            });

            mockPrismaAbsenceRequest.findFirst.mockResolvedValueOnce(existingAbsence);
            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    ...mockPrisma,
                    absenceRequest: {
                        ...mockPrismaAbsenceRequest,
                        update: vi.fn().mockResolvedValue(updatedAbsence),
                        findUnique: vi.fn().mockResolvedValue(updatedAbsence),
                    },
                    absenceDay: {
                        ...mockPrismaAbsenceDay,
                        findMany: vi.fn().mockResolvedValue(existingAbsence.absenceDays),
                    },
                    workdaySummary: {
                        ...mockPrismaWorkdaySummary,
                        findUnique: vi.fn().mockResolvedValue(null),
                    },
                };
                return callback(tx);
            });

            const response = await request(app)
                .put('/api/absences/123e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    type: 'SICK',
                    note: 'Updated note',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.type).toBe('SICK');
        });

        it('should return 404 for non-existent absence', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/absences/999e4567-e89b-12d3-a456-426614174999')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    note: 'Updated note',
                });

            expect(response.status).toBe(404);
        });

        it('should return 400 for locked month', async () => {
            const existingAbsence = createMockAbsenceRequest();
            mockPrismaAbsenceRequest.findFirst.mockResolvedValueOnce(existingAbsence);
            mockPrismaMonthLock.findFirst.mockResolvedValue({
                id: 'lock-id',
                month: new Date('2026-01-01'),
                lockedAt: new Date(),
                unlockedAt: null,
            });

            const response = await request(app)
                .put('/api/absences/123e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    note: 'Updated note',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for overlapping absence', async () => {
            const existingAbsence = createMockAbsenceRequest();
            const overlappingAbsence = createMockAbsenceRequest({ id: 'other-absence-id' });

            mockPrismaAbsenceRequest.findFirst
                .mockResolvedValueOnce(existingAbsence)
                .mockResolvedValueOnce(overlappingAbsence);
            mockPrismaMonthLock.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/absences/123e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    startDate: '2026-01-20',
                    endDate: '2026-01-20',
                });

            expect(response.status).toBe(400);
        });

        it('should return 401 for missing authentication', async () => {
            const response = await request(app)
                .put('/api/absences/123e4567-e89b-12d3-a456-426614174000')
                .send({ note: 'Updated note' });

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/absences/:id', () => {
        it('should delete absence successfully', async () => {
            const existingAbsence = createMockAbsenceRequest({
                absenceDays: [createMockAbsenceDay()],
            });

            mockPrismaAbsenceRequest.findFirst.mockResolvedValueOnce(existingAbsence);
            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    ...mockPrisma,
                    absenceDay: {
                        ...mockPrismaAbsenceDay,
                        findMany: vi.fn().mockResolvedValue(existingAbsence.absenceDays),
                    },
                    absenceRequest: {
                        ...mockPrismaAbsenceRequest,
                        delete: vi.fn().mockResolvedValue(existingAbsence),
                    },
                    workdaySummary: {
                        ...mockPrismaWorkdaySummary,
                        findUnique: vi.fn().mockResolvedValue(null),
                    },
                };
                return callback(tx);
            });

            const response = await request(app)
                .delete('/api/absences/123e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Absence deleted successfully');
        });

        it('should return 404 for non-existent absence', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .delete('/api/absences/999e4567-e89b-12d3-a456-426614174999')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(404);
        });

        it('should return 400 for locked month', async () => {
            const existingAbsence = createMockAbsenceRequest();
            mockPrismaAbsenceRequest.findFirst.mockResolvedValueOnce(existingAbsence);
            mockPrismaMonthLock.findFirst.mockResolvedValue({
                id: 'lock-id',
                month: new Date('2026-01-01'),
                lockedAt: new Date(),
                unlockedAt: null,
            });

            const response = await request(app)
                .delete('/api/absences/123e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(400);
        });

        it('should return 401 for missing authentication', async () => {
            const response = await request(app).delete('/api/absences/123e4567-e89b-12d3-a456-426614174000');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/absences/:id/documents', () => {
        it('should upload document successfully', async () => {
            const mockAbsence = createMockAbsenceRequest({
                status: 'PENDING_DOCUMENT',
            });
            const mockDocument = createMockAbsenceDocument();

            mockPrismaAbsenceRequest.findFirst.mockResolvedValueOnce(mockAbsence);
            mockPrismaAbsenceDocument.create.mockResolvedValue(mockDocument);
            mockPrismaAbsenceRequest.update.mockResolvedValue({
                ...mockAbsence,
                status: 'SUBMITTED',
            });

            const response = await request(app)
                .post('/api/absences/123e4567-e89b-12d3-a456-426614174000/documents')
                .set('Authorization', 'Bearer valid-token')
                .attach('file', Buffer.from('fake file content'), 'document.pdf');

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('fileName');
        });

        it('should return 400 when no file is uploaded', async () => {
            const mockAbsence = createMockAbsenceRequest();
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);

            const response = await request(app)
                .post('/api/absences/123e4567-e89b-12d3-a456-426614174000/documents')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(400);
        });

        it('should return 404 for non-existent absence', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/absences/999e4567-e89b-12d3-a456-426614174999/documents')
                .set('Authorization', 'Bearer valid-token')
                .attach('file', Buffer.from('fake file content'), 'document.pdf');

            expect(response.status).toBe(404);
        });

        it('should return 401 for missing authentication', async () => {
            const response = await request(app)
                .post('/api/absences/123e4567-e89b-12d3-a456-426614174000/documents')
                .attach('file', Buffer.from('fake file content'), 'document.pdf');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/absences/:id/documents', () => {
        it('should list documents for absence', async () => {
            const mockAbsence = createMockAbsenceRequest();
            const mockDocuments = [
                createMockAbsenceDocument({ id: 'doc-1' }),
                createMockAbsenceDocument({ id: 'doc-2' }),
            ];

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findMany.mockResolvedValue(mockDocuments);

            const response = await request(app)
                .get('/api/absences/123e4567-e89b-12d3-a456-426614174000/documents')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
        });

        it('should return 404 for non-existent absence', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/absences/999e4567-e89b-12d3-a456-426614174999/documents')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(404);
        });

        it('should return 401 for missing authentication', async () => {
            const response = await request(app).get('/api/absences/123e4567-e89b-12d3-a456-426614174000/documents');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/absences/:id/documents/:docId/download', () => {
        it('should redirect to signed download URL', async () => {
            const mockAbsence = createMockAbsenceRequest();
            const mockDocument = createMockAbsenceDocument();

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(mockDocument);

            const response = await request(app)
                .get('/api/absences/123e4567-e89b-12d3-a456-426614174000/documents/323e4567-e89b-12d3-a456-426614174000/download')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(302);
            expect(response.headers.location).toBeDefined();
        });

        it('should return 404 for non-existent absence', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/absences/999e4567-e89b-12d3-a456-426614174999/documents/323e4567-e89b-12d3-a456-426614174000/download')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(404);
        });

        it('should return 404 for non-existent document', async () => {
            const mockAbsence = createMockAbsenceRequest();

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/absences/123e4567-e89b-12d3-a456-426614174000/documents/999e4567-e89b-12d3-a456-426614174000/download')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(404);
        });

        it('should return 401 for missing authentication', async () => {
            const response = await request(app).get(
                '/api/absences/123e4567-e89b-12d3-a456-426614174000/documents/323e4567-e89b-12d3-a456-426614174000/download'
            );

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/absences/:id/documents/:docId', () => {
        it('should delete document successfully', async () => {
            const mockDocument = createMockAbsenceDocument();
            const mockAbsence = createMockAbsenceRequest({
                type: 'VACATION',
                status: 'SUBMITTED',
                documents: [mockDocument],
            });

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(mockDocument);
            mockPrismaAbsenceDocument.count.mockResolvedValue(0);
            mockPrismaAbsenceDocument.delete.mockResolvedValue(mockDocument);

            const response = await request(app)
                .delete('/api/absences/123e4567-e89b-12d3-a456-426614174000/documents/323e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Document deleted successfully');
        });

        it('should update absence status to PENDING_DOCUMENT when deleting last document for SICK type', async () => {
            const mockDocument = createMockAbsenceDocument();
            const mockAbsence = createMockAbsenceRequest({
                type: 'SICK',
                status: 'SUBMITTED',
                documents: [mockDocument],
            });

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(mockDocument);
            mockPrismaAbsenceDocument.count.mockResolvedValue(0);
            mockPrismaAbsenceDocument.delete.mockResolvedValue(mockDocument);
            mockPrismaAbsenceRequest.update.mockResolvedValue({
                ...mockAbsence,
                status: 'PENDING_DOCUMENT',
            });

            const response = await request(app)
                .delete('/api/absences/123e4567-e89b-12d3-a456-426614174000/documents/323e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(mockPrismaAbsenceRequest.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: '123e4567-e89b-12d3-a456-426614174000' },
                    data: { status: 'PENDING_DOCUMENT' },
                })
            );
        });

        it('should return 404 for non-existent absence', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .delete('/api/absences/999e4567-e89b-12d3-a456-426614174999/documents/323e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(404);
        });

        it('should return 404 for non-existent document', async () => {
            const mockAbsence = createMockAbsenceRequest();
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);
            mockPrismaAbsenceDocument.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .delete('/api/absences/123e4567-e89b-12d3-a456-426614174000/documents/999e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(404);
        });

        it('should return 401 for missing authentication', async () => {
            const response = await request(app).delete(
                '/api/absences/123e4567-e89b-12d3-a456-426614174000/documents/323e4567-e89b-12d3-a456-426614174000'
            );

            expect(response.status).toBe(401);
        });
    });
});

