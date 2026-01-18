/**
 * @fileoverview Request handlers for absence endpoints
 * @module absences/absences.controller
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as absencesService from './absences.service';

/**
 * Create new absence request
 * POST /api/absences
 */
export async function createAbsence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const absence = await absencesService.createAbsence(userId, req.body);
        res.status(201).json({
            success: true,
            data: absence,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * List user's absences with pagination
 * GET /api/absences
 */
export async function listAbsences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const { page, pageSize } = req.query;

        const result = await absencesService.listAbsences(
            userId,
            page ? parseInt(page as string) : 1,
            pageSize ? parseInt(pageSize as string) : 20
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
 * Get single absence by ID
 * GET /api/absences/:id
 */
export async function getAbsenceById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const id = req.params.id as string;

        const absence = await absencesService.getAbsenceById(id, userId);

        res.json({
            success: true,
            data: absence,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update absence request
 * PUT /api/absences/:id
 */
export async function updateAbsence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const id = req.params.id as string;

        const absence = await absencesService.updateAbsence(id, userId, req.body);

        res.json({
            success: true,
            data: absence,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Delete absence request
 * DELETE /api/absences/:id
 */
export async function deleteAbsence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const id = req.params.id as string;

        const result = await absencesService.deleteAbsence(id, userId);

        res.json(result);
    } catch (error) {
        next(error);
    }
}

