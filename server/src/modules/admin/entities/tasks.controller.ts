/**
 * @fileoverview Tasks controller for admin task management
 * @module admin/entities/tasks.controller
 */

import { Request, Response, NextFunction } from 'express';
import * as tasksService from './tasks.service';
import { CreateTaskRequestDto } from '@shared/types';
import { listTasksQuerySchema } from '@shared/types';

/**
 * List all tasks with optional project filter
 */
export async function listTasks(req: Request, res: Response, next: NextFunction) {
    try {
        const queryResult = listTasksQuerySchema.safeParse(req.query);
        if (!queryResult.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_001',
                    message: 'Invalid query parameters',
                    fields: queryResult.error.issues,
                },
            });
        }
        const { projectId } = queryResult.data;
        const tasks = await tasksService.listTasks(projectId);

        res.json({
            success: true,
            data: tasks,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get a single task by ID
 */
export async function getTask(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const task = await tasksService.getTaskById(id);

        res.json({
            success: true,
            data: task,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new task
 */
export async function createTask(req: Request, res: Response, next: NextFunction) {
    try {
        const input: CreateTaskRequestDto = req.body;
        const task = await tasksService.createTask(input);

        res.status(201).json({
            success: true,
            data: task,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update a task
 */
export async function updateTask(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { name, projectId, startDate, endDate } = req.body;
        const task = await tasksService.updateTask(id, {
            name,
            projectId,
            startDate,
            endDate,
        });

        res.json({
            success: true,
            data: task,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update task status
 */
export async function updateTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { status } = req.body;
        const task = await tasksService.updateTaskStatus(id, status);

        res.json({
            success: true,
            data: task,
        });
    } catch (error) {
        next(error);
    }
}
