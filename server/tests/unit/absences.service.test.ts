/**
 * @fileoverview Unit tests for absences.service.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    mockPrisma,
    mockPrismaUser,
    mockPrismaAbsenceRequest,
    mockPrismaAbsenceDay,
    mockPrismaMonthLock,
    mockPrismaWorkdaySummary,
    resetPrismaMocks,
    createMockAbsenceRequest,
    createMockAbsenceDay,
    createMockUser,
} from '../helpers/mockPrisma';

// Mock jwt config to avoid env.ts validation during import
vi.mock('../../src/config/jwt', () => ({
    jwtConfig: {
        secret: 'test-secret',
        expiresIn: '2h',
        expiresInSeconds: 7200,
    },
}));

// Import after mocks are set up
import * as absencesService from '../../src/modules/absences/absences.service';
import { BadRequestError, NotFoundError } from '../../src/shared/errors';

describe('absences.service', () => {
    beforeEach(() => {
        resetPrismaMocks();
        vi.clearAllMocks();
        // Mock user lookup - service needs to validate user exists
        mockPrismaUser.findUnique.mockResolvedValue(createMockUser());
        // Default transaction mock
        mockPrisma.$transaction.mockImplementation(async (callback) => {
            return callback(mockPrisma);
        });
    });

    describe('isIsraeliWorkday (internal logic)', () => {
        it('should correctly identify workdays through createAbsence behavior', async () => {
            // Sunday (day 0) - should be a workday
            // Create absence for a Sunday
            const sundayDate = new Date('2026-01-18'); // This is a Sunday
            expect(sundayDate.getDay()).toBe(0); // Verify it's Sunday

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const mockAbsence = createMockAbsenceRequest({
                startDate: sundayDate,
                endDate: sundayDate,
                absenceDays: [createMockAbsenceDay({ workDate: sundayDate })],
            });

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

            const result = await absencesService.createAbsence('test-user-id', {
                type: 'VACATION',
                startDate: '2026-01-18',
                endDate: '2026-01-18',
                isHalfDay: false,
            });

            expect(result).toBeDefined();
        });

        it('should reject Friday-Saturday (Israeli weekend) as no workdays', async () => {
            // Friday (day 5) and Saturday (day 6) should result in no workdays
            const fridayDate = new Date('2026-01-16'); // Friday
            const saturdayDate = new Date('2026-01-17'); // Saturday
            expect(fridayDate.getDay()).toBe(5);
            expect(saturdayDate.getDay()).toBe(6);

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            await expect(
                absencesService.createAbsence('test-user-id', {
                    type: 'VACATION',
                    startDate: '2026-01-16',
                    endDate: '2026-01-17',
                    isHalfDay: false,
                })
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('date range expansion', () => {
        it('should expand single day to one workday', async () => {
            const mockAbsence = createMockAbsenceRequest({
                startDate: new Date('2026-01-15'),
                endDate: new Date('2026-01-15'),
                absenceDays: [createMockAbsenceDay({ workDate: new Date('2026-01-15') })],
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const createAbsenceDaysMock = vi.fn().mockResolvedValue({ count: 1 });

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
                        createMany: createAbsenceDaysMock,
                    },
                    workdaySummary: {
                        ...mockPrismaWorkdaySummary,
                        findUnique: vi.fn().mockResolvedValue(null),
                        create: vi.fn().mockResolvedValue({}),
                    },
                };
                return callback(tx);
            });

            await absencesService.createAbsence('test-user-id', {
                type: 'VACATION',
                startDate: '2026-01-15',
                endDate: '2026-01-15',
                isHalfDay: false,
            });

            expect(createAbsenceDaysMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.arrayContaining([
                        expect.objectContaining({
                            minutes: 540,
                        }),
                    ]),
                })
            );
        });

        it('should expand multi-day range excluding weekends', async () => {
            // Sun Jan 18 to Fri Jan 23 - should have 5 workdays (Sun-Thu)
            const mockAbsence = createMockAbsenceRequest({
                startDate: new Date('2026-01-18'),
                endDate: new Date('2026-01-23'),
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const createAbsenceDaysMock = vi.fn().mockResolvedValue({ count: 5 });

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
                        createMany: createAbsenceDaysMock,
                    },
                    workdaySummary: {
                        ...mockPrismaWorkdaySummary,
                        findUnique: vi.fn().mockResolvedValue(null),
                        create: vi.fn().mockResolvedValue({}),
                    },
                };
                return callback(tx);
            });

            await absencesService.createAbsence('test-user-id', {
                type: 'VACATION',
                startDate: '2026-01-18',
                endDate: '2026-01-23',
                isHalfDay: false,
            });

            // Verify 5 workdays were created (Sun, Mon, Tue, Wed, Thu)
            expect(createAbsenceDaysMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.any(Array),
                })
            );
            const callData = createAbsenceDaysMock.mock.calls[0][0].data;
            expect(callData.length).toBe(5);
        });

        it('should handle week-spanning range correctly', async () => {
            // Sun Jan 18 to Sun Jan 25 - should have 10 workdays (2 weeks, excluding Fri/Sat)
            const mockAbsence = createMockAbsenceRequest({
                startDate: new Date('2026-01-18'),
                endDate: new Date('2026-01-25'),
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const createAbsenceDaysMock = vi.fn().mockResolvedValue({ count: 6 });

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
                        createMany: createAbsenceDaysMock,
                    },
                    workdaySummary: {
                        ...mockPrismaWorkdaySummary,
                        findUnique: vi.fn().mockResolvedValue(null),
                        create: vi.fn().mockResolvedValue({}),
                    },
                };
                return callback(tx);
            });

            await absencesService.createAbsence('test-user-id', {
                type: 'VACATION',
                startDate: '2026-01-18',
                endDate: '2026-01-25',
                isHalfDay: false,
            });

            const callData = createAbsenceDaysMock.mock.calls[0][0].data;
            // 5 days first week (Sun-Thu) + 1 day second week (Sun) = 6 days
            expect(callData.length).toBe(6);
        });
    });

    describe('half-day vs full-day minutes calculation', () => {
        it('should use 540 minutes for full day', async () => {
            const mockAbsence = createMockAbsenceRequest({
                isHalfDay: false,
                absenceDays: [createMockAbsenceDay({ minutes: 540 })],
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const createAbsenceDaysMock = vi.fn().mockResolvedValue({ count: 1 });

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
                        createMany: createAbsenceDaysMock,
                    },
                    workdaySummary: {
                        ...mockPrismaWorkdaySummary,
                        findUnique: vi.fn().mockResolvedValue(null),
                        create: vi.fn().mockResolvedValue({}),
                    },
                };
                return callback(tx);
            });

            await absencesService.createAbsence('test-user-id', {
                type: 'VACATION',
                startDate: '2026-01-15',
                endDate: '2026-01-15',
                isHalfDay: false,
            });

            expect(createAbsenceDaysMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.arrayContaining([
                        expect.objectContaining({
                            minutes: 540,
                        }),
                    ]),
                })
            );
        });

        it('should use 270 minutes for half day', async () => {
            const mockAbsence = createMockAbsenceRequest({
                isHalfDay: true,
                absenceDays: [createMockAbsenceDay({ minutes: 270 })],
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const createAbsenceDaysMock = vi.fn().mockResolvedValue({ count: 1 });

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
                        createMany: createAbsenceDaysMock,
                    },
                    workdaySummary: {
                        ...mockPrismaWorkdaySummary,
                        findUnique: vi.fn().mockResolvedValue(null),
                        create: vi.fn().mockResolvedValue({}),
                    },
                };
                return callback(tx);
            });

            await absencesService.createAbsence('test-user-id', {
                type: 'VACATION',
                startDate: '2026-01-15',
                endDate: '2026-01-15',
                isHalfDay: true,
            });

            expect(createAbsenceDaysMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.arrayContaining([
                        expect.objectContaining({
                            minutes: 270,
                        }),
                    ]),
                })
            );
        });
    });

    describe('PENDING_DOCUMENT status logic', () => {
        it('should set status to PENDING_DOCUMENT for SICK type without document', async () => {
            const mockAbsence = createMockAbsenceRequest({
                type: 'SICK',
                status: 'PENDING_DOCUMENT',
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const createAbsenceRequestMock = vi.fn().mockResolvedValue(mockAbsence);

            mockPrisma.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    ...mockPrisma,
                    absenceRequest: {
                        ...mockPrismaAbsenceRequest,
                        create: createAbsenceRequestMock,
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

            await absencesService.createAbsence('test-user-id', {
                type: 'SICK',
                startDate: '2026-01-15',
                endDate: '2026-01-15',
                isHalfDay: false,
            });

            expect(createAbsenceRequestMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: 'PENDING_DOCUMENT',
                    }),
                })
            );
        });

        it('should set status to PENDING_DOCUMENT for RESERVES type without document', async () => {
            const mockAbsence = createMockAbsenceRequest({
                type: 'RESERVES',
                status: 'PENDING_DOCUMENT',
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const createAbsenceRequestMock = vi.fn().mockResolvedValue(mockAbsence);

            mockPrisma.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    ...mockPrisma,
                    absenceRequest: {
                        ...mockPrismaAbsenceRequest,
                        create: createAbsenceRequestMock,
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

            await absencesService.createAbsence('test-user-id', {
                type: 'RESERVES',
                startDate: '2026-01-15',
                endDate: '2026-01-15',
                isHalfDay: false,
            });

            expect(createAbsenceRequestMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: 'PENDING_DOCUMENT',
                    }),
                })
            );
        });

        it('should set status to SUBMITTED for VACATION type', async () => {
            const mockAbsence = createMockAbsenceRequest({
                type: 'VACATION',
                status: 'SUBMITTED',
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            const createAbsenceRequestMock = vi.fn().mockResolvedValue(mockAbsence);

            mockPrisma.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    ...mockPrisma,
                    absenceRequest: {
                        ...mockPrismaAbsenceRequest,
                        create: createAbsenceRequestMock,
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

            await absencesService.createAbsence('test-user-id', {
                type: 'VACATION',
                startDate: '2026-01-15',
                endDate: '2026-01-15',
                isHalfDay: false,
            });

            expect(createAbsenceRequestMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: 'SUBMITTED',
                    }),
                })
            );
        });
    });

    describe('overlapping absence validation', () => {
        it('should throw error for overlapping absences', async () => {
            const existingAbsence = createMockAbsenceRequest({
                startDate: new Date('2026-01-15'),
                endDate: new Date('2026-01-15'),
            });

            mockPrismaMonthLock.findFirst.mockResolvedValue(null);
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(existingAbsence);

            await expect(
                absencesService.createAbsence('test-user-id', {
                    type: 'VACATION',
                    startDate: '2026-01-15',
                    endDate: '2026-01-15',
                    isHalfDay: false,
                })
            ).rejects.toThrow(BadRequestError);
        });

        it('should allow non-overlapping absences', async () => {
            const mockAbsence = createMockAbsenceRequest({
                startDate: new Date('2026-01-20'),
                endDate: new Date('2026-01-20'),
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

            const result = await absencesService.createAbsence('test-user-id', {
                type: 'VACATION',
                startDate: '2026-01-20',
                endDate: '2026-01-20',
                isHalfDay: false,
            });

            expect(result).toBeDefined();
        });
    });

    describe('month lock validation', () => {
        it('should throw error when month is locked for create', async () => {
            mockPrismaMonthLock.findFirst.mockResolvedValue({
                id: 'lock-id',
                month: new Date('2026-01-01'),
                lockedAt: new Date(),
                unlockedAt: null,
            });

            await expect(
                absencesService.createAbsence('test-user-id', {
                    type: 'VACATION',
                    startDate: '2026-01-15',
                    endDate: '2026-01-15',
                    isHalfDay: false,
                })
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw error when month is locked for update', async () => {
            const existingAbsence = createMockAbsenceRequest();
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(existingAbsence);
            mockPrismaMonthLock.findFirst.mockResolvedValue({
                id: 'lock-id',
                month: new Date('2026-01-01'),
                lockedAt: new Date(),
                unlockedAt: null,
            });

            await expect(
                absencesService.updateAbsence('123e4567-e89b-12d3-a456-426614174000', 'test-user-id', {
                    note: 'Updated note',
                })
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw error when month is locked for delete', async () => {
            const existingAbsence = createMockAbsenceRequest();
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(existingAbsence);
            mockPrismaMonthLock.findFirst.mockResolvedValue({
                id: 'lock-id',
                month: new Date('2026-01-01'),
                lockedAt: new Date(),
                unlockedAt: null,
            });

            await expect(
                absencesService.deleteAbsence('123e4567-e89b-12d3-a456-426614174000', 'test-user-id')
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('getAbsenceById', () => {
        it('should return absence when found', async () => {
            const mockAbsence = createMockAbsenceRequest();
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(mockAbsence);

            const result = await absencesService.getAbsenceById(
                '123e4567-e89b-12d3-a456-426614174000',
                'test-user-id'
            );

            expect(result).toEqual(mockAbsence);
        });

        it('should throw NotFoundError when absence not found', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            await expect(
                absencesService.getAbsenceById('999e4567-e89b-12d3-a456-426614174999', 'test-user-id')
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('listAbsences', () => {
        it('should return paginated absences', async () => {
            const mockAbsences = [
                createMockAbsenceRequest({ id: 'absence-1' }),
                createMockAbsenceRequest({ id: 'absence-2' }),
            ];

            mockPrismaAbsenceRequest.findMany.mockResolvedValue(mockAbsences);
            mockPrismaAbsenceRequest.count.mockResolvedValue(2);

            const result = await absencesService.listAbsences('test-user-id', 1, 20);

            expect(result.items).toHaveLength(2);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 20,
                total: 2,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            });
        });

        it('should calculate pagination correctly', async () => {
            mockPrismaAbsenceRequest.findMany.mockResolvedValue([createMockAbsenceRequest()]);
            mockPrismaAbsenceRequest.count.mockResolvedValue(25);

            const result = await absencesService.listAbsences('test-user-id', 1, 10);

            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 10,
                total: 25,
                totalPages: 3,
                hasNext: true,
                hasPrev: false,
            });
        });

        it('should return empty list when no absences', async () => {
            mockPrismaAbsenceRequest.findMany.mockResolvedValue([]);
            mockPrismaAbsenceRequest.count.mockResolvedValue(0);

            const result = await absencesService.listAbsences('test-user-id', 1, 20);

            expect(result.items).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
        });
    });

    describe('updateAbsence', () => {
        it('should update absence successfully', async () => {
            const existingAbsence = createMockAbsenceRequest({
                absenceDays: [createMockAbsenceDay()],
            });
            const updatedAbsence = {
                ...existingAbsence,
                note: 'Updated note',
            };

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(existingAbsence);
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
                    workdaySummary: mockPrismaWorkdaySummary,
                };
                return callback(tx);
            });

            const result = await absencesService.updateAbsence(
                '123e4567-e89b-12d3-a456-426614174000',
                'test-user-id',
                { note: 'Updated note' }
            );

            expect(result?.note).toBe('Updated note');
        });

        it('should throw NotFoundError when absence not found', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            await expect(
                absencesService.updateAbsence(
                    '999e4567-e89b-12d3-a456-426614174999',
                    'test-user-id',
                    { note: 'Updated note' }
                )
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteAbsence', () => {
        it('should delete absence successfully', async () => {
            const existingAbsence = createMockAbsenceRequest({
                absenceDays: [createMockAbsenceDay()],
            });

            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(existingAbsence);
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

            const result = await absencesService.deleteAbsence(
                '123e4567-e89b-12d3-a456-426614174000',
                'test-user-id'
            );

            expect(result).toEqual({
                success: true,
                message: 'Absence deleted successfully',
            });
        });

        it('should throw NotFoundError when absence not found', async () => {
            mockPrismaAbsenceRequest.findFirst.mockResolvedValue(null);

            await expect(
                absencesService.deleteAbsence('999e4567-e89b-12d3-a456-426614174999', 'test-user-id')
            ).rejects.toThrow(NotFoundError);
        });
    });
});
