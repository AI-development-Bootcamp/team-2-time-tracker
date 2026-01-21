import { httpClient } from '@client/api-client';
import type {
    TaskResponseDto,
    ListTasksResponseDto,
    CreateTaskRequestDto,
} from '@shared/types';

export const tasksApi = {
    createTask: async (data: CreateTaskRequestDto): Promise<TaskResponseDto['data']> => {
        const response = await httpClient.post<TaskResponseDto>('/admin/tasks', data);
        return response.data.data;
    },

    getTasks: async (projectId?: string): Promise<ListTasksResponseDto['data']> => {
        const params = projectId ? { projectId } : {};
        const response = await httpClient.get<ListTasksResponseDto>('/admin/tasks', { params });
        return response.data.data;
    },
};
