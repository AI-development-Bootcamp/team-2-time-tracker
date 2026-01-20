import { z } from 'zod';

// ===========================
// TIME ENTRY SCHEMAS
// ===========================

export const adminCreateTimeEntrySchema = z.object({
    taskId: z.string().min(1, 'Task ID is required'),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    breakMinutes: z.number().min(0).optional(),
    notes: z.string().optional(),
}).refine(
    (data) => {
        const start = data.startTime.split(':').map(Number);
        const end = data.endTime.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        return endMinutes > startMinutes;
    },
    {
        message: 'End time must be after start time',
        path: ['endTime'],
    }
);

export const adminUpdateTimeEntrySchema = z.object({
    taskId: z.string().min(1, 'Task ID is required').optional(),
    date: z.string().min(1, 'Date is required').optional(),
    startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    breakMinutes: z.number().min(0).optional(),
    notes: z.string().optional(),
}).refine(
    (data) => {
        if (data.startTime && data.endTime) {
            const start = data.startTime.split(':').map(Number);
            const end = data.endTime.split(':').map(Number);
            const startMinutes = start[0] * 60 + start[1];
            const endMinutes = end[0] * 60 + end[1];
            return endMinutes > startMinutes;
        }
        return true;
    },
    {
        message: 'End time must be after start time',
        path: ['endTime'],
    }
);

// ===========================
// ABSENCE SCHEMAS
// ===========================

export const adminCreateAbsenceSchema = z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    absenceType: z.string().min(1, 'Absence type is required'),
    reason: z.string().optional(),
    documentUrl: z.string().optional(),
}).refine(
    (data) => {
        return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
        message: 'End date must be greater than or equal to start date',
        path: ['endDate'],
    }
);

export const adminUpdateAbsenceSchema = z.object({
    startDate: z.string().min(1, 'Start date is required').optional(),
    endDate: z.string().min(1, 'End date is required').optional(),
    absenceType: z.string().min(1, 'Absence type is required').optional(),
    reason: z.string().optional(),
    status: z.string().optional(),
    documentUrl: z.string().optional(),
}).refine(
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
