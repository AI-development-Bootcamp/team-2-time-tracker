/**
 * @fileoverview Tasks service for admin task management
 * @module admin/entities/tasks.service
 */

import { NotFoundError, ValidationError } from '../../../shared/errors';
import * as tasksRepo from './tasks.repo';
import * as projectsRepo from './projects.repo';
import { TaskStatus } from '@prisma/client';

/**
 * @description Retrieves all tasks with optional project filter.
 * @param {string} [projectId] - Optional project ID to filter by
 * @returns {Promise<Array>} Tasks list
 * @example
 * const tasks = await listTasks();
 * const projectTasks = await listTasks('project-uuid');
 */
export async function listTasks(projectId?: string) {
    return tasksRepo.findAllTasks(projectId);
}

/**
 * @description Retrieves a single task by ID.
 * @param {string} id - Task's UUID
 * @returns {Promise<Object>} Task data
 * @throws {NotFoundError} When task with given ID doesn't exist
 * @example
 * const task = await getTaskById('123e4567-e89b-12d3-a456-426614174000');
 */
export async function getTaskById(id: string) {
    const task = await tasksRepo.findTaskById(id);
    if (!task) {
        throw new NotFoundError('Task not found');
    }
    return task;
}

/**
 * @description Creates a new task with OPEN status.
 * @param {Object} data - Task creation data
 * @param {string} data.name - Task name (1-100 chars)
 * @param {string} data.projectId - Project UUID
 * @param {Date} [data.startDate] - Optional start date
 * @param {Date} [data.endDate] - Optional end date
 * @returns {Promise<Object>} Created task
 * @throws {NotFoundError} When project doesn't exist
 * @throws {ValidationError} When date range is invalid or outside project dates
 * @example
 * const task = await createTask({
 *   name: 'Frontend Development',
 *   projectId: 'project-uuid',
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-03-31')
 * });
 */
export async function createTask(data: {
    name: string;
    projectId: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
}) {
    // Check if project exists
    const project = await projectsRepo.findProjectById(data.projectId);
    if (!project) {
        throw new ValidationError('Project not found');
    }

    // Convert string dates to Date objects
    const startDate = data.startDate ? new Date(data.startDate) : null;
    const endDate = data.endDate ? new Date(data.endDate) : null;

    // Validate date range
    if (startDate && endDate && endDate < startDate) {
        throw new ValidationError('End date must be greater than or equal to start date', 'VALIDATION_DATE_RANGE');
    }

    // Validate task dates are within project dates (if both are set)
    if (project.startDate || project.endDate) {
        if (startDate && project.startDate && startDate < project.startDate) {
            throw new ValidationError(
                'Task start date must be within project date range',
                'VALIDATION_DATE_OUT_OF_PROJECT'
            );
        }
        if (endDate && project.endDate && endDate > project.endDate) {
            throw new ValidationError('Task end date must be within project date range', 'VALIDATION_DATE_OUT_OF_PROJECT');
        }
    }

    return tasksRepo.createTask({
        name: data.name,
        projectId: data.projectId,
        description: data.description,
        startDate,
        endDate,
    });
}

/**
 * @description Updates a task's details.
 * @param {string} id - Task's UUID
 * @param {Object} data - Fields to update (all optional)
 * @param {string} [data.name] - New name
 * @param {string} [data.projectId] - New project ID
 * @param {Date} [data.startDate] - New start date
 * @param {Date} [data.endDate] - New end date
 * @returns {Promise<Object>} Updated task
 * @throws {NotFoundError} When task or project doesn't exist
 * @throws {ValidationError} When date range is invalid or outside project dates
 * @example
 * const task = await updateTask('task-uuid', {
 *   name: 'Updated Name',
 *   endDate: new Date('2024-06-30')
 * });
 */
export async function updateTask(
    id: string,
    data: {
        name?: string;
        projectId?: string;
        description?: string | null;
        startDate?: string | null;
        endDate?: string | null;
    }
) {
    // Check task exists
    const task = await tasksRepo.findTaskById(id);
    if (!task) {
        throw new NotFoundError('Task not found');
    }

    // Determine which project to validate against
    const projectId = data.projectId ?? task.projectId;

    // If projectId is being changed, verify new project exists and reuse it
    let project;
    if (data.projectId && data.projectId !== task.projectId) {
        project = await projectsRepo.findProjectById(data.projectId);
        if (!project) {
            throw new NotFoundError('Project not found');
        }
    } else {
        // Get the project for date validation
        project = await projectsRepo.findProjectById(projectId);
        if (!project) {
            throw new NotFoundError('Project not found');
        }
    }

    // Convert string dates to Date objects
    const startDate =
        data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined;
    const endDate = data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined;

    // Determine final dates
    const finalStartDate = startDate !== undefined ? startDate : task.startDate;
    const finalEndDate = endDate !== undefined ? endDate : task.endDate;

    // Validate date range
    if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
        throw new ValidationError('End date must be greater than or equal to start date', 'VALIDATION_DATE_RANGE');
    }

    // Validate task dates are within project dates (if both are set)
    if (project.startDate || project.endDate) {
        if (finalStartDate && project.startDate && finalStartDate < project.startDate) {
            throw new ValidationError(
                'Task start date must be within project date range',
                'VALIDATION_DATE_OUT_OF_PROJECT'
            );
        }
        if (finalEndDate && project.endDate && finalEndDate > project.endDate) {
            throw new ValidationError('Task end date must be within project date range', 'VALIDATION_DATE_OUT_OF_PROJECT');
        }
    }

    return tasksRepo.updateTask(id, {
        name: data.name,
        projectId: data.projectId,
        description: data.description,
        startDate,
        endDate,
    });
}

/**
 * @description Updates a task's status (OPEN/CLOSED).
 * @param {string} id - Task's UUID
 * @param {TaskStatus} status - New status
 * @returns {Promise<Object>} Updated task
 * @throws {NotFoundError} When task doesn't exist
 * @throws {ValidationError} When trying to close a task with time entries
 * @example
 * await updateTaskStatus('task-uuid', 'CLOSED');
 */
export async function updateTaskStatus(id: string, status: TaskStatus) {
    const task = await tasksRepo.findTaskById(id);
    if (!task) {
        throw new NotFoundError('Task not found');
    }

    // If closing the task, check if it has time entries
    if (status === TaskStatus.CLOSED && task.status !== TaskStatus.CLOSED) {
        const hasEntries = await tasksRepo.hasTimeEntries(id);
        if (hasEntries) {
            throw new ValidationError(
                'Cannot close task that has logged time entries',
                'VALIDATION_TASK_HAS_ENTRIES'
            );
        }
    }

    return tasksRepo.updateTaskStatus(id, status);
}
