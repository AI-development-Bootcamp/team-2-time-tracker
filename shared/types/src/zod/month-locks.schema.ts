import { z } from 'zod';

// ===========================
// MONTH LOCK SCHEMAS
// ===========================

export const lockMonthSchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)'),
});

export const unlockMonthSchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)'),
});
