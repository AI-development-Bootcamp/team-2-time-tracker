/**
 * @fileoverview Workday service for daily summary management
 * @module time-reports/workday.service
 */

import { BadRequestError } from '../../shared/errors';
import { prisma } from '../../db';
import * as timeReportsRepo from './timeReports.repo';

const TARGET_MINUTES = 540; // 9 hours standard day

/**
 * Determine workday status based on total minutes
 */
function calculateStatus(totalMinutes: number): 'FULL' | 'MISSING' | 'EXCEPTION' {
    if (totalMinutes === TARGET_MINUTES) return 'FULL';
    if (totalMinutes < TARGET_MINUTES) return 'MISSING';
    return 'EXCEPTION';
}

/**
 * Format time entry for response
 */
function formatTimeEntry(entry: any) {
    const formatTime = (date: Date) => {
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return {
        id: entry.id,
        workDate: entry.workDate.toISOString().split('T')[0],
        startTime: formatTime(entry.startTime),
        endTime: formatTime(entry.endTime),
        durationMinutes: entry.durationMinutes,
        location: entry.location,
        description: entry.description,
        source: entry.source,
        task: entry.task ? {
            id: entry.task.id,
            name: entry.task.name,
            project: entry.task.project ? {
                id: entry.task.project.id,
                name: entry.task.project.name,
            } : null,
            client: entry.task.project?.client ? {
                id: entry.task.project.client.id,
                name: entry.task.project.client.name,
            } : null,
        } : null,
    };
}

/**
 * @description Gets the workday summary for a specific date
 * @param {string} userId - User's UUID
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Promise<GetWorkdayResponse>} Workday data with summary, entries, and absences
 */
export async function getWorkday(userId: string, dateStr: string) {
    const workDate = new Date(dateStr);
    workDate.setUTCHours(0, 0, 0, 0);

    // Check if month is locked
    const monthLock = await timeReportsRepo.findMonthLock(workDate);
    const isLocked = monthLock !== null;

    // Get or create workday summary
    let summary = await prisma.workdaySummary.findUnique({
        where: {
            userId_workDate: {
                userId,
                workDate,
            },
        },
    });

    // Fetch time entries for the date
    const timeEntries = await prisma.timeEntry.findMany({
        where: {
            userId,
            workDate,
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
        orderBy: { startTime: 'asc' },
    });

    // Calculate work minutes from entries
    const workMinutes = timeEntries.reduce((sum: number, entry: { durationMinutes: number }) => sum + entry.durationMinutes, 0);

    // Get absence minutes for the date (if absences module exists)
    // For now, we'll check if there are absence_days for this user/date
    const absenceDays = await prisma.$queryRaw<{ minutes: number }[]>`
        SELECT COALESCE(SUM(minutes), 0) as minutes 
        FROM absence_days 
        WHERE user_id = ${userId} 
        AND work_date = ${workDate}
    `.catch(() => [{ minutes: 0 }]);

    const absenceMinutes = Number(absenceDays[0]?.minutes || 0);
    const totalMinutes = workMinutes + absenceMinutes;
    const status = calculateStatus(totalMinutes);

    // Update or create the workday summary with calculated values
    if (!summary) {
        summary = await prisma.workdaySummary.create({
            data: {
                userId,
                workDate,
                targetMinutes: TARGET_MINUTES,
                workMinutes,
                absenceMinutes,
                status,
                isLocked,
                lockedMonthId: monthLock?.id,
            },
        });
    } else {
        // Update if values changed
        summary = await prisma.workdaySummary.update({
            where: { id: summary.id },
            data: {
                workMinutes,
                absenceMinutes,
                status,
                isLocked,
                lockedMonthId: monthLock?.id,
            },
        });
    }

    // Format response
    return {
        date: dateStr,
        status: summary.status,
        isLocked: summary.isLocked,
        isSubmitted: summary.isSubmitted,
        summary: {
            targetMinutes: summary.targetMinutes,
            workMinutes: summary.workMinutes,
            absenceMinutes: summary.absenceMinutes,
            totalMinutes: summary.workMinutes + summary.absenceMinutes,
            balanceMinutes: (summary.workMinutes + summary.absenceMinutes) - summary.targetMinutes,
            completionPercentage: Math.round(((summary.workMinutes + summary.absenceMinutes) / summary.targetMinutes) * 100),
            isLocked: summary.isLocked,
            lockedMonthId: summary.lockedMonthId,
            isSubmitted: summary.isSubmitted,
            submittedAt: summary.submittedAt?.toISOString() || null,
            requiresExactTotal: summary.requiresExactTotal,
        },
        timeEntries: timeEntries.map(formatTimeEntry),
        absences: [], // TODO: Fetch actual absences when absences module is integrated
    };
}

/**
 * @description Submits a workday for approval
 * @param {string} userId - User's UUID
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Promise<SubmitWorkdayResponse>} Submission confirmation
 * @throws {BadRequestError} When validation fails
 */
export async function submitWorkday(userId: string, dateStr: string) {
    const workDate = new Date(dateStr);
    workDate.setUTCHours(0, 0, 0, 0);

    // 1. Check if month is locked
    const monthLock = await timeReportsRepo.findMonthLock(workDate);
    if (monthLock) {
        throw new BadRequestError('Cannot submit workday: month is locked');
    }

    // 2. Check if timer is running
    const runningTimer = await timeReportsRepo.findRunningTimer(userId);
    if (runningTimer) {
        throw new BadRequestError('Cannot submit workday: timer is still running');
    }

    // 3. Get current workday summary
    const workday = await getWorkday(userId, dateStr);

    // 4. Check if already submitted
    if (workday.isSubmitted) {
        throw new BadRequestError('Workday is already submitted');
    }

    // 5. Validate total minutes equals 540
    const totalMinutes = workday.summary.totalMinutes;
    if (totalMinutes !== TARGET_MINUTES) {
        throw new BadRequestError(
            `Cannot submit workday: total minutes (${totalMinutes}) must equal ${TARGET_MINUTES}`
        );
    }

    // 6. Update workday summary
    const now = new Date();
    await prisma.workdaySummary.update({
        where: {
            userId_workDate: {
                userId,
                workDate,
            },
        },
        data: {
            isSubmitted: true,
            submittedAt: now,
        },
    });

    return {
        date: dateStr,
        isSubmitted: true,
        submittedAt: now.toISOString(),
    };
}

/**
 * @description Cancels a workday submission
 * @param {string} userId - User's UUID
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Promise<CancelWorkdayResponse>} Cancellation confirmation
 * @throws {BadRequestError} When validation fails
 */
export async function cancelWorkdaySubmission(userId: string, dateStr: string) {
    const workDate = new Date(dateStr);
    workDate.setUTCHours(0, 0, 0, 0);

    // 1. Check if month is locked
    const monthLock = await timeReportsRepo.findMonthLock(workDate);
    if (monthLock) {
        throw new BadRequestError('Cannot cancel submission: month is locked');
    }

    // 2. Get current workday summary
    const summary = await prisma.workdaySummary.findUnique({
        where: {
            userId_workDate: {
                userId,
                workDate,
            },
        },
    });

    if (!summary) {
        throw new BadRequestError('No workday found for this date');
    }

    // 3. Check if submitted
    if (!summary.isSubmitted) {
        throw new BadRequestError('Workday is not submitted');
    }

    // 4. Update workday summary
    await prisma.workdaySummary.update({
        where: { id: summary.id },
        data: {
            isSubmitted: false,
            submittedAt: null,
        },
    });

    return {
        message: 'Workday submission cancelled',
    };
}

/**
 * @description Gets the monthly calendar view with daily status indicators
 * @param {string} userId - User's UUID
 * @param {string} monthStr - Month string in YYYY-MM format
 * @returns {Promise<GetMonthlyCalendarResponse>} Calendar data with days and summary
 */
export async function getMonthlyCalendar(userId: string, monthStr: string) {
    // Parse the month
    const [yearStr, monthNumStr] = monthStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthNumStr, 10) - 1; // JS months are 0-indexed

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0)); // Last day of month

    // Check if month is locked
    const monthLock = await timeReportsRepo.findMonthLock(startDate);
    const isMonthLocked = monthLock !== null;

    // Get all workday summaries for the month
    const summaries = await prisma.workdaySummary.findMany({
        where: {
            userId,
            workDate: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: { workDate: 'asc' },
    });

    // Create a map for quick lookup
    const summaryMap = new Map<string, typeof summaries[0]>();
    for (const s of summaries) {
        const dateKey = s.workDate.toISOString().split('T')[0];
        summaryMap.set(dateKey, s);
    }

    // Build days array for all days in the month
    const days: Array<{
        date: string;
        status: string;
        isLocked: boolean;
        isSubmitted: boolean;
        minutes: number;
    }> = [];

    let totalTargetMinutes = 0;
    let totalWorkMinutes = 0;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getUTCDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const summary = summaryMap.get(dateStr);

        if (!isWeekend) {
            // Only count workdays
            totalTargetMinutes += TARGET_MINUTES;
            const dayMinutes = summary ? summary.workMinutes + summary.absenceMinutes : 0;
            totalWorkMinutes += dayMinutes;

            days.push({
                date: dateStr,
                status: summary?.status || 'MISSING',
                isLocked: isMonthLocked || (summary?.isLocked ?? false),
                isSubmitted: summary?.isSubmitted ?? false,
                minutes: dayMinutes,
            });
        } else {
            // Include weekends but don't count them in totals
            days.push({
                date: dateStr,
                status: 'WEEKEND',
                isLocked: isMonthLocked,
                isSubmitted: false,
                minutes: 0,
            });
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return {
        month: monthStr,
        days,
        summary: {
            totalTargetMinutes,
            totalWorkMinutes,
            balanceMinutes: totalWorkMinutes - totalTargetMinutes,
        },
    };
}
