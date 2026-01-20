import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../shared/errors';
import { logger } from '../shared/logger';

export const errorMiddleware = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof ValidationError) {
        logger.warn(`Validation Error: ${err.message}`);
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code || err.statusCode.toString(),
                message: err.message,
                ...(err.details && { details: err.details }),
            },
        });
        return;
    }

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

    logger.error(`Unexpected Error: ${err.message}`, { stack: err.stack });
    res.status(500).json({
        success: false,
        error: {
            code: '500',
            message: 'Internal Server Error',
        },
    });
};
