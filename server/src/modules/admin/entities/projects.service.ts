/**
 * @fileoverview Projects service for admin project management
 * @module admin/entities/projects.service
 */

import { NotFoundError, ValidationError } from '../../../shared/errors';
import * as projectsRepo from './projects.repo';
import { EntityStatus, ReportType } from '@prisma/client';
import { prisma } from '../../../db';

/**
 * Transform nested Prisma project data to include flat assignedUsers array
 */
function transformProjectWithAssignedUsers(project: any) {
    const assignedUsersMap = new Map<string, { id: string; fullName: string; email: string }>();

    // Extract unique users from nested task assignments
    if (project.tasks) {
        for (const task of project.tasks) {
            if (task.assignments) {
                for (const assignment of task.assignments) {
                    if (assignment.user) {
                        assignedUsersMap.set(assignment.user.id, {
                            id: assignment.user.id,
                            fullName: assignment.user.fullName,
                            email: assignment.user.email,
                        });
                    }
                }
            }
        }
    }

    // Convert map to array
    const assignedUsers = Array.from(assignedUsersMap.values());

    // Remove tasks from the response (we only needed them for assignedUsers)
    const { tasks, ...projectWithoutTasks } = project;

    return {
        ...projectWithoutTasks,
        assignedUsers,
    };
}

/**
 * @description Retrieves all projects with optional filters.
 * @param {string} [clientId] - Optional client ID to filter by
 * @param {string} [userId] - Optional user ID to filter by (returns projects where user is assigned)
 * @returns {Promise<Array>} Projects list with assignedUsers array
 * @example
 * const projects = await listProjects();
 * const clientProjects = await listProjects('client-uuid');
 * const userProjects = await listProjects(undefined, 'user-uuid');
 */
export async function listProjects(clientId?: string, userId?: string) {
    const projects = await projectsRepo.findAllProjects(clientId, userId);
    return projects.map(transformProjectWithAssignedUsers);
}

/**
 * @description Retrieves a single project by ID.
 * @param {string} id - Project's UUID
 * @returns {Promise<Object>} Project data with assignedUsers array
 * @throws {NotFoundError} When project with given ID doesn't exist
 * @example
 * const project = await getProjectById('123e4567-e89b-12d3-a456-426614174000');
 */
export async function getProjectById(id: string) {
    const project = await projectsRepo.findProjectById(id);
    if (!project) {
        throw new NotFoundError('Project not found');
    }
    return transformProjectWithAssignedUsers(project);
}

/**
 * @description Retrieves all users assigned to a project (via task assignments).
 * @param {string} projectId - Project's UUID
 * @returns {Promise<Array>} Array of assigned users with id, fullName, and email
 * @throws {NotFoundError} When project with given ID doesn't exist
 * @example
 * const users = await getProjectUsers('123e4567-e89b-12d3-a456-426614174000');
 */
export async function getProjectUsers(projectId: string) {
    // Verify project exists
    const project = await projectsRepo.findProjectById(projectId);
    if (!project) {
        throw new NotFoundError('Project not found');
    }

    return projectsRepo.findProjectUsers(projectId);
}

/**
 * @description Creates a new project with ACTIVE status and default TOTAL_HOURS report type.
 * @param {Object} data - Project creation data
 * @param {string} data.name - Project name (1-100 chars)
 * @param {string} data.clientId - Client UUID
 * @param {ReportType} [data.reportType] - Report type (defaults to TOTAL_HOURS)
 * @param {Date} [data.startDate] - Optional start date
 * @param {Date} [data.endDate] - Optional end date
 * @returns {Promise<Object>} Created project
 * @throws {NotFoundError} When client doesn't exist
 * @throws {ValidationError} When date range is invalid
 * @example
 * const project = await createProject({
 *   name: 'Website Redesign',
 *   clientId: 'client-uuid',
 *   reportType: 'ENTRY_EXIT',
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-12-31')
 * });
 */
export async function createProject(data: {
    name: string;
    clientId: string;
    reportType?: ReportType;
    startDate?: string | null;
    endDate?: string | null;
}) {
    // Check if client exists
    const client = await prisma.client.findUnique({
        where: { id: data.clientId },
    });

    if (!client) {
        throw new ValidationError('Client not found');
    }

    // Convert string dates to Date objects
    const startDate = data.startDate ? new Date(data.startDate) : null;
    const endDate = data.endDate ? new Date(data.endDate) : null;

    // Validate date range and check for NaN (invalid dates)
    if (startDate && (isNaN(startDate.getTime()) || !startDate)) {
        throw new ValidationError('Invalid start date', 'VALIDATION_DATE_RANGE');
    }
    if (endDate && (isNaN(endDate.getTime()) || !endDate)) {
        throw new ValidationError('Invalid end date', 'VALIDATION_DATE_RANGE');
    }
    if (startDate && endDate && endDate < startDate) {
        throw new ValidationError('End date must be greater than or equal to start date', 'VALIDATION_DATE_RANGE');
    }

    const project = await projectsRepo.createProject({
        name: data.name,
        clientId: data.clientId,
        reportType: data.reportType,
        startDate,
        endDate,
    });
    return transformProjectWithAssignedUsers(project);
}

/**
 * @description Updates a project's details.
 * @param {string} id - Project's UUID
 * @param {Object} data - Fields to update (all optional)
 * @param {string} [data.name] - New name
 * @param {string} [data.clientId] - New client ID
 * @param {Date} [data.startDate] - New start date
 * @param {Date} [data.endDate] - New end date
 * @returns {Promise<Object>} Updated project
 * @throws {NotFoundError} When project or client doesn't exist
 * @throws {ValidationError} When date range is invalid or tasks fall outside new range
 * @example
 * const project = await updateProject('project-uuid', {
 *   name: 'Updated Name',
 *   endDate: new Date('2025-12-31')
 * });
 */
export async function updateProject(
    id: string,
    data: {
        name?: string;
        clientId?: string;
        startDate?: string | null;
        endDate?: string | null;
    }
) {
    // Check project exists
    const project = await projectsRepo.findProjectById(id);
    if (!project) {
        throw new NotFoundError('Project not found');
    }

    // If clientId is being changed, verify new client exists
    if (data.clientId && data.clientId !== project.clientId) {
        const client = await prisma.client.findUnique({
            where: { id: data.clientId },
        });
        if (!client) {
            throw new NotFoundError('Client not found');
        }
    }

    // Convert string dates to Date objects
    const startDate =
        data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined;
    const endDate = data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined;

    // Validate dates and check for NaN (invalid dates)
    if (startDate !== undefined && startDate !== null && (isNaN(startDate.getTime()) || !startDate)) {
        throw new ValidationError('Invalid start date', 'VALIDATION_DATE_RANGE');
    }
    if (endDate !== undefined && endDate !== null && (isNaN(endDate.getTime()) || !endDate)) {
        throw new ValidationError('Invalid end date', 'VALIDATION_DATE_RANGE');
    }

    // Determine final dates (use new values if provided, otherwise keep existing)
    const finalStartDate = startDate !== undefined ? startDate : project.startDate;
    const finalEndDate = endDate !== undefined ? endDate : project.endDate;

    // Validate date range
    if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
        throw new ValidationError('End date must be greater than or equal to start date', 'VALIDATION_DATE_RANGE');
    }

    // Check if date changes would invalidate any child tasks
    if (startDate !== undefined || endDate !== undefined) {
        const conflictingTasks = await projectsRepo.findTasksOutsideDateRange(
            id,
            finalStartDate,
            finalEndDate
        );

        if (conflictingTasks.length > 0) {
            throw new ValidationError(
                `Cannot update project dates: ${conflictingTasks.length} task(s) fall outside the new date range`,
                'VALIDATION_002',
                {
                    conflictingTasks: conflictingTasks.map((task) => ({
                        id: task.id,
                        name: task.name,
                        startDate: task.startDate,
                        endDate: task.endDate,
                    })),
                }
            );
        }
    }

    const updatedProject = await projectsRepo.updateProject(id, {
        name: data.name,
        clientId: data.clientId,
        startDate,
        endDate,
    });
    return transformProjectWithAssignedUsers(updatedProject);
}

/**
 * @description Updates a project's status (ACTIVE/INACTIVE).
 * @param {string} id - Project's UUID
 * @param {EntityStatus} status - New status
 * @returns {Promise<Object>} Updated project
 * @throws {NotFoundError} When project doesn't exist
 * @example
 * await updateProjectStatus('project-uuid', 'INACTIVE');
 */
export async function updateProjectStatus(id: string, status: EntityStatus) {
    const project = await projectsRepo.findProjectById(id);
    if (!project) {
        throw new NotFoundError('Project not found');
    }

    const updatedProject = await projectsRepo.updateProjectStatus(id, status);
    return transformProjectWithAssignedUsers(updatedProject);
}

/**
 * @description Updates a project's report type.
 * @param {string} id - Project's UUID
 * @param {ReportType} reportType - New report type
 * @returns {Promise<Object>} Updated project
 * @throws {NotFoundError} When project doesn't exist
 * @example
 * await updateProjectReportType('project-uuid', 'ENTRY_EXIT');
 */
export async function updateProjectReportType(id: string, reportType: ReportType) {
    const project = await projectsRepo.findProjectById(id);
    if (!project) {
        throw new NotFoundError('Project not found');
    }

    return projectsRepo.updateProjectReportType(id, reportType);
}
