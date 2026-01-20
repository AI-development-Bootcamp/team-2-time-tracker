import { Router } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { adminAuthRouter } from './modules/admin/auth/auth.routes';
import { clientsRouter } from './modules/admin/entities/clients.routes';
import { projectsRouter } from './modules/admin/entities/projects.routes';
import { tasksRouter } from './modules/admin/entities/tasks.routes';

const router: Router = Router();

// Root - API info
router.get('/', (_req, res) => {
    res.json({
        name: 'Time Tracker API',
        version: '1.0.0',
        docs: '/api/docs'
    });
});

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
router.use('/admin/clients', clientsRouter);
router.use('/admin/projects', projectsRouter);
router.use('/admin/tasks', tasksRouter);

export { router };
