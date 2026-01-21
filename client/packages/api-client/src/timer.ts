import { httpClient } from './http';
import {
    StartTimerRequestDto,
    StartTimerResponseDto,
    StopTimerRequestDto,
    StopTimerResponseDto,
    TimerStatusResponseDto,
    CancelTimerResponseDto,
} from '@shared/types';

/**
 * Timer API client
 */
export const timerApi = {
    /**
     * Start a timer for today
     * @param data - work date in YYYY-MM-DD format
     * @returns Timer start response with id and startedAt
     */
    start: async (data: StartTimerRequestDto): Promise<StartTimerResponseDto['data']> => {
        const response = await httpClient.post<StartTimerResponseDto>('/timer/start', data);
        return response.data.data;
    },

    /**
     * Stop the running timer and create a time entry
     * @param data - task, location, and description
     * @returns Created time entry
     */
    stop: async (data: StopTimerRequestDto): Promise<StopTimerResponseDto['data']> => {
        const response = await httpClient.post<StopTimerResponseDto>('/timer/stop', data);
        return response.data.data;
    },

    /**
     * Get current timer status
     * @returns Timer status with isRunning, elapsedMinutes, and timer data
     */
    getStatus: async (): Promise<TimerStatusResponseDto['data']> => {
        const response = await httpClient.get<TimerStatusResponseDto>('/timer/status');
        return response.data.data;
    },

    /**
     * Cancel the running timer without saving
     * @returns Success message
     */
    cancel: async (): Promise<CancelTimerResponseDto['message']> => {
        const response = await httpClient.delete<CancelTimerResponseDto>('/timer/cancel');
        return response.data.message;
    },
};
