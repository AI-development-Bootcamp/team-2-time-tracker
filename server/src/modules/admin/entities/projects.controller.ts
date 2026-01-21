/**
 * @fileoverview Projects controller for admin project management
 * @module admin/entities/projects.controller
 */

import { Request, Response, NextFunction } from 'express';
import * as projectsService from './projects.service';

/**
 * List all projects with optional filters
 */
export async function listProjects(req: Request, res: Response, next: NextFunction) {
    try {
        const { clientId, userId } = req.query;
        const projects = await projectsService.listProjects(
            clientId as string | undefined,
            userId as string | undefined
        );

        res.json({
            success: true,
            data: projects,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get a single project by ID
 */
export async function getProject(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const project = await projectsService.getProjectById(id);

        res.json({
            success: true,
            data: project,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new project
 */
export async function createProject(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, clientId, description, reportType, startDate, endDate } = req.body;
        const project = await projectsService.createProject({
            name,
            clientId,
            description,
            reportType,
            startDate,
            endDate,
        });

        res.status(201).json({
            success: true,
            data: project,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update a project
 */
export async function updateProject(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { name, clientId, description, startDate, endDate } = req.body;
        const project = await projectsService.updateProject(id, {
            name,
            clientId,
            description,
            startDate,
            endDate,
        });

        res.json({
            success: true,
            data: project,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update project status
 */
export async function updateProjectStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { status } = req.body;
        const project = await projectsService.updateProjectStatus(id, status);

        res.json({
            success: true,
            data: project,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update project report type
 */
export async function updateProjectReportType(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { reportType } = req.body;
        const project = await projectsService.updateProjectReportType(id, reportType);

        res.json({
            success: true,
            data: project,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get all users assigned to a project
 */
export async function getProjectUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const users = await projectsService.getProjectUsers(id);

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
}
