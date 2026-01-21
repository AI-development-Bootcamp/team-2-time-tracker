/**
 * @fileoverview API service for task assignments management
 * @module api/assignmentsApi
 */

import { httpClient } from '@client/api-client';
import type {
    TaskAssignmentDto,
    ListTaskAssignmentsResponseDto,
    CreateTaskAssignmentRequestDto,
    BulkCreateTaskAssignmentsRequestDto,
    BulkTaskAssignmentsResponseDto
} from '@shared/types';

/**
 * @description Get all task assignments with optional filters
 * @param {Object} filters - Optional filters
 * @param {string} filters.userId - Filter by user ID
 * @param {string} filters.taskId - Filter by task ID
 * @param {string} filters.projectId - Filter by project ID
 * @param {string} filters.userName - Filter by user name (partial match)
 * @returns {Promise<TaskAssignmentDto[]>} List of task assignments
 */
export async function getAssignments(filters?: {
    userId?: string;
    taskId?: string;
    projectId?: string;
    userName?: string;
}): Promise<TaskAssignmentDto[]> {
    const response = await httpClient.get<ListTaskAssignmentsResponseDto>(
        '/admin/assignments',
        { params: filters }
    );
    return response.data.data;
}

/**
 * @description Create a single task assignment
 * @param {CreateTaskAssignmentRequestDto} data - Assignment data
 * @returns {Promise<TaskAssignmentDto>} Created assignment
 */
export async function createAssignment(data: CreateTaskAssignmentRequestDto): Promise<TaskAssignmentDto> {
    const response = await httpClient.post<{ success: boolean; data: TaskAssignmentDto }>(
        '/admin/assignments',
        data
    );
    return response.data.data;
}

/**
 * @description Create multiple task assignments via cartesian product
 * @param {BulkCreateTaskAssignmentsRequestDto} data - Bulk assignment data
 * @returns {Promise<BulkTaskAssignmentsResponseDto['data']>} Created assignments and count
 */
export async function bulkCreateAssignments(
    data: BulkCreateTaskAssignmentsRequestDto
): Promise<BulkTaskAssignmentsResponseDto['data']> {
    const response = await httpClient.post<BulkTaskAssignmentsResponseDto>(
        '/admin/assignments/bulk',
        data
    );
    return response.data.data;
}

/**
 * @description Delete a task assignment
 * @param {string} id - Assignment ID
 * @returns {Promise<void>}
 */
export async function deleteAssignment(id: string): Promise<void> {
    await httpClient.delete(`/admin/assignments/${id}`);
}
