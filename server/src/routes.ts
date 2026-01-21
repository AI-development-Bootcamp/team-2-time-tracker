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
import absencesRouter from './modules/absences/absences.routes';
import healthRouter from './modules/health/health.routes';
import { adminAuthRouter } from './modules/admin/auth/auth.routes';
import { clientsRouter } from './modules/admin/entities/clients.routes';
import { projectsRouter } from './modules/admin/entities/projects.routes';
import { tasksRouter } from './modules/admin/entities/tasks.routes';
import { assignmentsRouter } from './modules/admin/assignments/assignments.routes';

const router: Router = Router();

// Health Check Routes
router.use('/health', healthRouter);

// Swagger Docs
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
router.use('/auth', authRouter);
router.use('/admin/auth', adminAuthRouter);
router.use('/admin/users', usersRouter);
router.use('/admin/clients', clientsRouter);
router.use('/admin/projects', projectsRouter);
router.use('/admin/tasks', tasksRouter);
router.use('/timer', timerRouter);
router.use('/time-entries', timeReportsRouter);
router.use('/workday', workdayRouter);
router.use('/selectors', selectorsRouter);
router.use('/my', myRouter);
router.use('/absences', absencesRouter);
router.use('/admin/assignments', assignmentsRouter);

export { router };

