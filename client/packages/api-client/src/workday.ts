import { httpClient } from './http';
import {
    GetWorkdayResponseDto,
    SubmitWorkdayResponseDto,
    CancelWorkdayResponseDto,
    GetMonthlyCalendarResponseDto,
} from '@shared/types';

const BASE_PATH = '/workday';

/**
 * @description Workday API client for managing daily workday summaries
 */
export const workdayApi = {
    /**
     * @description Get workday data for a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Promise<GetWorkdayResponseDto>} Workday data including summary, entries, and absences
     */
    getWorkday: async (date: string): Promise<GetWorkdayResponseDto> => {
        const response = await httpClient.get<GetWorkdayResponseDto>(
            `${BASE_PATH}/${date}`
        );
        return response.data;
    },

    /**
     * @description Submit a workday for approval
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Promise<SubmitWorkdayResponseDto>} Submission confirmation
     */
    submitWorkday: async (date: string): Promise<SubmitWorkdayResponseDto> => {
        const response = await httpClient.post<SubmitWorkdayResponseDto>(
            `${BASE_PATH}/${date}/submit`
        );
        return response.data;
    },

    /**
     * @description Cancel a workday submission
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Promise<CancelWorkdayResponseDto>} Cancellation confirmation
     */
    cancelWorkday: async (date: string): Promise<CancelWorkdayResponseDto> => {
        const response = await httpClient.post<CancelWorkdayResponseDto>(
            `${BASE_PATH}/${date}/cancel`
        );
        return response.data;
    },

    /**
     * @description Get monthly calendar view with all days and their status
     * @param {string} month - Month in YYYY-MM format
     * @returns {Promise<GetMonthlyCalendarResponseDto>} Calendar data with all days and summary
     */
    getMonthlyCalendar: async (month: string): Promise<GetMonthlyCalendarResponseDto> => {
        const response = await httpClient.get<GetMonthlyCalendarResponseDto>(
            `${BASE_PATH}/calendar/${month}`
        );
        return response.data;
    },
};
