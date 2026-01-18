/**
 * @fileoverview Time Reports repository for database operations
 * @module time-reports/timeReports.repo
 */

import { prisma } from '../../db';
import { Prisma } from '@prisma/client';

/**
 * Find a time entry by ID with full related data
 * @param id - The time entry ID
 * @returns The time entry with task, project, and client data
 */
export async function findTimeEntryById(id: string) {
    return prisma.timeEntry.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            task: {
                include: {
                    project: {
                        include: {
                            client: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Create a new time entry
 * @param data - Time entry creation data
 * @returns The created time entry with full related data
 */
export async function createTimeEntry(data: Prisma.TimeEntryCreateInput) {
    return prisma.timeEntry.create({
        data,
        include: {
            task: {
                include: {
                    project: {
                        include: {
                            client: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Update a time entry
 * @param id - The time entry ID
 * @param data - The data to update
 * @returns The updated time entry with full related data
 */
export async function updateTimeEntry(
    id: string,
    data: Prisma.TimeEntryUpdateInput
) {
    return prisma.timeEntry.update({
        where: { id },
        data,
        include: {
            task: {
                include: {
                    project: {
                        include: {
                            client: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Soft delete a time entry
 * @param id - The time entry ID
 * @param deletedByUserId - The ID of the user performing the deletion
 * @returns The soft-deleted entry
 */
export async function softDeleteTimeEntry(id: string, deletedByUserId: string) {
    return prisma.timeEntry.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedByUserId,
        },
    });
}

/**
 * Find time entries with filters and pagination
 * @param userId - The user ID
 * @param filters - Query filters
 * @returns Paginated time entries
 */
export async function findTimeEntriesWithFilters(
    userId: string,
    filters: {
        page: number;
        pageSize: number;
        fromDate?: string;
        toDate?: string;
        clientId?: string;
        projectId?: string;
        taskId?: string;
        location?: string;
        submittedOnly?: boolean;
    }
) {
    const { page, pageSize, fromDate, toDate, clientId, projectId, taskId, location, submittedOnly } = filters;

    const where: Prisma.TimeEntryWhereInput = {
        userId,
        isDeleted: false,
    };

    // Build date filter
    if (fromDate || toDate) {
        const dateFilter: any = {};
        if (fromDate) {
            dateFilter.gte = new Date(fromDate);
        }
        if (toDate) {
            dateFilter.lte = new Date(toDate);
        }
        where.workDate = dateFilter;
    }

    if (taskId) {
        where.taskId = taskId;
    }
    if (location) {
        where.location = location as 'OFFICE' | 'CLIENT' | 'HOME';
    }

    // Build task filter for project/client filtering
    if (clientId && projectId) {
        where.task = {
            projectId,
            project: { clientId },
        } as any;
    } else if (projectId) {
        where.task = { projectId } as any;
    } else if (clientId) {
        where.task = {
            project: { clientId },
        } as any;
    }

    // For submitted only, we need to join with workday summaries
    if (submittedOnly) {
        // This will be handled in the service layer with additional queries
    }

    const skip = (page - 1) * pageSize;

    const [entries, total] = await Promise.all([
        prisma.timeEntry.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: [
                { workDate: 'desc' },
                { startTime: 'desc' },
            ],
            include: {
                task: {
                    include: {
                        project: {
                            include: {
                                client: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.timeEntry.count({ where }),
    ]);

    return { entries, total };
}

/**
 * Find a running timer for a user
 * @param userId - The user ID
 * @returns The running timer if found, null otherwise
 */
export async function findRunningTimer(userId: string) {
    return prisma.timer.findFirst({
        where: {
            userId,
            isRunning: true,
        },
    });
}

/**
 * Check if a month is locked for a given date
 * @param date - The date to check
 * @returns The MonthLock if the month is locked, null otherwise
 */
export async function findMonthLock(date: Date) {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);

    return prisma.monthLock.findFirst({
        where: {
            month: monthStart,
            unlockedAt: null,
        },
    });
}

/**
 * Find a task assignment for a user
 * @param userId - The user ID
 * @param taskId - The task ID
 * @returns The task assignment if found, null otherwise
 */
export async function findTaskAssignment(userId: string, taskId: string) {
    return prisma.taskAssignment.findFirst({
        where: {
            userId,
            taskId,
        },
    });
}

/**
 * Find or create workday summary
 * @param userId - The user ID
 * @param workDate - The work date
 * @returns The workday summary
 */
export async function findWorkdaySummary(userId: string, workDate: Date) {
    return prisma.workdaySummary.findUnique({
        where: {
            userId_workDate: {
                userId,
                workDate,
            },
        },
    });
}

/**
 * Update workday summary work minutes
 * @param userId - The user ID
 * @param workDate - The work date
 * @param minutesDelta - Change in minutes (can be negative)
 * @returns The updated workday summary
 */
export async function updateWorkdaySummaryMinutes(
    userId: string,
    workDate: Date,
    minutesDelta: number
) {
    return prisma.workdaySummary.upsert({
        where: {
            userId_workDate: {
                userId,
                workDate,
            },
        },
        create: {
            userId,
            workDate,
            workMinutes: Math.max(0, minutesDelta),
        },
        update: {
            workMinutes: {
                increment: minutesDelta,
            },
        },
    });
}

/**
 * Get task with project and client info including reportType
 * @param taskId - The task ID
 * @returns The task with project reportType
 */
export async function findTaskWithProject(taskId: string) {
    return prisma.task.findUnique({
        where: { id: taskId },
        include: {
            project: {
                include: {
                    client: true,
                },
            },
        },
    });
}

/**
 * Check if ENTRY_EXIT entry already exists for project on date
 * @param userId - The user ID
 * @param projectId - The project ID
 * @param workDate - The work date
 * @param excludeEntryId - Optional entry ID to exclude (for updates)
 * @returns The existing entry if found, null otherwise
 */
export async function findEntryExitForProject(
    userId: string,
    projectId: string,
    workDate: Date,
    excludeEntryId?: string
) {
    const where: Prisma.TimeEntryWhereInput = {
        userId,
        workDate,
        isDeleted: false,
        task: {
            projectId,
        },
    };

    if (excludeEntryId) {
        where.id = { not: excludeEntryId };
    }

    return prisma.timeEntry.findFirst({
        where,
        include: {
            task: {
                include: {
                    project: true,
                },
            },
        },
    });
}
