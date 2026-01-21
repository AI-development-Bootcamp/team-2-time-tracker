import { z } from 'zod';
import { WorkLocation } from '../enums/locationType.enum';

/**
 * Schema for starting a timer
 */
export const startTimerSchema = z.object({
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

/**
 * Schema for stopping a timer
 */
export const stopTimerSchema = z.object({
    taskId: z.string().uuid('Invalid task ID'),
    location: z.nativeEnum(WorkLocation),
    description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be at most 500 characters'),
});
