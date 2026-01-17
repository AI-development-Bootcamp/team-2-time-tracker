/**
 * @fileoverview Timer repository for database operations
 * @module timer/timer.repo
 */

import { prisma } from '../../db';

/**
 * Find the currently running timer for a user
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
 * Find a timer by ID
 * @param id - The timer ID
 * @returns The timer if found, null otherwise
 */
export async function findTimerById(id: string) {
    return prisma.timer.findUnique({
        where: { id },
    });
}

/**
 * Create a new timer
 * @param userId - The user ID
 * @param workDate - The work date
 * @returns The created timer
 */
export async function createTimer(userId: string, workDate: Date) {
    return prisma.timer.create({
        data: {
            userId,
            workDate,
            startedAt: new Date(),
            isRunning: true,
        },
    });
}

/**
 * Update a timer (e.g., to stop it)
 * @param id - The timer ID
 * @param data - The data to update
 * @returns The updated timer
 */
export async function updateTimer(
    id: string,
    data: {
        stoppedAt?: Date;
        durationMinutes?: number;
        isRunning?: boolean;
    }
) {
    return prisma.timer.update({
        where: { id },
        data,
    });
}

/**
 * Delete a timer (for cancellation)
 * @param id - The timer ID
 * @returns The deleted timer
 */
export async function deleteTimer(id: string) {
    return prisma.timer.delete({
        where: { id },
    });
}

/**
 * Check if a month is locked for a given date
 * @param date - The date to check
 * @returns The MonthLock if the month is locked, null otherwise
 */
export async function findMonthLock(date: Date) {
    // Get the first day of the month
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    
    return prisma.monthLock.findFirst({
        where: {
            month: monthStart,
            unlockedAt: null,
        },
    });
}
