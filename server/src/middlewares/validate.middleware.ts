/**
 * @fileoverview Request validation middleware using Zod schemas
 * @module middlewares/validate.middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { BadRequestError } from '../shared/errors';

/**
 * @description Middleware factory that creates validation middleware for request data.
 * Uses Zod schemas to validate and type-check request body, query parameters, or route parameters.
 * On validation failure, returns a 400 Bad Request with detailed error messages.
 *
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Part of the request to validate (default: 'body')
 * @returns {Function} Express middleware function
 * @throws {BadRequestError} When validation fails with formatted error messages
 * @example
 * // Validate request body
 * const createUserSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8)
 * });
 * router.post('/users', validate(createUserSchema), controller.createUser);
 *
 * @example
 * // Validate query parameters
 * const querySchema = z.object({
 *   page: z.string().regex(/^\d+$/),
 *   limit: z.string().regex(/^\d+$/)
 * });
 * router.get('/users', validate(querySchema, 'query'), controller.listUsers);
 */
export const validate =
    (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
        (req: Request, _res: Response, next: NextFunction): void => {
            try {
                // Parse and validate the data from the specified source
                const data = schema.parse(req[source]);
                // Only reassign for body (query and params are read-only in Express)
                if (source === 'body') {
                    req[source] = data;
                }
                next();
            } catch (error) {
                // Handle Zod validation errors
                if (error instanceof ZodError) {
                    const formattedErrors = error.issues.map((issue: ZodIssue) => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    }));
                    next(
                        new BadRequestError(
                            `Validation failed: ${formattedErrors.map((e: { message: string }) => e.message).join(', ')}`
                        )
                    );
                    return;
                }
                // Pass other errors to error handling middleware
                next(error);
            }
        };
