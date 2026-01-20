import { Prisma } from '@prisma/client';
import { prisma } from '../../db';
import {
    ClientSelectorDto,
    ProjectSelectorDto,
    TaskSelectorDto,
    UserAssignmentDto,
    MonthlyStatisticsDto
} from '@shared/types';

export class SelectorsRepo {
    /**
     * Get clients with optional frequency sorting
     */
    async getClients(
        userId: string,
        sort: 'alpha' | 'frequency' = 'alpha'
    ): Promise<ClientSelectorDto[]> {
        const clients = await prisma.client.findMany({
            where: {
                status: 'ACTIVE',
                // Filter by assigned tasks
                projects: {
                    some: {
                        tasks: {
                            some: {
                                taskAssignments: {
                                    some: {
                                        userId
                                    }
                                }
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Calculate usage counts if needed
        const result = await Promise.all(
            clients.map(async (client) => {
                const usageCount = sort === 'frequency'
                    ? await this.getClientUsageCount(userId, client.id)
                    : 0;

                return {
                    id: client.id,
                    name: client.name,
                    usageCount
                };
            })
        );

        if (sort === 'frequency') {
            return result.sort((a, b) => b.usageCount - a.usageCount);
        }

        return result;
    }

    /**
     * Get projects with optional frequency sorting
     */
    async getProjects(
        userId: string,
        clientId?: string,
        sort: 'alpha' | 'frequency' = 'alpha'
    ): Promise<ProjectSelectorDto[]> {
        const where: Prisma.ProjectWhereInput = {
            status: 'ACTIVE',
            // Filter by assigned tasks
            tasks: {
                some: {
                    taskAssignments: {
                        some: {
                            userId
                        }
                    }
                }
            }
        };

        if (clientId) {
            where.clientId = clientId;
        }

        const projects = await prisma.project.findMany({
            where,
            select: {
                id: true,
                name: true,
                clientId: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        const result = await Promise.all(
            projects.map(async (project) => {
                const usageCount = sort === 'frequency'
                    ? await this.getProjectUsageCount(userId, project.id)
                    : 0;

                return {
                    id: project.id,
                    name: project.name,
                    clientId: project.clientId,
                    usageCount
                };
            })
        );

        if (sort === 'frequency') {
            return result.sort((a, b) => b.usageCount - a.usageCount);
        }

        return result;
    }

    /**
     * Get tasks with optional frequency sorting
     * Returns only tasks assigned to the user
     */
    async getTasks(
        userId: string,
        projectId?: string,
        sort: 'alpha' | 'frequency' = 'alpha'
    ): Promise<TaskSelectorDto[]> {
        const where: Prisma.TaskWhereInput = {
            status: 'OPEN',
            // Filter by user assignments
            taskAssignments: {
                some: {
                    userId
                }
            }
        };

        if (projectId) {
            where.projectId = projectId;
        }

        const tasks = await prisma.task.findMany({
            where,
            select: {
                id: true,
                name: true,
                projectId: true,
                project: {
                    select: {
                        reportType: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        const result = await Promise.all(
            tasks.map(async (task) => {
                const usageCount = sort === 'frequency'
                    ? await this.getTaskUsageCount(userId, task.id)
                    : 0;

                return {
                    id: task.id,
                    name: task.name,
                    projectId: task.projectId,
                    reportType: task.project.reportType,
                    usageCount
                };
            })
        );

        if (sort === 'frequency') {
            return result.sort((a, b) => b.usageCount - a.usageCount);
        }

        return result;
    }

    /**
     * Get all task assignments for a user
     */
    async getUserAssignments(userId: string): Promise<UserAssignmentDto[]> {
        const assignments = await prisma.taskAssignment.findMany({
            where: {
                userId,
                task: {
                    status: 'OPEN'
                }
            },
            include: {
                task: {
                    include: {
                        project: {
                            include: {
                                client: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                task: {
                    name: 'asc'
                }
            }
        });

        return assignments.map(assignment => ({
            id: assignment.task.id,
            name: assignment.task.name,
            projectId: assignment.task.projectId,
            projectName: assignment.task.project.name,
            clientName: assignment.task.project.client.name,
            reportType: assignment.task.project.reportType
        }));
    }

    /**
     * Get monthly statistics for a user
     */
    async getMonthlyStatistics(userId: string, month: Date): Promise<MonthlyStatisticsDto['data']> {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        // Fetch workday summaries for the month
        const summaries = await prisma.workdaySummary.findMany({
            where: {
                userId,
                workDate: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        const totalWorkDays = summaries.length; // Or should this be potential work days? 
        // Logic: Usually totalWorkDays is working days in month. 
        // For simplicity, we'll count the summaries created (system creates them daily/lazily)
        // OR we might want to calculate based on calendar.
        // Assuming summaries exist for all relevant days.

        const submittedDays = summaries.filter(s => s.isSubmitted).length;
        const missingDays = summaries.filter(s => s.status === 'MISSING').length;

        const totalWorkMinutes = summaries.reduce((acc, curr) => acc + curr.workMinutes, 0);
        const totalAbsenceMinutes = summaries.reduce((acc, curr) => acc + curr.absenceMinutes, 0);

        // Completion percentage: (Submitted / Total Work Days) * 100
        // Or based on minutes? "completionPercentage" usually implies submission status or hour target.
        // Let's use submitted / total expected days.

        // If no summaries, return 0. (Usually service creates them).
        // Let's assume simplest calculation for now.
        const completionPercentage = totalWorkDays > 0
            ? Math.round((submittedDays / totalWorkDays) * 100)
            : 0;

        return {
            totalWorkDays,
            submittedDays,
            missingDays,
            totalWorkMinutes,
            totalAbsenceMinutes,
            completionPercentage
        };
    }

    // Helper methods for counting usage
    // We count how many non-deleted time entries the user has created for this entity
    // This could be optimized later with raw SQL if performance becomes an issue

    private async getClientUsageCount(userId: string, clientId: string): Promise<number> {
        return prisma.timeEntry.count({
            where: {
                userId,
                isDeleted: false,
                task: {
                    project: {
                        clientId
                    }
                }
            }
        });
    }

    private async getProjectUsageCount(userId: string, projectId: string): Promise<number> {
        return prisma.timeEntry.count({
            where: {
                userId,
                isDeleted: false,
                task: {
                    projectId
                }
            }
        });
    }

    private async getTaskUsageCount(userId: string, taskId: string): Promise<number> {
        return prisma.timeEntry.count({
            where: {
                userId,
                isDeleted: false,
                taskId
            }
        });
    }
}

export const selectorsRepo = new SelectorsRepo();
