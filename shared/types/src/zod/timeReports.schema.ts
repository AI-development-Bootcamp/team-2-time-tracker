import { z } from 'zod';
import { WorkLocation } from '../enums/locationType.enum';

/**
 * Date format validation (YYYY-MM-DD)
 */
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

/**
 * Time format validation (HH:MM)
 */
const timeStringSchema = z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, 'Time must be in HH:MM format');

/**
 * Schema for creating a time entry
 */
export const createTimeEntrySchema = z.object({
    workDate: dateStringSchema,
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    location: z.nativeEnum(WorkLocation),
    taskId: z.string().uuid('Invalid task ID'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be at most 500 characters'),
});

/**
 * Schema for updating a time entry (all fields optional)
 */
export const updateTimeEntrySchema = z.object({
    startTime: timeStringSchema.optional(),
    endTime: timeStringSchema.optional(),
    location: z.nativeEnum(WorkLocation).optional(),
    taskId: z.string().uuid('Invalid task ID').optional(),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be at most 500 characters')
        .optional(),
});

/**
 * Schema for batch creating time entries
 */
export const batchCreateTimeEntriesSchema = z.object({
    entries: z.array(createTimeEntrySchema).min(1, 'At least one entry is required'),
});

/**
 * Schema for time entry history query parameters
 */
export const timeEntryHistoryQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    fromDate: dateStringSchema.optional(),
    toDate: dateStringSchema.optional(),
    clientId: z.string().uuid('Invalid client ID').optional(),
    projectId: z.string().uuid('Invalid project ID').optional(),
    taskId: z.string().uuid('Invalid task ID').optional(),
    location: z.nativeEnum(WorkLocation).optional(),
    submittedOnly: z.coerce.boolean().optional(),
});

/**
 * Inferred types from schemas
 */
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type BatchCreateTimeEntriesInput = z.infer<typeof batchCreateTimeEntriesSchema>;
export type TimeEntryHistoryQuery = z.infer<typeof timeEntryHistoryQuerySchema>;
