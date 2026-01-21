/**
 * @fileoverview Timer service with business logic
 * @module timer/timer.service
 */

import { prisma } from '../../db';
import { BadRequestError, NotFoundError } from '../../shared/errors';
import * as timerRepo from './timer.repo';

const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 500;

/**
 * @description Starts a new timer for the user
 * @param {string} userId - User's UUID
 * @param {string} workDateStr - Work date in YYYY-MM-DD format
 * @returns {Promise<{id: string, startedAt: Date}>} Created timer info
 * @throws {BadRequestError} When timer is already running, month is locked, or date is not today
 * @example
 * const timer = await startTimer('user-uuid', '2026-01-17');
 * // { id: 'timer-uuid', startedAt: '2026-01-17T09:00:00Z' }
 */
export async function startTimer(userId: string, workDateStr: string) {
    // Parse the work date
    const workDate = new Date(workDateStr);
    
    // Validate workDate is today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (workDateStr !== todayStr) {
        throw new BadRequestError('Timer can only be started for today');
    }
    
    // Check if month is locked
    const monthLock = await timerRepo.findMonthLock(workDate);
    if (monthLock) {
        throw new BadRequestError('Cannot start timer: month is locked');
    }
    
    // Check if user already has a running timer
    const existingTimer = await timerRepo.findRunningTimer(userId);
    if (existingTimer) {
        throw new BadRequestError('A timer is already running');
    }
    
    // Create the timer
    const timer = await timerRepo.createTimer(userId, workDate);
    
    return {
        id: timer.id,
        startedAt: timer.startedAt,
    };
}

/**
 * @description Stops the running timer and creates a time entry
 * @param {string} userId - User's UUID
 * @param {string} taskId - Task UUID to associate with time entry
 * @param {string} location - Work location (OFFICE, CLIENT, HOME)
 * @param {string} description - Description of work done
 * @returns {Promise<TimeEntry>} Created time entry with task info
 * @throws {NotFoundError} When no running timer exists
 * @throws {BadRequestError} When task is not assigned to user or description invalid
 * @example
 * const entry = await stopTimer('user-uuid', 'task-uuid', 'OFFICE', 'Fixed bug in API');
 */
export async function stopTimer(
    userId: string,
    taskId: string,
    location: string,
    description: string
) {
    // Validate description length
    if (description.length < DESCRIPTION_MIN_LENGTH) {
        throw new BadRequestError(`Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`);
    }
    if (description.length > DESCRIPTION_MAX_LENGTH) {
        throw new BadRequestError(`Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`);
    }
    
    // Find the running timer
    const timer = await timerRepo.findRunningTimer(userId);
    if (!timer) {
        throw new NotFoundError('No running timer found');
    }
    
    // Validate task is assigned to user
    const taskAssignment = await prisma.taskAssignment.findFirst({
        where: {
            userId,
            taskId,
        },
    });
    if (!taskAssignment) {
        throw new BadRequestError('Task is not assigned to you');
    }
    
    // Calculate duration
    const now = new Date();
    const durationMs = now.getTime() - timer.startedAt.getTime();
    const durationMinutes = Math.round(durationMs / 60000);
    
    // Extract time parts
    const startTime = timer.startedAt;
    const endTime = now;
    
    // Use transaction to stop timer and create time entry
    const result = await prisma.$transaction(async (tx) => {
        // Update timer
        await tx.timer.update({
            where: { id: timer.id },
            data: {
                stoppedAt: now,
                durationMinutes,
                isRunning: false,
            },
        });
        
        // Create time entry
        const timeEntry = await tx.timeEntry.create({
            data: {
                userId,
                workDate: timer.workDate,
                startTime,
                endTime,
                durationMinutes,
                taskId,
                location: location as 'OFFICE' | 'CLIENT' | 'HOME',
                description,
                source: 'TIMER',
                timerId: timer.id,
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
        
        // Update or create workday summary
        await tx.workdaySummary.upsert({
            where: {
                userId_workDate: {
                    userId,
                    workDate: timer.workDate,
                },
            },
            create: {
                userId,
                workDate: timer.workDate,
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
    
    return {
        id: result.id,
        workDate: result.workDate.toISOString().split('T')[0],
        startTime: formatTime(result.startTime),
        endTime: formatTime(result.endTime),
        durationMinutes: result.durationMinutes,
        location: result.location,
        description: result.description,
        source: result.source,
        task: {
            id: result.task.id,
            name: result.task.name,
            project: {
                id: result.task.project.id,
                name: result.task.project.name,
            },
            client: {
                id: result.task.project.client.id,
                name: result.task.project.client.name,
            },
        },
    };
}

/**
 * @description Gets the current timer status for a user
 * @param {string} userId - User's UUID
 * @returns {Promise<{isRunning: boolean, elapsedMinutes: number|null, timer: Timer|null}>}
 * @example
 * const status = await getTimerStatus('user-uuid');
 * // { isRunning: true, elapsedMinutes: 45, timer: {...} }
 */
export async function getTimerStatus(userId: string) {
    const timer = await timerRepo.findRunningTimer(userId);
    
    if (!timer) {
        return {
            isRunning: false,
            elapsedMinutes: null,
            timer: null,
        };
    }
    
    // Calculate elapsed minutes server-side
    const now = new Date();
    const elapsedMs = now.getTime() - timer.startedAt.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    
    return {
        isRunning: true,
        elapsedMinutes,
        timer: {
            id: timer.id,
            userId: timer.userId,
            workDate: timer.workDate.toISOString().split('T')[0],
            startedAt: timer.startedAt.toISOString(),
            stoppedAt: timer.stoppedAt?.toISOString() ?? null,
            durationMinutes: timer.durationMinutes,
            isRunning: timer.isRunning,
            createdAt: timer.createdAt.toISOString(),
            updatedAt: timer.updatedAt.toISOString(),
        },
    };
}

/**
 * @description Cancels the running timer without creating a time entry
 * @param {string} userId - User's UUID
 * @throws {NotFoundError} When no running timer exists
 * @example
 * await cancelTimer('user-uuid');
 */
export async function cancelTimer(userId: string) {
    const timer = await timerRepo.findRunningTimer(userId);
    
    if (!timer) {
        throw new NotFoundError('No running timer found');
    }
    
    await timerRepo.deleteTimer(timer.id);
}

/**
 * Format a Date object to HH:MM string
 */
function formatTime(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
