/**
 * @fileoverview Projects repository for admin project management
 * @module admin/entities/projects.repo
 */

import { prisma } from '../../../db';
import { EntityStatus, ReportType } from '@prisma/client';

/**
 * Find all projects
 * @param clientId - Optional client ID filter
 * @returns Projects list
 */
export async function findAllProjects(clientId?: string) {
    return prisma.project.findMany({
        where: clientId ? { clientId } : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            clientId: true,
            status: true,
            reportType: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            client: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    tasks: true,
                },
            },
        },
    });
}

/**
 * Find a project by ID
 * @param id - Project ID
 * @returns Project or null
 */
export async function findProjectById(id: string) {
    return prisma.project.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            clientId: true,
            status: true,
            reportType: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            client: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    tasks: true,
                },
            },
        },
    });
}

/**
 * Create a new project
 * @param data - Project creation data
 * @returns Created project
 */
export async function createProject(data: {
    name: string;
    clientId: string;
    reportType?: ReportType;
    startDate?: Date | null;
    endDate?: Date | null;
}) {
    return prisma.project.create({
        data: {
            name: data.name,
            clientId: data.clientId,
            status: EntityStatus.ACTIVE,
            reportType: data.reportType ?? ReportType.TOTAL_HOURS,
            startDate: data.startDate,
            endDate: data.endDate,
        },
        select: {
            id: true,
            name: true,
            clientId: true,
            status: true,
            reportType: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            client: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}

/**
 * Update a project
 * @param id - Project ID
 * @param data - Update data
 * @returns Updated project
 */
export async function updateProject(
    id: string,
    data: {
        name?: string;
        clientId?: string;
        startDate?: Date | null;
        endDate?: Date | null;
    }
) {
    return prisma.project.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            clientId: true,
            status: true,
            reportType: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            client: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}

/**
 * Update project status
 * @param id - Project ID
 * @param status - New status
 * @returns Updated project
 */
export async function updateProjectStatus(id: string, status: EntityStatus) {
    return prisma.project.update({
        where: { id },
        data: { status },
        select: {
            id: true,
            name: true,
            clientId: true,
            status: true,
            reportType: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            client: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}

/**
 * Update project report type
 * @param id - Project ID
 * @param reportType - New report type
 * @returns Updated project
 */
export async function updateProjectReportType(id: string, reportType: ReportType) {
    return prisma.project.update({
        where: { id },
        data: { reportType },
        select: {
            id: true,
            name: true,
            clientId: true,
            status: true,
            reportType: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            client: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}

/**
 * Find tasks that fall outside a given date range
 * @param projectId - Project ID
 * @param startDate - New start date (null means no lower bound)
 * @param endDate - New end date (null means no upper bound)
 * @returns Tasks that would be outside the new range
 */
export async function findTasksOutsideDateRange(
    projectId: string,
    startDate: Date | null,
    endDate: Date | null
) {
    // If both dates are null, no tasks will be outside the range
    if (!startDate && !endDate) {
        return [];
    }

    const whereConditions: any = {
        projectId,
        OR: [],
    };

    // Check for tasks that start before project start or end after project end
    if (startDate) {
        whereConditions.OR.push({
            startDate: {
                lt: startDate,
            },
        });
    }

    if (endDate) {
        whereConditions.OR.push({
            endDate: {
                gt: endDate,
            },
        });
    }

    // If no conditions were added, return empty array
    if (whereConditions.OR.length === 0) {
        return [];
    }

    return prisma.task.findMany({
        where: whereConditions,
        select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
        },
    });
}
