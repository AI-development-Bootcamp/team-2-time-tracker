/**
 * @fileoverview Assignments controller for admin task assignment management
 * @module admin/assignments/assignments.controller
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware';
import * as assignmentsService from './assignments.service';

/**
 * @description List all task assignments with optional filtering
 */
export async function listTaskAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.query.userId as string | undefined;
        const taskId = req.query.taskId as string | undefined;
        const projectId = req.query.projectId as string | undefined;
        const userName = req.query.userName as string | undefined;

        const assignments = await assignmentsService.listTaskAssignments({
            userId,
            taskId,
            projectId,
            userName,
        });

        res.json({
            success: true,
            data: assignments,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @description Get a single task assignment by ID
 */
export async function getTaskAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const assignment = await assignmentsService.getTaskAssignmentById(id);

        res.json({
            success: true,
            data: assignment,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @description Create a new task assignment
 */
export async function createTaskAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { userId, taskId } = req.body;
        const assignedByAdminId = req.user!.userId; // From auth middleware

        const assignment = await assignmentsService.createTaskAssignment({
            userId,
            taskId,
            assignedByAdminId,
        });

        res.status(201).json({
            success: true,
            data: assignment,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @description Delete a task assignment
 */
export async function deleteTaskAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        await assignmentsService.deleteTaskAssignment(id);

        res.json({
            success: true,
            message: 'Task assignment deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @description Create multiple task assignments via cartesian product
 */
export async function bulkCreateTaskAssignments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const { userIds, taskIds } = req.body;
        const assignedByAdminId = req.user!.userId;

        const result = await assignmentsService.bulkCreateTaskAssignments({
            userIds,
            taskIds,
            assignedByAdminId,
        });

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}
