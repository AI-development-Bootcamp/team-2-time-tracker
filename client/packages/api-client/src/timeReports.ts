import { httpClient } from './http';
import {
    CreateTimeEntryInput,
    UpdateTimeEntryInput,
    TimeEntryHistoryQuery,
    GetHistoryResponseDto,
    UpsertTimeEntryResponseDto,
    DeleteTimeEntryResponseDto,
    BatchCreateTimeEntriesInput,
    BatchCreateTimeEntriesResponseDto,
} from '@shared/types';

const BASE_PATH = '/time-entries';

export const timeReportsApi = {
    create: async (data: CreateTimeEntryInput) => {
        const response = await httpClient.post<UpsertTimeEntryResponseDto>(
            BASE_PATH,
            data
        );
        return response.data;
    },

    getById: async (id: string) => {
        const response = await httpClient.get<UpsertTimeEntryResponseDto>(
            `${BASE_PATH}/${id}`
        );
        return response.data;
    },

    update: async (id: string, data: UpdateTimeEntryInput) => {
        const response = await httpClient.put<UpsertTimeEntryResponseDto>(
            `${BASE_PATH}/${id}`,
            data
        );
        return response.data;
    },

    delete: async (id: string) => {
        const response = await httpClient.delete<DeleteTimeEntryResponseDto>(
            `${BASE_PATH}/${id}`
        );
        return response.data;
    },

    getHistory: async (params?: TimeEntryHistoryQuery) => {
        const response = await httpClient.get<GetHistoryResponseDto>(
            `${BASE_PATH}/history`,
            { params }
        );
        return response.data;
    },

    batchCreate: async (data: BatchCreateTimeEntriesInput) => {
        const response = await httpClient.post<BatchCreateTimeEntriesResponseDto>(
            `${BASE_PATH}/batch`,
            data
        );
        return response.data;
    },
};
