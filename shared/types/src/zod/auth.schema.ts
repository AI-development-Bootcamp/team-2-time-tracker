import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'), // Security: min length handled in backend if needed, but here basic check. Actually OpenSpec says removing min length hints, but schemas usually enforce. Spec: "Description Length: Minimum 10 characters".
    rememberMe: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'), // Assuming standard policy
    confirmPassword: z.string().min(1),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1),
});
