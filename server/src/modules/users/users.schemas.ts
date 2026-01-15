/**
 * @fileoverview Zod validation schemas for users endpoints
 * @module users/users.schemas
 */

import { z } from 'zod';

/**
 * Create user request schema
 */
export const createUserSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email format').transform((v) => v.toLowerCase()),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    role: z.enum(['EMPLOYEE', 'ADMIN']),
});

/**
 * Update user request schema
 */
export const updateUserSchema = z.object({
    fullName: z.string().min(2).max(100).optional(),
    email: z.string().email().transform((v) => v.toLowerCase()).optional(),
});

/**
 * Update user status request schema
 */
export const updateUserStatusSchema = z.object({
    isActive: z.boolean(),
});

/**
 * Reset password request schema
 */
export const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    requireChangeOnLogin: z.boolean().optional().default(true),
});
