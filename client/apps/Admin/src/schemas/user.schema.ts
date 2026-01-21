/**
 * @fileoverview Zod validation schemas for user forms
 * @module schemas/user.schema
 */

import { z } from 'zod';
import { UserRole } from '@shared/types';

/**
 * @description Validation schema for user creation form
 * Uses firstName and lastName for better UX, combines them before sending to server
 */
export const createUserSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2, 'שם פרטי חייב להכיל לפחות 2 תווים')
        .max(50, 'שם פרטי לא יכול להכיל יותר מ-50 תווים'),
    lastName: z
        .string()
        .trim()
        .min(2, 'שם משפחה חייב להכיל לפחות 2 תווים')
        .max(50, 'שם משפחה לא יכול להכיל יותר מ-50 תווים'),
    email: z
        .string()
        .email('כתובת אימייל לא תקינה')
        .transform((v) => v.toLowerCase()),
    password: z
        .string()
        .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
        .regex(/[A-Z]/, 'סיסמה חייבת להכיל לפחות אות גדולה אחת באנגלית')
        .regex(/[a-z]/, 'סיסמה חייבת להכיל לפחות אות קטנה אחת באנגלית')
        .regex(/[0-9]/, 'סיסמה חייבת להכיל לפחות ספרה אחת'),
    role: z.enum([UserRole.EMPLOYEE, UserRole.ADMIN], ),
});

/**
 * @description Type inference from create user schema
 */
export type CreateUserFormData = z.infer<typeof createUserSchema>;
