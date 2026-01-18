import { WorkLocation } from '../enums/locationType.enum';
import { TimeEntrySource } from '../enums/timeEntrySource.enum';

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
 * Pagination DTO
 */
export interface PaginationDto {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
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
