/**
 * @fileoverview Time Reports service with business logic
 * @module time-reports/timeReports.service
 */

import { BadRequestError, NotFoundError, ForbiddenError } from '../../shared/errors';
import * as timeReportsRepo from './timeReports.repo';
import { prisma } from '../../db';

const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 500;

/**
 * Format a Date object to HH:MM string
 */
function formatTime(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Parse time string (HH:MM) and combine with date
 */
function parseTimeWithDate(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setUTCHours(hours, minutes, 0, 0);
    return result;
}

/**
 * Calculate duration in minutes between two time strings
 */
function calculateDuration(startTimeStr: string, endTimeStr: string): number {
    const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
    const [endHours, endMinutes] = endTimeStr.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return endTotalMinutes - startTotalMinutes;
}

/**
 * Format a time entry for response
 */
function formatTimeEntryResponse(entry: any) {
    return {
        id: entry.id,
        workDate: entry.workDate.toISOString().split('T')[0],
        startTime: formatTime(entry.startTime),
        endTime: formatTime(entry.endTime),
        durationMinutes: entry.durationMinutes,
        location: entry.location,
        description: entry.description,
        source: entry.source,
        task: {
            id: entry.task.id,
            name: entry.task.name,
            project: {
                id: entry.task.project.id,
                name: entry.task.project.name,
            },
            client: {
                id: entry.task.project.client.id,
                name: entry.task.project.client.name,
            },
        },
    };
}

/**
 * @description Creates a new time entry
 * @param {string} userId - User's UUID
 * @param {object} data - Time entry data
 * @returns {Promise<TimeEntry>} Created time entry
 * @throws {BadRequestError} When validation fails
 */
export async function createTimeEntry(
    userId: string,
    data: {
        workDate: string;
        startTime: string;
        endTime: string;
        location: string;
        taskId: string;
        description: string;
    }
) {
    const { workDate, startTime, endTime, location, taskId, description } = data;

    // Validate timer is not running
    const runningTimer = await timeReportsRepo.findRunningTimer(userId);
    if (runningTimer) {
        throw new BadRequestError('Cannot create manual entry while timer is running');
    }

    // Parse work date
    const workDateObj = new Date(workDate);

    // Validate future dates are blocked
    // Use UTC to avoid timezone issues
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const workDateUTC = new Date(Date.UTC(workDateObj.getFullYear(), workDateObj.getMonth(), workDateObj.getDate()));

    if (workDateUTC > todayUTC) {
        throw new BadRequestError('Cannot create time entry for future dates');
    }

    // Check if month is locked
    const monthLock = await timeReportsRepo.findMonthLock(workDateObj);
    if (monthLock) {
        throw new BadRequestError('Cannot create entry: month is locked');
    }

    // Validate task is assigned to user and fetch task with project info
    const taskAssignment = await timeReportsRepo.findTaskAssignment(userId, taskId);
    if (!taskAssignment) {
        throw new BadRequestError('Task is not assigned to you');
    }

    // Fetch the task with project to check reportType
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            project: true,
        },
    });

    if (!task) {
        throw new BadRequestError('Task not found');
    }

    // Validate endTime > startTime
    const durationMinutes = calculateDuration(startTime, endTime);
    if (durationMinutes <= 0) {
        throw new BadRequestError('End time must be after start time');
    }

    // ENTRY_EXIT validation
    if (task.project.reportType === 'ENTRY_EXIT') {
        // Check if an entry already exists for this project on this date
        const existingEntry = await prisma.timeEntry.findFirst({
            where: {
                userId,
                workDate: workDateObj,
                isDeleted: false,
                task: {
                    projectId: task.projectId,
                },
            },
        });

        if (existingEntry) {
            throw new BadRequestError('Only one entry per day allowed for ENTRY_EXIT projects');
        }
    }

    // Validate description length
    if (description.length < DESCRIPTION_MIN_LENGTH) {
        throw new BadRequestError(`Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`);
    }
    if (description.length > DESCRIPTION_MAX_LENGTH) {
        throw new BadRequestError(`Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`);
    }

    // Parse times
    const startTimeObj = parseTimeWithDate(workDateObj, startTime);
    const endTimeObj = parseTimeWithDate(workDateObj, endTime);

    // Use transaction to create entry and update workday summary
    const result = await prisma.$transaction(async (tx: any) => {
        // Create time entry
        const timeEntry = await tx.timeEntry.create({
            data: {
                userId,
                workDate: workDateObj,
                startTime: startTimeObj,
                endTime: endTimeObj,
                durationMinutes,
                taskId,
                location: location as 'OFFICE' | 'CLIENT' | 'HOME',
                description,
                source: 'MANUAL',
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

        // Update workday summary
        await tx.workdaySummary.upsert({
            where: {
                userId_workDate: {
                    userId,
                    workDate: workDateObj,
                },
            },
            create: {
                userId,
                workDate: workDateObj,
                workMinutes: durationMinutes,
            },
            update: {
                workMinutes: {
                    increment: durationMinutes,
                },
            },
        });

        return timeEntry;
    });

    return formatTimeEntryResponse(result);
}

/**
 * @description Gets a single time entry by ID
 * @param {string} userId - User's UUID
 * @param {string} entryId - Time entry ID
 * @returns {Promise<TimeEntry>} Time entry data
 * @throws {NotFoundError} When entry not found
 * @throws {ForbiddenError} When entry doesn't belong to user
 */
export async function getTimeEntryById(userId: string, entryId: string) {
    const entry = await timeReportsRepo.findTimeEntryById(entryId);

    if (!entry) {
        throw new NotFoundError('Time entry not found');
    }

    if (entry.userId !== userId) {
        throw new ForbiddenError('You do not have access to this time entry');
    }

    return formatTimeEntryResponse(entry);
}

/**
 * @description Updates a time entry
 * @param {string} userId - User's UUID
 * @param {string} entryId - Time entry ID
 * @param {object} updateData - Data to update
 * @returns {Promise<TimeEntry>} Updated time entry
 * @throws {NotFoundError} When entry not found
 * @throws {ForbiddenError} When entry doesn't belong to user
 * @throws {BadRequestError} When validation fails
 */
export async function updateTimeEntry(
    userId: string,
    entryId: string,
    updateData: {
        workDate?: string; // Accept but reject if provided
        startTime?: string;
        endTime?: string;
        location?: string;
        taskId?: string;
        description?: string;
    }
) {
    // Validate workDate is not being changed (immutable)
    if (updateData.workDate !== undefined) {
        throw new BadRequestError('Cannot change workDate on existing entry (workDate is immutable)');
    }

    // Find existing entry
    const existingEntry = await timeReportsRepo.findTimeEntryById(entryId);

    if (!existingEntry) {
        throw new NotFoundError('Time entry not found');
    }

    if (existingEntry.userId !== userId) {
        throw new ForbiddenError('You do not have access to this time entry');
    }

    // Check if month is locked
    const monthLock = await timeReportsRepo.findMonthLock(existingEntry.workDate);
    if (monthLock) {
        throw new BadRequestError('Cannot update entry: month is locked');
    }

    // Validate task assignment if taskId is being changed, and fetch task info
    let task;
    if (updateData.taskId && updateData.taskId !== existingEntry.taskId) {
        const taskAssignment = await timeReportsRepo.findTaskAssignment(userId, updateData.taskId);
        if (!taskAssignment) {
            throw new BadRequestError('Task is not assigned to you');
        }

        // Fetch new task with project info
        task = await prisma.task.findUnique({
            where: { id: updateData.taskId },
            include: { project: true },
        });

        if (!task) {
            throw new BadRequestError('Task not found');
        }
    } else {
        // Fetch current task with project info
        task = await prisma.task.findUnique({
            where: { id: existingEntry.taskId },
            include: { project: true },
        });

        if (!task) {
            throw new BadRequestError('Task not found');
        }
    }

    // Validate description if provided
    if (updateData.description) {
        if (updateData.description.length < DESCRIPTION_MIN_LENGTH) {
            throw new BadRequestError(`Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`);
        }
        if (updateData.description.length > DESCRIPTION_MAX_LENGTH) {
            throw new BadRequestError(`Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`);
        }
    }

    // Calculate new duration if times are being updated
    const startTimeStr = updateData.startTime || formatTime(existingEntry.startTime);
    const endTimeStr = updateData.endTime || formatTime(existingEntry.endTime);
    const newDurationMinutes = calculateDuration(startTimeStr, endTimeStr);

    if (newDurationMinutes <= 0) {
        throw new BadRequestError('End time must be after start time');
    }

    // ENTRY_EXIT validation
    if (task.project.reportType === 'ENTRY_EXIT') {
        // If taskId is changing, check no other entry exists for the new project on this date
        if (updateData.taskId && updateData.taskId !== existingEntry.taskId) {
            const existingProjectEntry = await prisma.timeEntry.findFirst({
                where: {
                    userId,
                    workDate: existingEntry.workDate,
                    isDeleted: false,
                    id: { not: entryId }, // Exclude current entry
                    task: {
                        projectId: task.projectId,
                    },
                },
            });

            if (existingProjectEntry) {
                throw new BadRequestError('Only one entry per day allowed for ENTRY_EXIT projects');
            }
        }
    }

    const oldDurationMinutes = existingEntry.durationMinutes;
    const minutesDelta = newDurationMinutes - oldDurationMinutes;

    // Prepare update object
    const updateObj: any = {};
    if (updateData.startTime) {
        updateObj.startTime = parseTimeWithDate(existingEntry.workDate, updateData.startTime);
    }
    if (updateData.endTime) {
        updateObj.endTime = parseTimeWithDate(existingEntry.workDate, updateData.endTime);
    }
    if (updateData.location) {
        updateObj.location = updateData.location;
    }
    if (updateData.taskId) {
        updateObj.taskId = updateData.taskId;
    }
    if (updateData.description) {
        updateObj.description = updateData.description;
    }

    // Always update duration if times changed
    if (minutesDelta !== 0) {
        updateObj.durationMinutes = newDurationMinutes;
    }

    // Use transaction to update entry and workday summary
    const result = await prisma.$transaction(async (tx: any) => {
        const updatedEntry = await tx.timeEntry.update({
            where: { id: entryId },
            data: updateObj,
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

        // Update workday summary if duration changed
        if (minutesDelta !== 0) {
            await tx.workdaySummary.upsert({
                where: {
                    userId_workDate: {
                        userId,
                        workDate: existingEntry.workDate,
                    },
                },
                create: {
                    userId,
                    workDate: existingEntry.workDate,
                    workMinutes: Math.max(0, minutesDelta),
                },
                update: {
                    workMinutes: {
                        increment: minutesDelta,
                    },
                },
            });
        }

        return updatedEntry;
    });

    return formatTimeEntryResponse(result);
}

/**
 * @description Soft deletes a time entry
 * @param {string} userId - User's UUID
 * @param {string} entryId - Time entry ID
 * @returns {Promise<{id: string, isDeleted: boolean}>}
 * @throws {NotFoundError} When entry not found
 * @throws {ForbiddenError} When entry doesn't belong to user
 * @throws {BadRequestError} When month is locked
 */
export async function deleteTimeEntry(userId: string, entryId: string) {
    const entry = await timeReportsRepo.findTimeEntryById(entryId);

    if (!entry) {
        throw new NotFoundError('Time entry not found');
    }

    if (entry.userId !== userId) {
        throw new ForbiddenError('You do not have access to this time entry');
    }

    // Check if month is locked
    const monthLock = await timeReportsRepo.findMonthLock(entry.workDate);
    if (monthLock) {
        throw new BadRequestError('Cannot delete entry: month is locked');
    }

    // Use transaction to soft delete and update workday summary
    await prisma.$transaction(async (tx: any) => {
        await tx.timeEntry.update({
            where: { id: entryId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedByUserId: userId,
            },
        });

        // Decrement workday summary
        await tx.workdaySummary.update({
            where: {
                userId_workDate: {
                    userId,
                    workDate: entry.workDate,
                },
            },
            data: {
                workMinutes: {
                    decrement: entry.durationMinutes,
                },
            },
        });
    });

    return {
        id: entryId,
        isDeleted: true,
    };
}

/**
 * @description Gets time entry history with filters and pagination
 * @param {string} userId - User's UUID
 * @param {object} filters - Query filters
 * @returns {Promise<{entries: TimeEntry[], pagination: object}>}
 */
export async function getTimeEntryHistory(
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
    const { entries, total } = await timeReportsRepo.findTimeEntriesWithFilters(userId, filters);

    const formattedEntries = entries.map(formatTimeEntryResponse);

    const totalPages = Math.ceil(total / filters.pageSize);

    return {
        entries: formattedEntries,
        pagination: {
            page: filters.page,
            pageSize: filters.pageSize,
            total,
            totalPages,
            hasNext: filters.page < totalPages,
            hasPrev: filters.page > 1,
        },
    };
}

/**
 * @description Creates multiple time entries (batch)
 * @param {string} userId - User's UUID
 * @param {Array} entries - Array of time entry data
 * @returns {Promise<{created: TimeEntry[], workday: object}>}
 * @throws {BadRequestError} When validation fails
 */
export async function batchCreateTimeEntries(
    userId: string,
    entries: Array<{
        workDate: string;
        startTime: string;
        endTime: string;
        location: string;
        taskId: string;
        description: string;
    }>
) {
    // Validate timer is not running
    const runningTimer = await timeReportsRepo.findRunningTimer(userId);
    if (runningTimer) {
        throw new BadRequestError('Cannot create manual entries while timer is running');
    }

    // Validate all entries are on the same date
    const workDates = [...new Set(entries.map(e => e.workDate))];
    if (workDates.length > 1) {
        throw new BadRequestError('Batch entries must all be on the same date');
    }

    const workDate = workDates[0];
    const workDateObj = new Date(workDate);

    // Validate future dates are blocked
    // Use UTC to avoid timezone issues
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const workDateUTC = new Date(Date.UTC(workDateObj.getFullYear(), workDateObj.getMonth(), workDateObj.getDate()));

    if (workDateUTC > todayUTC) {
        throw new BadRequestError('Cannot create time entries for future dates');
    }

    // Check if month is locked
    const monthLock = await timeReportsRepo.findMonthLock(workDateObj);
    if (monthLock) {
        throw new BadRequestError('Cannot create entries: month is locked');
    }

    // Validate all tasks and fetch details with project info
    const taskIds = entries.map(e => e.taskId);
    const uniqueTaskIds = [...new Set(taskIds)];
    const taskMap = new Map();

    for (const taskId of uniqueTaskIds) {
        const assignment = await timeReportsRepo.findTaskAssignment(userId, taskId);
        if (!assignment) {
            throw new BadRequestError(`Task ${taskId} is not assigned to you`);
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });

        if (!task) {
            throw new BadRequestError(`Task ${taskId} not found`);
        }
        taskMap.set(taskId, task);
    }

    // Validate ENTRY_EXIT restrictions regarding duplicates within batch and existing DB entries
    const entryExitProjectsInBatch = new Set<string>();

    for (const entry of entries) {
        const task = taskMap.get(entry.taskId);
        if (task.project.reportType === 'ENTRY_EXIT') {
            // Check duplicates within batch
            if (entryExitProjectsInBatch.has(task.projectId)) {
                throw new BadRequestError(`Batch contains multiple entries for ENTRY_EXIT project '${task.project.name}'. Only one allowed per day.`);
            }
            entryExitProjectsInBatch.add(task.projectId);
        }
    }

    // Check against existing DB entries for ENTRY_EXIT projects
    if (entryExitProjectsInBatch.size > 0) {
        const existingEntries = await prisma.timeEntry.findMany({
            where: {
                userId,
                workDate: workDateObj,
                isDeleted: false,
                task: {
                    projectId: { in: Array.from(entryExitProjectsInBatch) }
                }
            },
            include: { task: { include: { project: true } } }
        });

        if (existingEntries.length > 0) {
            const projectNames = existingEntries.map((e: { task: { project: { name: string } } }) => e.task.project.name).join(', ');
            throw new BadRequestError(`Entry already exists for ENTRY_EXIT project(s): ${projectNames}. Only one per day allowed.`);
        }
    }

    // Detect time overlaps for same task
    // (Allow overlaps for different tasks as per requirements)
    for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
            if (entries[i].taskId === entries[j].taskId) {
                const start1 = calculateDuration('00:00', entries[i].startTime);
                const end1 = calculateDuration('00:00', entries[i].endTime);
                const start2 = calculateDuration('00:00', entries[j].startTime);
                const end2 = calculateDuration('00:00', entries[j].endTime);

                if ((start1 < end2 && end1 > start2)) {
                    throw new BadRequestError('Time entries for the same task cannot overlap');
                }
            }
        }
    }

    // Create all entries in transaction
    let totalMinutes = 0;

    const result = await prisma.$transaction(async (tx: any) => {
        const createdEntries = [];

        for (const entryData of entries) {
            const { startTime, endTime, location, taskId, description } = entryData;

            // Validate description
            if (description.length < DESCRIPTION_MIN_LENGTH || description.length > DESCRIPTION_MAX_LENGTH) {
                throw new BadRequestError(`Description must be between ${DESCRIPTION_MIN_LENGTH} and ${DESCRIPTION_MAX_LENGTH} characters`);
            }

            const durationMinutes = calculateDuration(startTime, endTime);
            if (durationMinutes <= 0) {
                throw new BadRequestError('End time must be after start time');
            }

            totalMinutes += durationMinutes;

            const startTimeObj = parseTimeWithDate(workDateObj, startTime);
            const endTimeObj = parseTimeWithDate(workDateObj, endTime);

            const timeEntry = await tx.timeEntry.create({
                data: {
                    userId,
                    workDate: workDateObj,
                    startTime: startTimeObj,
                    endTime: endTimeObj,
                    durationMinutes,
                    taskId,
                    location: location as 'OFFICE' | 'CLIENT' | 'HOME',
                    description,
                    source: 'MANUAL',
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

            createdEntries.push(timeEntry);
        }

        // Update workday summary
        const workdaySummary = await tx.workdaySummary.upsert({
            where: {
                userId_workDate: {
                    userId,
                    workDate: workDateObj,
                },
            },
            create: {
                userId,
                workDate: workDateObj,
                workMinutes: totalMinutes,
            },
            update: {
                workMinutes: {
                    increment: totalMinutes,
                },
            },
        });

        return { createdEntries, workdaySummary };
    });

    return {
        created: result.createdEntries.map(formatTimeEntryResponse),
        workday: {
            targetMinutes: result.workdaySummary.targetMinutes,
            workMinutes: result.workdaySummary.workMinutes,
            absenceMinutes: result.workdaySummary.absenceMinutes,
            totalMinutes: result.workdaySummary.workMinutes + result.workdaySummary.absenceMinutes,
            balanceMinutes: (result.workdaySummary.workMinutes + result.workdaySummary.absenceMinutes) - result.workdaySummary.targetMinutes,
            completionPercentage: Math.round(
                ((result.workdaySummary.workMinutes + result.workdaySummary.absenceMinutes) / result.workdaySummary.targetMinutes) * 100
            ),
            isLocked: result.workdaySummary.isLocked,
            lockedMonthId: result.workdaySummary.lockedMonthId,
            isSubmitted: result.workdaySummary.isSubmitted,
            submittedAt: result.workdaySummary.submittedAt?.toISOString() || null,
            requiresExactTotal: result.workdaySummary.requiresExactTotal,
        },
    };
}
