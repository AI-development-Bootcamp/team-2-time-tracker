/**
 * @fileoverview Business logic for absence management
 * @module absences/absences.service
 */

import { AbsenceType, AbsenceStatus } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../../shared/errors';
import * as absencesRepo from './absences.repo';

const HALF_DAY_MINUTES = 270;
const FULL_DAY_MINUTES = 540;

/**
 * Check if date is Israeli workday (Sunday-Thursday)
 */
function isIsraeliWorkday(date: Date): boolean {
    const dayOfWeek = date.getDay();
    // 0 = Sunday, 1-4 = Monday-Thursday, 5 = Friday, 6 = Saturday
    return dayOfWeek >= 0 && dayOfWeek <= 4;
}

/**
 * Expand date range to individual workdays, excluding Friday and Saturday
 */
function expandDateRangeToWorkdays(startDate: Date, endDate: Date): Date[] {
    const workdays: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        if (isIsraeliWorkday(current)) {
            workdays.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }

    return workdays;
}

/**
 * Determine absence status based on type and document presence
 */
function determineStatus(type: AbsenceType, hasDocuments: boolean): AbsenceStatus {
    // SICK and RESERVES require documents
    if ((type === 'SICK' || type === 'RESERVES') && !hasDocuments) {
        return 'PENDING_DOCUMENT';
    }
    return 'SUBMITTED';
}

/**
 * Create absence request
 */
export async function createAbsence(
    userId: string,
    data: {
        type: AbsenceType;
        startDate: string;
        endDate: string;
        isHalfDay: boolean;
        note?: string;
    }
) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Validate dates are not in the future (optional business rule)
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // if (startDate > today) {
    //     throw new BadRequestError('Cannot create absence for future dates');
    // }

    // Check if month is locked
    const isLocked = await absencesRepo.isMonthLocked(startDate);
    if (isLocked) {
        throw new BadRequestError('Cannot create absence in locked month');
    }

    // Check for overlapping absences
    const overlapping = await absencesRepo.findOverlappingAbsences(userId, startDate, endDate);
    if (overlapping) {
        throw new BadRequestError('Overlapping absence exists');
    }

    // Expand date range to individual workdays
    const workdays = expandDateRangeToWorkdays(startDate, endDate);

    if (workdays.length === 0) {
        throw new BadRequestError('No workdays in the selected range');
    }

    // Determine minutes per day
    const minutesPerDay = data.isHalfDay ? HALF_DAY_MINUTES : FULL_DAY_MINUTES;

    // Determine initial status
    const status = determineStatus(data.type, false);

    // Create absence request and days
    const absence = await absencesRepo.createAbsenceWithDays(
        {
            userId,
            type: data.type,
            startDate,
            endDate,
            isHalfDay: data.isHalfDay,
            status,
            note: data.note,
        },
        workdays.map((workDate) => ({
            absenceRequestId: '', // Will be set by repo
            userId,
            workDate,
            minutes: minutesPerDay,
        }))
    );

    return absence;
}

/**
 * Get absence by ID
 */
export async function getAbsenceById(id: string, userId: string) {
    const absence = await absencesRepo.findAbsenceByIdAndUserId(id, userId);

    if (!absence) {
        throw new NotFoundError('Absence not found');
    }

    return absence;
}

/**
 * List user absences
 */
export async function listAbsences(userId: string, page: number, pageSize: number) {
    const { items, total } = await absencesRepo.listUserAbsences(userId, page, pageSize);

    const totalPages = Math.ceil(total / pageSize);

    return {
        items,
        pagination: {
            page,
            pageSize,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

/**
 * Update absence request
 */
export async function updateAbsence(
    id: string,
    userId: string,
    data: {
        type?: AbsenceType;
        startDate?: string;
        endDate?: string;
        isHalfDay?: boolean;
        note?: string;
    }
) {
    // Get existing absence
    const existing = await absencesRepo.findAbsenceByIdAndUserId(id, userId);
    if (!existing) {
        throw new NotFoundError('Absence not found');
    }

    // Check if month is locked
    const isLocked = await absencesRepo.isMonthLocked(existing.startDate);
    if (isLocked) {
        throw new BadRequestError('Cannot update absence in locked month');
    }

    // Determine if dates changed
    const newStartDate = data.startDate ? new Date(data.startDate) : existing.startDate;
    const newEndDate = data.endDate ? new Date(data.endDate) : existing.endDate;
    const datesChanged =
        newStartDate.getTime() !== existing.startDate.getTime() ||
        newEndDate.getTime() !== existing.endDate.getTime();

    // Check for overlapping absences (excluding current)
    if (datesChanged) {
        const overlapping = await absencesRepo.findOverlappingAbsences(userId, newStartDate, newEndDate, id);
        if (overlapping) {
            throw new BadRequestError('Overlapping absence exists');
        }
    }

    // Regenerate absence days if dates or isHalfDay changed
    let newAbsenceDays = undefined;
    if (datesChanged || data.isHalfDay !== undefined) {
        const workdays = expandDateRangeToWorkdays(newStartDate, newEndDate);

        if (workdays.length === 0) {
            throw new BadRequestError('No workdays in the selected range');
        }

        const minutesPerDay = (data.isHalfDay ?? existing.isHalfDay) ? HALF_DAY_MINUTES : FULL_DAY_MINUTES;

        newAbsenceDays = workdays.map((workDate) => ({
            absenceRequestId: id,
            userId,
            workDate,
            minutes: minutesPerDay,
        }));
    }

    // Update absence
    const updated = await absencesRepo.updateAbsenceWithDays(
        id,
        userId,
        {
            type: data.type,
            startDate: data.startDate ? newStartDate : undefined,
            endDate: data.endDate ? newEndDate : undefined,
            isHalfDay: data.isHalfDay,
            note: data.note,
        },
        newAbsenceDays
    );

    return updated;
}

/**
 * Delete absence request
 */
export async function deleteAbsence(id: string, userId: string) {
    // Get existing absence
    const existing = await absencesRepo.findAbsenceByIdAndUserId(id, userId);
    if (!existing) {
        throw new NotFoundError('Absence not found');
    }

    // Check if month is locked
    const isLocked = await absencesRepo.isMonthLocked(existing.startDate);
    if (isLocked) {
        throw new BadRequestError('Cannot delete absence in locked month');
    }

    // Delete absence (cascade deletes absence days, updates workday summaries)
    await absencesRepo.deleteAbsence(id, userId);

    return { success: true, message: 'Absence deleted successfully' };
}

