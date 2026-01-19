import { Router } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import absencesRouter from './modules/absences/absences.routes';
import healthRouter from './modules/health/health.routes';

const router: Router = Router();

// Health Check Routes
router.use('/health', healthRouter);

// Swagger Docs
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
router.use('/auth', authRouter);
router.use('/admin/users', usersRouter);
router.use('/absences', absencesRouter);

export { router };
