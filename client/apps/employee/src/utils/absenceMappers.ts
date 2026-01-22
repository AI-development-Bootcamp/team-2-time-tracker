/**
 * @fileoverview Utility functions for mapping absence types
 * @module utils/absenceMappers
 */

import { AbsenceType } from '@shared/types';

/**
 * Interface for mapped absence type configuration
 */
export interface MappedAbsenceType {
    type: AbsenceType;
    isHalfDay: boolean;
}

/**
 * Mapping object for absence types from form values to backend types
 */
export const ABSENCE_TYPE_MAP: Record<string, MappedAbsenceType> = {
    VACATION_HALF: { type: AbsenceType.VACATION, isHalfDay: true },
    VACATION_FULL: { type: AbsenceType.VACATION, isHalfDay: false },
    SICK: { type: AbsenceType.SICK, isHalfDay: false },
    RESERVES: { type: AbsenceType.RESERVES, isHalfDay: false },
};

/**
 * Default absence type configuration (used as fallback)
 */
const DEFAULT_ABSENCE_TYPE: MappedAbsenceType = {
    type: AbsenceType.VACATION,
    isHalfDay: false,
};

/**
 * Maps an absence type string to its corresponding AbsenceType and isHalfDay configuration
 * @param absenceType - The absence type string from the form
 * @returns The mapped absence type configuration
 * @example
 * const { type, isHalfDay } = mapAbsenceType('VACATION_HALF');
 * // Returns: { type: AbsenceType.VACATION, isHalfDay: true }
 */
export function mapAbsenceType(absenceType?: string): MappedAbsenceType {
    if (!absenceType || !ABSENCE_TYPE_MAP[absenceType]) {
        return DEFAULT_ABSENCE_TYPE;
    }
    return ABSENCE_TYPE_MAP[absenceType];
}

/**
 * Formats a Date object to YYYY-MM-DD string format
 * Backend expects dates in this format
 * @param date - The date to format
 * @returns Formatted date string in YYYY-MM-DD format
 * @example
 * formatDate(new Date('2024-01-15'))
 * // Returns: '2024-01-15'
 */
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
