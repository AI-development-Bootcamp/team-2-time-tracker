/**
 * @fileoverview Timer controller handling HTTP requests
 * @module timer/timer.controller
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as timerService from './timer.service';

/**
 * Handles starting a timer
 * @param req - Authenticated request with work date
 * @param res - Express response
 * @param next - Express next function
 */
export async function start(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const { workDate } = req.body;
        const result = await timerService.startTimer(req.user!.userId, workDate);

        res.status(201).json({
            success: true,
            data: {
                id: result.id,
                startedAt: result.startedAt.toISOString(),
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles stopping a timer
 * @param req - Authenticated request with task, location, description
 * @param res - Express response
 * @param next - Express next function
 */
export async function stop(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const { taskId, location, description } = req.body;
        const result = await timerService.stopTimer(
            req.user!.userId,
            taskId,
            location,
            description
        );

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles getting timer status
 * @param req - Authenticated request
 * @param res - Express response
 * @param next - Express next function
 */
export async function getStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const result = await timerService.getTimerStatus(req.user!.userId);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles cancelling a timer
 * @param req - Authenticated request
 * @param res - Express response
 * @param next - Express next function
 */
export async function cancel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        await timerService.cancelTimer(req.user!.userId);

        res.json({
            success: true,
            message: 'Timer cancelled successfully',
        });
    } catch (error) {
        next(error);
    }
}
