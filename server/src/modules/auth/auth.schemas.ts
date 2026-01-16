/**
 * @fileoverview Zod validation schemas for auth endpoints
 * @module auth/auth.schemas
 */

import { z } from 'zod';

/**
 * Login request schema
 */
export const loginSchema = z.object({
    email: z.string().email('Invalid email format').transform((v) => v.toLowerCase()),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
});

/**
 * Refresh token request schema
 */
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Change password request schema
 */
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain an uppercase letter')
            .regex(/[a-z]/, 'Password must contain a lowercase letter')
            .regex(/[0-9]/, 'Password must contain a number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
        confirmPassword: z.string().min(1, 'Confirm password is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

/**
 * Logout request schema
 */
export const logoutSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});
