/**
 * @fileoverview Database operations for absences
 * @module absences/absences.repo
 */

import { prisma } from '../../db';
type AbsenceType = 'VACATION' | 'SICK' | 'RESERVES' | 'OTHER';
type AbsenceStatus = 'PENDING_DOCUMENT' | 'SUBMITTED';

export interface CreateAbsenceData {
    userId: string;
    type: AbsenceType;
    startDate: Date;
    endDate: Date;
    isHalfDay: boolean;
    status: AbsenceStatus;
    note?: string;
}

export interface CreateAbsenceDayData {
    absenceRequestId: string;
    userId: string;
    workDate: Date;
    minutes: number;
}

export interface UpdateAbsenceData {
    type?: AbsenceType;
    startDate?: Date;
    endDate?: Date;
    isHalfDay?: boolean;
    status?: AbsenceStatus;
    note?: string;
}

/**
 * Create absence request with absence days in a transaction
 * Also updates workday summaries for each affected date
 */
export async function createAbsenceWithDays(
    absenceData: CreateAbsenceData,
    absenceDays: CreateAbsenceDayData[]
) {
    return prisma.$transaction(async (tx) => {
        const absence = await tx.absenceRequest.create({
            data: absenceData,
            include: {
                absenceDays: true,
                documents: true,
            },
        });

        if (absenceDays.length > 0) {
            await tx.absenceDay.createMany({
                data: absenceDays.map((day) => ({
                    ...day,
                    absenceRequestId: absence.id,
                })),
            });

            // Update workday summaries for each absence day
            const minutesPerDay = absenceDays[0]?.minutes || 540;
            const dates = absenceDays.map((day) => day.workDate);
            await updateWorkdaySummariesForDates(absenceData.userId, dates, minutesPerDay, 'add', tx);
        }

        const result = await tx.absenceRequest.findUnique({
            where: { id: absence.id },
            include: {
                absenceDays: {
                    orderBy: { workDate: 'asc' },
                },
                documents: true,
            },
        });

        return result;
    });
}

/**
 * Find absence by ID with relations
 */
export async function findAbsenceById(id: string) {
    return prisma.absenceRequest.findUnique({
        where: { id },
        include: {
            absenceDays: {
                orderBy: { workDate: 'asc' },
            },
            documents: true,
        },
    });
}

/**
 * Find absence by ID for specific user
 */
export async function findAbsenceByIdAndUserId(id: string, userId: string) {
    return prisma.absenceRequest.findFirst({
        where: { id, userId },
        include: {
            absenceDays: {
                orderBy: { workDate: 'asc' },
            },
            documents: true,
        },
    });
}

/**
 * List absences for a user with pagination
 */
export async function listUserAbsences(userId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
        prisma.absenceRequest.findMany({
            where: { userId },
            include: {
                absenceDays: {
                    orderBy: { workDate: 'asc' },
                },
                documents: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.absenceRequest.count({
            where: { userId },
        }),
    ]);

    return { items, total };
}

/**
 * Update absence request and regenerate absence days
 * Also updates workday summaries for affected dates
 */
export async function updateAbsenceWithDays(
    id: string,
    userId: string,
    absenceData: UpdateAbsenceData,
    newAbsenceDays?: CreateAbsenceDayData[]
) {
    return prisma.$transaction(async (tx) => {
        // Get existing absence days before update (for workday summary calculation)
        const existingAbsenceDays = await tx.absenceDay.findMany({
            where: { absenceRequestId: id },
        });

        // Update absence request
        await tx.absenceRequest.update({
            where: { id, userId },
            data: absenceData,
        });

        // If dates changed, regenerate absence days
        if (newAbsenceDays) {
            // Remove old absence minutes from workday summaries
            if (existingAbsenceDays.length > 0) {
                const oldMinutesPerDay = existingAbsenceDays[0]?.minutes || 540;
                const oldDates = existingAbsenceDays.map((day) => day.workDate);
                await updateWorkdaySummariesForDates(userId, oldDates, oldMinutesPerDay, 'remove', tx);
            }

            // Delete existing absence days
            await tx.absenceDay.deleteMany({
                where: { absenceRequestId: id },
            });

            // Create new absence days and update workday summaries
            if (newAbsenceDays.length > 0) {
                await tx.absenceDay.createMany({
                    data: newAbsenceDays.map((day) => ({
                        ...day,
                        absenceRequestId: id,
                    })),
                });

                // Add new absence minutes to workday summaries
                const newMinutesPerDay = newAbsenceDays[0]?.minutes || 540;
                const newDates = newAbsenceDays.map((day) => day.workDate);
                await updateWorkdaySummariesForDates(userId, newDates, newMinutesPerDay, 'add', tx);
            }
        }

        // Return updated absence with relations
        return tx.absenceRequest.findUnique({
            where: { id },
            include: {
                absenceDays: {
                    orderBy: { workDate: 'asc' },
                },
                documents: true,
            },
        });
    });
}

/**
 * Delete absence request (cascade deletes absence days)
 * Also updates workday summaries for affected dates
 */
export async function deleteAbsence(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
        // Get absence days before deletion (for workday summary update)
        const absenceDays = await tx.absenceDay.findMany({
            where: { absenceRequestId: id },
        });

        // Remove absence minutes from workday summaries
        if (absenceDays.length > 0) {
            const minutesPerDay = absenceDays[0]?.minutes || 540;
            const dates = absenceDays.map((day) => day.workDate);
            await updateWorkdaySummariesForDates(userId, dates, minutesPerDay, 'remove', tx);
        }

        // Delete absence request (cascade deletes absence days)
        return tx.absenceRequest.delete({
            where: { id, userId },
        });
    });
}

/**
 * Check for overlapping absences for a user
 */
export async function findOverlappingAbsences(
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
) {
    return prisma.absenceRequest.findFirst({
        where: {
            userId,
            id: excludeId ? { not: excludeId } : undefined,
            OR: [
                {
                    AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
                },
            ],
        },
    });
}

/**
 * Check if month is locked
 */
export async function isMonthLocked(date: Date): Promise<boolean> {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);

    const lock = await (prisma as any).monthLock.findFirst({
        where: {
            month: firstDayOfMonth,
            unlockedAt: null,
        },
    });

    return lock !== null;
}

const TARGET_MINUTES = 540;

/**
 * Calculate workday status based on total minutes
 */
function calculateWorkdayStatus(totalMinutes: number): 'MISSING' | 'FULL' | 'EXCEPTION' {
    if (totalMinutes < TARGET_MINUTES) return 'MISSING';
    if (totalMinutes === TARGET_MINUTES) return 'FULL';
    return 'EXCEPTION';
}

/**
 * Upsert workday summary for a specific date
 * Creates the summary if it doesn't exist, updates if it does
 */
export async function upsertWorkdaySummary(
    userId: string,
    workDate: Date,
    absenceMinutesDelta: number,
    tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
    const client = tx || prisma;

    const existing = await client.workdaySummary.findUnique({
        where: {
            userId_workDate: { userId, workDate },
        },
    });

    if (existing) {
        const newAbsenceMinutes = Math.max(0, existing.absenceMinutes + absenceMinutesDelta);
        const totalMinutes = existing.workMinutes + newAbsenceMinutes;
        const status = calculateWorkdayStatus(totalMinutes);

        return client.workdaySummary.update({
            where: { id: existing.id },
            data: {
                absenceMinutes: newAbsenceMinutes,
                status,
            },
        });
    } else {
        const absenceMinutes = Math.max(0, absenceMinutesDelta);
        const status = calculateWorkdayStatus(absenceMinutes);

        return client.workdaySummary.create({
            data: {
                userId,
                workDate,
                targetMinutes: TARGET_MINUTES,
                workMinutes: 0,
                absenceMinutes,
                status,
            },
        });
    }
}

/**
 * Update workday summaries for multiple dates
 */
export async function updateWorkdaySummariesForDates(
    userId: string,
    dates: Date[],
    minutesPerDay: number,
    operation: 'add' | 'remove',
    tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
    const delta = operation === 'add' ? minutesPerDay : -minutesPerDay;

    for (const workDate of dates) {
        await upsertWorkdaySummary(userId, workDate, delta, tx);
    }
}

