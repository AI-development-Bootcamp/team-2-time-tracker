import { httpClient } from './http';
import {
    ClientSelectorDto,
    ProjectSelectorDto,
    TaskSelectorDto
} from '@shared/types';

interface BaseResponse<T> {
    success: boolean;
    data: T;
}

export const selectorsApi = {
    getClients: async (sort: 'alpha' | 'frequency' = 'alpha') => {
        const response = await httpClient.get<BaseResponse<ClientSelectorDto[]>>('/selectors/clients', {
            params: { sort }
        });
        return response.data.data;
    },

    getProjects: async (clientId?: string, sort: 'alpha' | 'frequency' = 'alpha') => {
        const response = await httpClient.get<BaseResponse<ProjectSelectorDto[]>>('/selectors/projects', {
            params: { clientId, sort }
        });
        return response.data.data;
    },

    getTasks: async (projectId?: string, sort: 'alpha' | 'frequency' = 'alpha') => {
        const response = await httpClient.get<BaseResponse<TaskSelectorDto[]>>('/selectors/tasks', {
            params: { projectId, sort }
        });
        return response.data.data;
    }
};
