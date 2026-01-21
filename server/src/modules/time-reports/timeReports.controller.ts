/**
 * @fileoverview Time Reports controller handling HTTP requests
 * @module time-reports/timeReports.controller
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as timeReportsService from './timeReports.service';

/**
 * Handles creating a time entry
 * @param req - Authenticated request with time entry data
 * @param res - Express response
 * @param next - Express next function
 */
export async function create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const { workDate, startTime, endTime, location, taskId, description } = req.body;

        const result = await timeReportsService.createTimeEntry(
            req.user!.userId,
            { workDate, startTime, endTime, location, taskId, description }
        );

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles getting a single time entry
 * @param req - Authenticated request with entry ID
 * @param res - Express response
 * @param next - Express next function
 */
export async function getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = req.params;
        if (Array.isArray(id)) {
            throw new Error('Invalid ID parameter');
        }
        const result = await timeReportsService.getTimeEntryById(req.user!.userId, id);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles updating a time entry
 * @param req - Authenticated request with entry ID and update data
 * @param res - Express response
 * @param next - Express next function
 */
export async function update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = req.params;
        if (Array.isArray(id)) {
            throw new Error('Invalid ID parameter');
        }
        const updateData = req.body;

        const result = await timeReportsService.updateTimeEntry(
            req.user!.userId,
            id,
            updateData
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
 * Handles deleting a time entry (soft delete)
 * @param req - Authenticated request with entry ID
 * @param res - Express response
 * @param next - Express next function
 */
export async function deleteEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = req.params;
        if (Array.isArray(id)) {
            throw new Error('Invalid ID parameter');
        }
        const result = await timeReportsService.deleteTimeEntry(req.user!.userId, id);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles getting time entry history with filters and pagination
 * @param req - Authenticated request with query parameters
 * @param res - Express response
 * @param next - Express next function
 */
export async function getHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const filters = {
            page: parseInt(req.query.page as string) || 1,
            pageSize: Math.min(parseInt(req.query.pageSize as string) || 20, 100),
            fromDate: req.query.fromDate as string | undefined,
            toDate: req.query.toDate as string | undefined,
            clientId: req.query.clientId as string | undefined,
            projectId: req.query.projectId as string | undefined,
            taskId: req.query.taskId as string | undefined,
            location: req.query.location as string | undefined,
            submittedOnly: req.query.submittedOnly === 'true',
        };

        const result = await timeReportsService.getTimeEntryHistory(req.user!.userId, filters);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles batch creating time entries
 * @param req - Authenticated request with array of entries
 * @param res - Express response
 * @param next - Express next function
 */
export async function batchCreate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const { entries } = req.body;
        const result = await timeReportsService.batchCreateTimeEntries(req.user!.userId, entries);

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}
