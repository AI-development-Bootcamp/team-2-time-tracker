import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { router } from './routes';
import { logger } from './shared/logger';
import { AppError } from './shared/errors';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

export const createApp = (): Express => {
    const app = express();

    // Request ID
    app.use(requestIdMiddleware);

    // Security Middleware
    app.use(helmet());
    app.use(cors({
        origin: env.CORS_ORIGIN.split(',').map(url => url.trim()),
        credentials: true,
    }));

    // Rate Limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per windowMs
        standardHeaders: 'draft-7',
        legacyHeaders: false,
    });
    app.use(limiter);

    // Parsing & Logging
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(compression());
    app.use(morgan('combined', {
        stream: { write: (message) => logger.http(message.trim()) },
    }));

    // Routes
    app.use('/api', router);

    // 404 Handler
    app.use((_req: Request, _res: Response, next: NextFunction) => {
        next(new AppError('Route not found', 404));
    });

    // Global Error Handler
    app.use(errorMiddleware);

    return app;
};

// Start Server if run directly
if (require.main === module) {
    const app = createApp();
    app.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
        logger.info(`Docs available at http://localhost:${env.PORT}/api/docs`);
    });
}
