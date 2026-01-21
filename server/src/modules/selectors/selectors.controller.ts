import { Response, NextFunction } from 'express';
import { selectorsService } from './selectors.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import {
    GetSelectorsResponseDto,
    ClientSelectorDto,
    ProjectSelectorDto,
    TaskSelectorDto,
    UserAssignmentsDto,
    MonthlyStatisticsDto
} from '@shared/types';

export class SelectorsController {
    async getClients(
        req: AuthenticatedRequest,
        res: Response<GetSelectorsResponseDto<ClientSelectorDto>>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { sort } = req.query;

            const clients = await selectorsService.getClients(
                userId,
                sort as string
            );

            res.json({
                success: true,
                data: clients
            });
        } catch (error) {
            next(error);
        }
    }

    async getProjects(
        req: AuthenticatedRequest,
        res: Response<GetSelectorsResponseDto<ProjectSelectorDto>>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { clientId, sort } = req.query;

            const projects = await selectorsService.getProjects(
                userId,
                clientId as string,
                sort as string
            );

            res.json({
                success: true,
                data: projects
            });
        } catch (error) {
            next(error);
        }
    }

    async getTasks(
        req: AuthenticatedRequest,
        res: Response<GetSelectorsResponseDto<TaskSelectorDto>>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { projectId, sort } = req.query;

            const tasks = await selectorsService.getTasks(
                userId,
                projectId as string,
                sort as string
            );

            res.json({
                success: true,
                data: tasks
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserAssignments(
        req: AuthenticatedRequest,
        res: Response<UserAssignmentsDto>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user!.userId;
            const tasks = await selectorsService.getUserAssignments(userId);

            res.json({
                success: true,
                data: {
                    tasks,
                    totalTasks: tasks.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getMonthlyStatistics(
        req: AuthenticatedRequest,
        res: Response<MonthlyStatisticsDto>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { month } = req.params;

            const stats = await selectorsService.getMonthlyStatistics(userId, month as string);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

export const selectorsController = new SelectorsController();
