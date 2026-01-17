import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { BadRequestError } from '../shared/errors';

export const validate =
    (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
        (req: Request, _res: Response, next: NextFunction): void => {
            try {
                const data = schema.parse(req[source]);
                req[source] = data;
                next();
            } catch (error) {
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
                next(error);
            }
        };
