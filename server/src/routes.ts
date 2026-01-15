import { Router } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const router: Router = Router();

// Health Check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger Docs
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes will be mounted here in future tasks
// router.use('/auth', authRoutes);
// router.use('/users', usersRoutes);

export { router };
