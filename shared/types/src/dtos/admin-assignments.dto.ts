import { TaskDto } from './admin-entities.dto';
import { AdminUserDto } from './admin-users.dto';

// ===========================
// TASK ASSIGNMENT DTOs
// ===========================

/**
 * Task Assignment DTO - Response DTO for assignment operations
 * This is returned by the server when fetching/creating assignments
 * Includes expanded details for user, task, project, and client information
 */
export interface TaskAssignmentDto {
    id: string;
    userId: string;
    taskId: string;
    createdAt: string;
    userName: string;
    userEmail: string;
    taskName: string;
    projectId: string;
    projectName: string;
    clientId: string;
    clientName: string;
    user?: AdminUserDto;
    task?: TaskDto;
}

/**
 * Response wrapper for single task assignment
 */
export interface TaskAssignmentResponseDto {
    success: boolean;
    data: TaskAssignmentDto;
}

/**
 * Response wrapper for list of task assignments
 */
export interface ListTaskAssignmentsResponseDto {
    success: boolean;
    data: TaskAssignmentDto[];
}

/**
 * Request DTO for creating a single task assignment
 */
export interface CreateTaskAssignmentRequestDto {
    userId: string;
    taskId: string;
}

/**
 * Request DTO for creating multiple assignments via cartesian product
 * Example: userIds [1, 2] and taskIds [A, B] creates assignments: (1,A), (1,B), (2,A), (2,B)
 */
export interface BulkCreateTaskAssignmentsRequestDto {
    userIds: string[];
    taskIds: string[];
}

/**
 * Response wrapper for bulk task assignment creation
 */
export interface BulkTaskAssignmentsResponseDto {
    success: boolean;
    data: {
        created: TaskAssignmentDto[];
        count: number;
    };
}

/**
 * Query DTO for filtering assignments list
 * All fields are optional - used as query parameters
 */
export interface ListAssignmentsQueryDto {
    userId?: string;
    taskId?: string;
    projectId?: string;
    userName?: string;
}
