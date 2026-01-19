import { Router } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { adminAuthRouter } from './modules/admin/auth/auth.routes';

const router: Router = Router();

// Health Check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Swagger Docs
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
router.use('/auth', authRouter);
router.use('/admin/auth', adminAuthRouter);
router.use('/admin/users', usersRouter);

export { router };
