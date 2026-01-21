import { WorkLocation } from '../enums/locationType.enum';
import { TimeEntrySource } from '../enums/timeEntrySource.enum';
import { PaginationDto } from './pagination.dto';

/**
 * Task info nested in TimeEntryDto
 */
export interface TimeEntryTaskDto {
    id: string;
    name: string;
    project: {
        id: string;
        name: string;
    };
    client: {
        id: string;
        name: string;
    };
}

/**
 * Time entry data transfer object
 */
export interface TimeEntryDto {
    id: string;
    workDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    location: WorkLocation;
    description: string;
    source: TimeEntrySource;
    task: TimeEntryTaskDto;
}

/**
 * Request DTO for creating a time entry
 */
export interface CreateTimeEntryRequestDto {
    workDate: string;
    startTime: string;
    endTime: string;
    location: WorkLocation;
    taskId: string;
    description: string;
}

/**
 * Request DTO for updating a time entry
 */
export interface UpdateTimeEntryRequestDto {
    startTime?: string;
    endTime?: string;
    location?: WorkLocation;
    taskId?: string;
    description?: string;
}

/**
 * Response DTO for creating/updating a time entry
 */
export interface UpsertTimeEntryResponseDto {
    success: boolean;
    data: TimeEntryDto;
}

/**
 * Response DTO for deleting a time entry
 */
export interface DeleteTimeEntryResponseDto {
    success: boolean;
    data: {
        id: string;
        isDeleted: boolean;
    };
}

/**
 * Response DTO for getting time entry history
 */
export interface GetHistoryResponseDto {
    success: boolean;
    data: {
        entries: TimeEntryDto[];
        pagination: PaginationDto;
    };
}

/**
 * Request DTO for batch creating time entries
 */
export interface BatchCreateTimeEntriesRequestDto {
    entries: CreateTimeEntryRequestDto[];
}

/**
 * Workday summary DTO
 */
export interface WorkdaySummaryDto {
    targetMinutes: number;
    workMinutes: number;
    absenceMinutes: number;
    totalMinutes: number;
    balanceMinutes: number;
    completionPercentage: number;
    isLocked: boolean;
    lockedMonthId: string | null;
    isSubmitted: boolean;
    submittedAt: string | null;
    requiresExactTotal: boolean;
}

/**
 * Response DTO for batch creating time entries
 */
export interface BatchCreateTimeEntriesResponseDto {
    success: boolean;
    data: {
        created: TimeEntryDto[];
        workday: WorkdaySummaryDto;
    };
}

/**
 * Workday status enum type
 */
export type WorkdayStatus = 'FULL' | 'MISSING' | 'EXCEPTION' | 'WEEKEND';

/**
 * Calendar day DTO for monthly calendar view
 */
export interface CalendarDayDto {
    date: string;
    status: WorkdayStatus;
    isLocked: boolean;
    isSubmitted: boolean;
    minutes: number;
}

/**
 * Absence request minimal DTO (placeholder until absences module is integrated)
 */
export interface AbsenceRequestMinimalDto {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    minutes: number;
}

/**
 * Response DTO for getting a single workday
 */
export interface GetWorkdayResponseDto {
    success: boolean;
    data: {
        date: string;
        status: WorkdayStatus;
        isLocked: boolean;
        isSubmitted: boolean;
        summary: WorkdaySummaryDto;
        timeEntries: TimeEntryDto[];
        absences: AbsenceRequestMinimalDto[];
    };
}

/**
 * Monthly calendar summary DTO
 */
export interface MonthlyCalendarSummaryDto {
    totalTargetMinutes: number;
    totalWorkMinutes: number;
    balanceMinutes: number;
}

/**
 * Response DTO for getting monthly calendar
 */
export interface GetMonthlyCalendarResponseDto {
    success: boolean;
    data: {
        month: string;
        days: CalendarDayDto[];
        summary: MonthlyCalendarSummaryDto;
    };
}

/**
 * Response DTO for submitting a workday
 */
export interface SubmitWorkdayResponseDto {
    success: boolean;
    data: {
        date: string;
        isSubmitted: boolean;
        submittedAt: string;
    };
}

/**
 * Response DTO for cancelling a workday submission
 */
export interface CancelWorkdayResponseDto {
    success: boolean;
    message: string;
}
