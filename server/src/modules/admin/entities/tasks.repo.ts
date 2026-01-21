/**
 * @fileoverview Tasks repository for admin task management
 * @module admin/entities/tasks.repo
 */

import { prisma } from '../../../db';
import { TaskStatus } from '@prisma/client';

/**
 * Find all tasks
 * @param projectId - Optional project ID filter
 * @returns Tasks list
 */
export async function findAllTasks(projectId?: string) {
    return prisma.task.findMany({
        where: projectId ? { projectId } : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            projectId: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            project: {
                select: {
                    id: true,
                    name: true,
                    clientId: true,
                    startDate: true,
                    endDate: true,
                    client: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    assignments: true,
                    timeEntries: true,
                },
            },
        },
    });
}

/**
 * Find a task by ID
 * @param id - Task ID
 * @returns Task or null
 */
export async function findTaskById(id: string) {
    return prisma.task.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            projectId: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            project: {
                select: {
                    id: true,
                    name: true,
                    clientId: true,
                    startDate: true,
                    endDate: true,
                    client: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    assignments: true,
                    timeEntries: true,
                },
            },
        },
    });
}

/**
 * Create a new task
 * @param data - Task creation data
 * @returns Created task
 */
export async function createTask(data: {
    name: string;
    projectId: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
}) {
    return prisma.task.create({
        data: {
            name: data.name,
            projectId: data.projectId,
            description: data.description,
            status: TaskStatus.OPEN,
            startDate: data.startDate,
            endDate: data.endDate,
        },
        select: {
            id: true,
            name: true,
            projectId: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            project: {
                select: {
                    id: true,
                    name: true,
                    clientId: true,
                    client: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Update a task
 * @param id - Task ID
 * @param data - Update data
 * @returns Updated task
 */
export async function updateTask(
    id: string,
    data: {
        name?: string;
        projectId?: string;
        description?: string | null;
        startDate?: Date | null;
        endDate?: Date | null;
    }
) {
    return prisma.task.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            projectId: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            project: {
                select: {
                    id: true,
                    name: true,
                    clientId: true,
                    client: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Update task status
 * @param id - Task ID
 * @param status - New status
 * @returns Updated task
 */
export async function updateTaskStatus(id: string, status: TaskStatus) {
    return prisma.task.update({
        where: { id },
        data: { status },
        select: {
            id: true,
            name: true,
            projectId: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            project: {
                select: {
                    id: true,
                    name: true,
                    clientId: true,
                    client: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Check if task has any time entries
 * @param taskId - Task ID
 * @returns True if task has time entries
 */
export async function hasTimeEntries(taskId: string): Promise<boolean> {
    const count = await prisma.timeEntry.count({
        where: {
            taskId,
            isDeleted: false,
        },
    });
    return count > 0;
}
