/**
 * @fileoverview Zod validation schemas for projects endpoints
 * @module admin/entities/projects.schemas
 */

import { z } from 'zod';

/**
 * Create project request schema
 */
export const createProjectSchema = z
    .object({
        name: z.string().min(1, 'Name is required').max(100),
        clientId: z.string().uuid('Invalid client ID'),
        reportType: z.enum(['TOTAL_HOURS', 'ENTRY_EXIT']).optional(),
        startDate: z.string().date().optional().nullable(),
        endDate: z.string().date().optional().nullable(),
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
 * Update project request schema
 */
export const updateProjectSchema = z
    .object({
        name: z.string().min(1).max(100).optional(),
        clientId: z.string().uuid().optional(),
        startDate: z.string().date().optional().nullable(),
        endDate: z.string().date().optional().nullable(),
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
 * Update project status request schema
 */
export const updateProjectStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'INACTIVE']),
});

/**
 * Update project report type request schema
 */
export const updateProjectReportTypeSchema = z.object({
    reportType: z.enum(['TOTAL_HOURS', 'ENTRY_EXIT']),
});
