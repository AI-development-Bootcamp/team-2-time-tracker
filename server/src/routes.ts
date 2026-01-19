import { Router } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { timerRouter } from './modules/timer/timer.routes';
import { timeReportsRouter } from './modules/time-reports/timeReports.routes';
import { workdayRouter } from './modules/time-reports/workday.routes';
import { selectorsRouter } from './modules/selectors/selectors.routes';
import { myRouter } from './modules/selectors/my.routes';

const router: Router = Router();

// Health Check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Swagger Docs
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
router.use('/auth', authRouter);
router.use('/admin/users', usersRouter);
router.use('/timer', timerRouter);
router.use('/time-entries', timeReportsRouter);
router.use('/workday', workdayRouter);
router.use('/selectors', selectorsRouter);
router.use('/my', myRouter);

export { router };

