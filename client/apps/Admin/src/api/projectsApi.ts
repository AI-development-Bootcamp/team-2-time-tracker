import { httpClient } from '@client/api-client';
import type {
    ProjectResponseDto,
    ListProjectsResponseDto,
    UpdateProjectRequestDto,
    UpdateProjectStatusRequestDto,
    UpdateProjectReportTypeRequestDto,
} from '@shared/types';

interface CreateProjectRequestDto {
    name: string;
    clientId: string;
    description?: string;
    reportType?: string;
    startDate?: string | null;
    endDate?: string | null;
}

export const projectsApi = {
    createProject: async (data: CreateProjectRequestDto): Promise<ProjectResponseDto['data']> => {
        const response = await httpClient.post<ProjectResponseDto>('/admin/projects', data);
        return response.data.data;
    },

    getProjects: async (clientId?: string): Promise<ListProjectsResponseDto['data']> => {
        const params = clientId ? { clientId } : {};
        const response = await httpClient.get<ListProjectsResponseDto>('/admin/projects', { params });
        return response.data.data;
    },

    getProjectById: async (projectId: string): Promise<ProjectResponseDto['data']> => {
        const response = await httpClient.get<ProjectResponseDto>(`/admin/projects/${projectId}`);
        return response.data.data;
    },

    updateProject: async (projectId: string, data: UpdateProjectRequestDto): Promise<ProjectResponseDto['data']> => {
        const response = await httpClient.put<ProjectResponseDto>(`/admin/projects/${projectId}`, data);
        return response.data.data;
    },

    updateProjectStatus: async (projectId: string, data: UpdateProjectStatusRequestDto): Promise<ProjectResponseDto['data']> => {
        const response = await httpClient.put<ProjectResponseDto>(`/admin/projects/${projectId}/status`, data);
        return response.data.data;
    },

    updateProjectReportType: async (projectId: string, data: UpdateProjectReportTypeRequestDto): Promise<ProjectResponseDto['data']> => {
        const response = await httpClient.put<ProjectResponseDto>(`/admin/projects/${projectId}/report-type`, data);
        return response.data.data;
    },
};
