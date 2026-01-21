/**
 * DTOs for Selectors module
 */

export interface GetSelectorsResponseDto<T> {
    success: boolean;
    data: T[];
}

export interface ClientSelectorDto {
    id: string;
    name: string;
    usageCount: number;
}

export interface ProjectSelectorDto {
    id: string;
    name: string;
    clientId: string;
    usageCount: number;
}

export interface TaskSelectorDto {
    id: string;
    name: string;
    projectId: string;
    reportType: string;
    usageCount: number;
}

export interface UserAssignmentDto {
    id: string; // Task ID
    name: string;
    projectId: string;
    projectName: string;
    clientName: string;
    reportType: string;
}

export interface UserAssignmentsDto {
    success: boolean;
    data: {
        tasks: UserAssignmentDto[];
        totalTasks: number;
    };
}

export interface MonthlyStatisticsDto {
    success: boolean;
    data: {
        totalWorkDays: number;
        submittedDays: number;
        missingDays: number;
        totalWorkMinutes: number;
        totalAbsenceMinutes: number;
        completionPercentage: number;
    };
}

