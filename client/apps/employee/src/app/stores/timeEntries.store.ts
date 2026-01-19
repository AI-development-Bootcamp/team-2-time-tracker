import { create } from 'zustand';
import { CreateTimeEntryInput } from '@shared/types';
import { httpClient as apiClient } from '@client/api-client';

interface TimeEntryStore {
    isLoading: boolean;
    error: string | null;

    createTimeEntry: (data: CreateTimeEntryInput) => Promise<void>;
    updateTimeEntry: (id: string, data: Partial<CreateTimeEntryInput>) => Promise<void>;
    deleteTimeEntry: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useTimeEntryStore = create<TimeEntryStore>((set) => ({
    isLoading: false,
    error: null,

    createTimeEntry: async (data: CreateTimeEntryInput) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.post('/time-entries', data);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.error || 'Failed to create time entry'
            });
            throw error;
        }
    },

    updateTimeEntry: async (id: string, data: Partial<CreateTimeEntryInput>) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.put(`/time-entries/${id}`, data);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.error || 'Failed to update time entry'
            });
            throw error;
        }
    },

    deleteTimeEntry: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.delete(`/time-entries/${id}`);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.error || 'Failed to delete time entry'
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
