/**
 * @fileoverview Global error handling middleware for Express application
 * @module middlewares/error.middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../shared/errors';
import { logger } from '../shared/logger';

/**
 * @description Global error handling middleware that processes all errors thrown in the application.
 * Handles different error types with appropriate status codes and response formats:
 * - ValidationError: Returns 400 with validation details
 * - AppError: Returns custom status code with error message
 * - Unknown errors: Returns 500 Internal Server Error
 *
 * @param {Error} err - The error object thrown in the application
 * @param {Request} _req - Express request object (unused)
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function (unused)
 * @returns {void}
 * @example
 * // Usage in app initialization (must be last middleware)
 * app.use(errorMiddleware);
 */
export const errorMiddleware = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Handle validation errors from Zod or custom validation
    if (err instanceof ValidationError) {
        logger.warn(`Validation Error: ${err.message}`);
        const errorResponse: {
            success: false;
            error: {
                code: string;
                message: string;
                details?: unknown;
            };
        } = {
            success: false,
            error: {
                code: err.code || err.statusCode.toString(),
                message: err.message,
            },
        };
        if (err.details !== undefined) {
            errorResponse.error.details = err.details;
        }
        res.status(err.statusCode).json(errorResponse);
        return;
    }

    // Handle application-specific operational errors
    if (err instanceof AppError) {
        logger.warn(`Operational Error: ${err.message}`);
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.statusCode.toString(),
                message: err.message,
            },
        });
        return;
    }

    // Handle unexpected errors (programming errors, system errors, etc.)
    logger.error(`Unexpected Error: ${err.message}`, { stack: err.stack, error: err });
    console.error('Full error:', err);
    res.status(500).json({
        success: false,
        error: {
            code: '500',
            message: 'Internal Server Error',
        },
    });
};
