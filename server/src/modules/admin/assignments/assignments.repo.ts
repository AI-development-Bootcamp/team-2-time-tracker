/**
 * @fileoverview Assignments repository for admin task assignment management
 * @module admin/assignments/assignments.repo
 */

import { prisma } from '../../../db';

/**
 * @description Find all task assignments with user, task, project, and client details
 * @param {Object} [filters] - Optional filters
 * @param {string} [filters.userId] - Filter by user ID
 * @param {string} [filters.taskId] - Filter by task ID
 * @param {string} [filters.projectId] - Filter by project ID
 * @param {string} [filters.userName] - Search by user full name (case-insensitive, partial match)
 * @returns {Promise<Array>} List of task assignments with expanded details
 */
export async function findAllTaskAssignments(filters?: {
    userId?: string;
    taskId?: string;
    projectId?: string;
    userName?: string;
}) {
    return prisma.taskAssignment.findMany({
        where: {
            userId: filters?.userId,
            taskId: filters?.taskId,
            task: filters?.projectId
                ? {
                    projectId: filters.projectId,
                }
                : undefined,
            user: filters?.userName
                ? {
                    fullName: {
                        contains: filters.userName,
                        mode: 'insensitive',
                    },
                }
                : undefined,
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            userId: true,
            taskId: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            task: {
                select: {
                    id: true,
                    name: true,
                    projectId: true,
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
            },
        },
    });
}

/**
 * @description Find a task assignment by ID
 * @param {string} id - Assignment ID
 * @returns {Promise<Object|null>} Task assignment or null
 */
export async function findTaskAssignmentById(id: string) {
    return prisma.taskAssignment.findUnique({
        where: { id },
        select: {
            id: true,
            userId: true,
            taskId: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            task: {
                select: {
                    id: true,
                    name: true,
                    projectId: true,
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
            },
        },
    });
}

/**
 * @description Create a new task assignment
 * @param {Object} data - Assignment creation data
 * @param {string} data.userId - User ID
 * @param {string} data.taskId - Task ID
 * @param {string} data.assignedByAdminId - Admin user ID who created the assignment
 * @returns {Promise<Object>} Created task assignment
 */
export async function createTaskAssignment(data: {
    userId: string;
    taskId: string;
    assignedByAdminId: string;
}) {
    return prisma.taskAssignment.create({
        data: {
            userId: data.userId,
            taskId: data.taskId,
            assignedByAdminId: data.assignedByAdminId,
        },
        select: {
            id: true,
            userId: true,
            taskId: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            task: {
                select: {
                    id: true,
                    name: true,
                    projectId: true,
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
            },
        },
    });
}

/**
 * @description Delete a task assignment
 * @param {string} id - Assignment ID
 * @returns {Promise<Object>} Deleted task assignment
 */
export async function deleteTaskAssignment(id: string) {
    return prisma.taskAssignment.delete({
        where: { id },
    });
}

/**
 * @description Check if a user exists
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user exists
 */
export async function userExists(userId: string): Promise<boolean> {
    const count = await prisma.user.count({
        where: { id: userId },
    });
    return count > 0;
}

/**
 * @description Check if a task exists
 * @param {string} taskId - Task ID
 * @returns {Promise<boolean>} True if task exists
 */
export async function taskExists(taskId: string): Promise<boolean> {
    const count = await prisma.task.count({
        where: { id: taskId },
    });
    return count > 0;
}

/**
 * @description Creates multiple task assignments, skipping duplicates
 * @param {Array} assignments - Array of assignment data
 * @returns {Promise<Array>} Created assignments (duplicates skipped)
 */
export async function bulkCreateTaskAssignments(
    assignments: Array<{
        userId: string;
        taskId: string;
        assignedByAdminId: string;
    }>
) {
    const created: any[] = [];

    for (const assignment of assignments) {
        try {
            const result = await prisma.taskAssignment.create({
                data: {
                    userId: assignment.userId,
                    taskId: assignment.taskId,
                    assignedByAdminId: assignment.assignedByAdminId,
                },
                select: {
                    id: true,
                    userId: true,
                    taskId: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                    task: {
                        select: {
                            id: true,
                            name: true,
                            projectId: true,
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
                    },
                },
            });
            created.push(result);
        } catch (error: any) {
            // Skip duplicates (P2002 = unique constraint violation)
            if (error.code === 'P2002') {
                continue;
            }
            throw error;
        }
    }

    return created;
}

/**
 * @description Check if a task assignment has associated time entries
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise<boolean>} True if time entries exist
 */
export async function assignmentHasTimeEntries(assignmentId: string): Promise<boolean> {
    // Get the assignment to find userId and taskId
    const assignment = await prisma.taskAssignment.findUnique({
        where: { id: assignmentId },
        select: { userId: true, taskId: true },
    });

    if (!assignment) {
        return false;
    }

    // Check if any time entries exist for this user-task combination
    const count = await prisma.timeEntry.count({
        where: {
            userId: assignment.userId,
            taskId: assignment.taskId,
            isDeleted: false, // Only count active entries
        },
    });

    return count > 0;
}

