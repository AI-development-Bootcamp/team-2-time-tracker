/**
 * @fileoverview Zod validation schemas for timer endpoints
 * @module timer/timer.schemas
 */

import { z } from 'zod';

/**
 * Start timer request schema
 */
export const startTimerSchema = z.object({
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

/**
 * Stop timer request schema
 */
export const stopTimerSchema = z.object({
    taskId: z.string().uuid('Invalid task ID'),
    location: z.enum(['OFFICE', 'CLIENT', 'HOME'], {
        message: 'Location must be OFFICE, CLIENT, or HOME',
    }),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters'),
});

