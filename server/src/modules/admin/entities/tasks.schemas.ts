/**
 * @fileoverview Zod validation schemas for tasks endpoints
 * @module admin/entities/tasks.schemas
 */

import { z } from 'zod';

/**
 * Create task request schema
 */
export const createTaskSchema = z
    .object({
        name: z.string().min(1, 'Name is required').max(100),
        projectId: z.string().uuid('Invalid project ID'),
        description: z.string().trim().max(250).optional().nullable(),
        startDate: z.union([z.string().date(), z.null()]).optional(),
        endDate: z.union([z.string().date(), z.null()]).optional(),
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
 * Update task request schema
 */
export const updateTaskSchema = z
    .object({
        name: z.string().min(1).max(100).optional(),
        projectId: z.string().uuid().optional(),
        description: z.string().trim().max(250).optional().nullable(),
        startDate: z.union([z.string().date(), z.null()]).optional(),
        endDate: z.union([z.string().date(), z.null()]).optional(),
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
 * Update task status request schema
 */
export const updateTaskStatusSchema = z.object({
    status: z.enum(['OPEN', 'CLOSED']),
});
