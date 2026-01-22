/**
 * @fileoverview Request ID middleware for tracking requests across the application
 * @module middlewares/requestId.middleware
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Extends the Express Request interface to include requestId property.
 * This allows TypeScript to recognize req.requestId throughout the application.
 */
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            requestId?: string;
        }
    }
}

/**
 * @description Middleware to add a unique request ID to each incoming request.
 * If the client provides an X-Request-Id header, it will be used; otherwise, a new UUID is generated.
 * The request ID is attached to the request object and returned in the response headers.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 * @example
 * // Usage in app initialization
 * app.use(requestIdMiddleware);
 */
export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Use client-provided request ID or generate a new one
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
};
