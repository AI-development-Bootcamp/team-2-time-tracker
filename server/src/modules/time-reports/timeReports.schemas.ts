/**
 * @fileoverview Zod validation schemas for time reports end points
 * @module time-reports/timeReports.schemas
 */

import { z } from 'zod';

/**
 * Create time entry request schema
 */
export const createTimeEntrySchema = z.object({
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, 'Time must be in HH:MM format'),
    location: z.enum(['OFFICE', 'CLIENT', 'HOME'], {
        message: 'Location must be OFFICE, CLIENT, or HOME',
    }),
    taskId: z.string().uuid('Invalid task ID'),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters'),
});

/**
 * Update time entry request schema (all fields optional)
 */
export const updateTimeEntrySchema = z.object({
    startTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, 'Time must be in HH:MM format').optional(),
    endTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, 'Time must be in HH:MM format').optional(),
    location: z.enum(['OFFICE', 'CLIENT', 'HOME']).optional(),
    taskId: z.string().uuid('Invalid task ID').optional(),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .optional(),
});

/**
 * Batch create time entries request schema
 */
export const batchCreateTimeEntriesSchema = z.object({
    entries: z.array(createTimeEntrySchema).min(1, 'At least one entry is required'),
});

/**
 * Date path parameter schema (YYYY-MM-DD)
 */
export const dateParamSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

/**
 * Month path parameter schema (YYYY-MM)
 */
export const monthParamSchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});
