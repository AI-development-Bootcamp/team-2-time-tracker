/**
 * @fileoverview Zod validation schemas for client forms
 * @module schemas/client.schema
 */

import { z } from 'zod';

/**
 * @description Validation schema for client creation form
 */
export const createClientSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'שם לקוח הוא שדה חובה')
        .max(100, 'שם לקוח לא יכול להכיל יותר מ-100 תווים'),
    description: z
        .string()
        .trim()
        .max(250, 'תיאור לא יכול להכיל יותר מ-250 תווים')
        .optional()
        .or(z.literal('')),
});

/**
 * @description Type inference from create client schema
 */
export type CreateClientFormData = z.infer<typeof createClientSchema>;
