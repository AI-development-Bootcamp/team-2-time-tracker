import { EntityStatus } from '../enums/entityStatus.enum';
import { ReportType } from '../enums/reportType.enum';
import { TaskStatus } from '../enums/taskStatus.enum';

// ===========================
// CLIENT DTOs
// ===========================

/**
 * Client DTO - Response DTO for client operations
 * This is returned by the server when fetching/creating/updating clients
 */
export interface ClientDto {
    id: string;
    name: string;
    status: EntityStatus;
    createdAt: string;
    updatedAt: string;
}

/**
 * Response wrapper for single client
 */
export interface ClientResponseDto {
    success: boolean;
    data: ClientDto;
}

/**
 * Response wrapper for list of clients
 */
export interface ListClientsResponseDto {
    success: boolean;
    data: ClientDto[];
}

/**
 * Request DTO for creating a new client
 */
export interface CreateClientRequestDto {
    name: string;
}

/**
 * Request DTO for updating client details
 */
export interface UpdateClientRequestDto {
    name: string;
}

/**
 * Request DTO for updating client status
 */
export interface UpdateClientStatusRequestDto {
    status: EntityStatus;
}

// ===========================
// PROJECT DTOs
// ===========================

/**
 * Assigned user information for projects
 */
export interface AssignedUserDto {
    id: string;
    fullName: string;
    email: string;
}

/**
 * Project DTO - Response DTO for project operations
 * This is returned by the server when fetching/creating/updating projects
 */
export interface ProjectDto {
    id: string;
    name: string;
    clientId: string;
    description?: string | null;
    reportType: ReportType;
    status: EntityStatus;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    client?: ClientDto;
    assignedUsers?: AssignedUserDto[];
}

/**
 * Response wrapper for single project
 */
export interface ProjectResponseDto {
    success: boolean;
    data: ProjectDto;
}

/**
 * Response wrapper for list of projects
 */
export interface ListProjectsResponseDto {
    success: boolean;
    data: ProjectDto[];
}

/**
 * Request DTO for creating a new project
 */
export interface CreateProjectRequestDto {
    name: string;
    clientId: string;
    description?: string | null;
    reportType?: ReportType;
    startDate?: string | null;
    endDate?: string | null;
}

/**
 * Request DTO for updating project details
 */
export interface UpdateProjectRequestDto {
    name?: string;
    clientId?: string;
    description?: string | null;
    reportType?: ReportType;
    startDate?: string | null;
    endDate?: string | null;
}

/**
 * Request DTO for updating project status
 */
export interface UpdateProjectStatusRequestDto {
    status: EntityStatus;
}

/**
 * Request DTO for updating project report type
 */
export interface UpdateProjectReportTypeRequestDto {
    reportType: ReportType;
}

/**
 * Validation error for conflicting task dates
 */
export interface ConflictingTaskDto {
    id: string;
    name: string;
    startDate: string | null;
    endDate: string | null;
}

/**
 * Error response for project date validation (VALIDATION_002)
 */
export interface ProjectDateValidationErrorDto {
    code: 'VALIDATION_002';
    message: string;
    conflictingTasks: ConflictingTaskDto[];
}

/**
 * Response DTO for project users endpoint
 * Returns all users assigned to a project
 */
export interface ProjectUsersResponseDto {
    success: boolean;
    data: AssignedUserDto[];
}

// ===========================
// TASK DTOs
// ===========================

/**
 * Task DTO - Response DTO for task operations
 * This is returned by the server when fetching/creating/updating tasks
 */
export interface TaskDto {
    id: string;
    name: string;
    projectId: string;
    status: TaskStatus;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    project?: ProjectDto;
}

/**
 * Response wrapper for single task
 */
export interface TaskResponseDto {
    success: boolean;
    data: TaskDto;
}

/**
 * Response wrapper for list of tasks
 */
export interface ListTasksResponseDto {
    success: boolean;
    data: TaskDto[];
}

/**
 * Request DTO for creating a new task
 */
export interface CreateTaskRequestDto {
    name: string;
    projectId: string;
    startDate?: string | null;
    endDate?: string | null;
}

/**
 * Request DTO for updating task details
 */
export interface UpdateTaskRequestDto {
    name?: string;
    projectId?: string;
    startDate?: string | null;
    endDate?: string | null;
}

/**
 * Request DTO for updating task status
 */
export interface UpdateTaskStatusRequestDto {
    status: TaskStatus;
}
