/**
 * @fileoverview Zod validation schemas for clients endpoints
 * @module admin/entities/clients.schemas
 */

import { z } from 'zod';

/**
 * Create client request schema
 */
export const createClientSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).optional(),
});

/**
 * Update client request schema
 */
export const updateClientSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
});

/**
 * Update client status request schema
 */
export const updateClientStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'INACTIVE']),
});
