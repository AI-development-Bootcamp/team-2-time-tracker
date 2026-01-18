/**
 * @fileoverview Zod validation schemas for absence endpoints
 * @module absences/absences.schemas
 */

import { z } from 'zod';

/**
 * Absence type enum
 */
export const AbsenceTypeSchema = z.enum(['VACATION', 'SICK', 'RESERVES', 'OTHER']);

/**
 * Create absence request schema
 */
export const createAbsenceSchema = z
    .object({
        type: AbsenceTypeSchema,
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        isHalfDay: z.boolean().default(false),
        note: z.string().max(500, 'Note must be maximum 500 characters').optional(),
    })
    .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
        message: 'End date must be greater than or equal to start date',
        path: ['endDate'],
    });

/**
 * Update absence request schema (all fields optional)
 */
export const updateAbsenceSchema = z
    .object({
        type: AbsenceTypeSchema.optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
        isHalfDay: z.boolean().optional(),
        note: z.string().max(500, 'Note must be maximum 500 characters').optional(),
    })
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return new Date(data.endDate) >= new Date(data.startDate);
            }
            return true;
        },
        {
            message: 'End date must be greater than or equal to start date',
            path: ['endDate'],
        }
    );

/**
 * List absences query schema
 */
export const listAbsencesSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Get absence by ID param schema
 */
export const getAbsenceByIdSchema = z.object({
    id: z.string().uuid('Invalid absence ID'),
});

/**
 * Document ID param schema
 */
export const documentIdSchema = z.object({
    id: z.string().uuid('Invalid absence ID'),
    docId: z.string().uuid('Invalid document ID'),
});


