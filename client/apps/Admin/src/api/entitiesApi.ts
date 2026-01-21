/**
 * @fileoverview API service for entities management (Clients, Projects, Tasks)
 * @module api/entitiesApi
 */

import { httpClient } from '@client/api-client';
import type {
    ClientDto,
    ClientResponseDto,
    UpdateClientRequestDto,
    ProjectDto,
    ProjectResponseDto,
    UpdateProjectRequestDto,
    ListProjectsResponseDto,
    ReportType,
    TaskDto,
    TaskResponseDto,
    UpdateTaskRequestDto,
} from '@shared/types';

// ============================================================================
// Clients
// ============================================================================

/**
 * @description Get a client by ID
 * @param {string} id - Client ID
 * @returns {Promise<ClientDto>} Client details
 */
export async function getClient(id: string): Promise<ClientDto> {
    const response = await httpClient.get<ClientResponseDto>(`/admin/clients/${id}`);
    return response.data.data;
}

/**
 * @description Update a client
 * @param {string} id - Client ID
 * @param {UpdateClientRequestDto} data - Update data
 * @returns {Promise<ClientDto>} Updated client
 */
export async function updateClient(id: string, data: UpdateClientRequestDto): Promise<ClientDto> {
    const response = await httpClient.patch<ClientResponseDto>(`/admin/clients/${id}`, data);
    return response.data.data;
}

// ============================================================================
// Projects
// ============================================================================

/**
 * @description Get a project by ID
 * @param {string} id - Project ID
 * @returns {Promise<ProjectDto>} Project details
 */
export async function getProject(id: string): Promise<ProjectDto> {
    const response = await httpClient.get<ProjectResponseDto>(`/admin/projects/${id}`);
    return response.data.data;
}

/**
 * @description Update a project
 * @param {string} id - Project ID
 * @param {UpdateProjectRequestDto} data - Update data
 * @returns {Promise<ProjectDto>} Updated project
 */
export async function updateProject(id: string, data: UpdateProjectRequestDto): Promise<ProjectDto> {
    const response = await httpClient.patch<ProjectResponseDto>(`/admin/projects/${id}`, data);
    return response.data.data;
}

/**
 * @description Get all projects with optional filters
 * @param {Object} filters - Optional filters
 * @param {string} filters.clientId - Filter by client ID
 * @param {string} filters.userId - Filter by user ID
 * @returns {Promise<ProjectDto[]>} List of projects
 */
export async function getProjects(filters?: {
    clientId?: string;
    userId?: string;
}): Promise<ProjectDto[]> {
    const response = await httpClient.get<ListProjectsResponseDto>(
        '/admin/projects',
        { params: filters }
    );
    return response.data.data;
}

/**
 * @description Update project report type
 * @param {string} id - Project ID
 * @param {ReportType} reportType - New report type
 * @returns {Promise<ProjectDto>} Updated project
 */
export async function updateProjectReportType(
    id: string,
    reportType: ReportType
): Promise<ProjectDto> {
    const response = await httpClient.put<ProjectResponseDto>(
        `/admin/projects/${id}/report-type`,
        { reportType }
    );
    return response.data.data;
}

// ============================================================================
// Tasks
// ============================================================================

/**
 * @description Get a task by ID
 * @param {string} id - Task ID
 * @returns {Promise<TaskDto>} Task details
 */
export async function getTask(id: string): Promise<TaskDto> {
    const response = await httpClient.get<TaskResponseDto>(`/admin/tasks/${id}`);
    return response.data.data;
}

/**
 * @description Update a task
 * @param {string} id - Task ID
 * @param {UpdateTaskRequestDto} data - Update data
 * @returns {Promise<TaskDto>} Updated task
 */
export async function updateTask(id: string, data: UpdateTaskRequestDto): Promise<TaskDto> {
    const response = await httpClient.patch<TaskResponseDto>(`/admin/tasks/${id}`, data);
    return response.data.data;
}
