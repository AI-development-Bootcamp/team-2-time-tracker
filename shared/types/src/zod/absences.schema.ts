import { z } from 'zod';
import { AbsenceType } from '../enums/absenceType.enum';

export const createAbsenceSchema = z.object({
    type: z.nativeEnum(AbsenceType),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    isHalfDay: z.boolean(),
    note: z.string().max(500, 'Note must be 500 characters or less').optional(),
}).refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
});

export const updateAbsenceSchema = z.object({
    type: z.nativeEnum(AbsenceType).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    isHalfDay: z.boolean().optional(),
    note: z.string().max(500, 'Note must be 500 characters or less').optional(),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end >= start;
    }
    return true;
}, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
});

export const listAbsencesQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateAbsenceInput = z.infer<typeof createAbsenceSchema>;
export type UpdateAbsenceInput = z.infer<typeof updateAbsenceSchema>;
export type ListAbsencesQuery = z.infer<typeof listAbsencesQuerySchema>;
