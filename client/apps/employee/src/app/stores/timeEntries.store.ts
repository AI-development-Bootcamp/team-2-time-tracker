import { create } from 'zustand';
import { CreateTimeEntryInput, TimeEntryDto } from '@shared/types';
import { httpClient as apiClient } from '@client/api-client';

interface TimeEntryStore {
    entries: TimeEntryDto[];
    isLoading: boolean;
    error: string | null;

    setEntries: (entries: TimeEntryDto[]) => void;
    addEntry: (entry: TimeEntryDto) => void;
    updateEntry: (entry: TimeEntryDto) => void;
    removeEntry: (id: string) => void;
    createTimeEntry: (data: CreateTimeEntryInput) => Promise<TimeEntryDto>;
    updateTimeEntry: (id: string, data: Partial<CreateTimeEntryInput>) => Promise<TimeEntryDto>;
    deleteTimeEntry: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useTimeEntryStore = create<TimeEntryStore>((set, get) => ({
    entries: [],
    isLoading: false,
    error: null,

    setEntries: (entries: TimeEntryDto[]) => set({ entries }),

    addEntry: (entry: TimeEntryDto) => {
        const currentEntries = get().entries;
        // Check if entry already exists
        const exists = currentEntries.some(e => e.id === entry.id);
        if (!exists) {
            set({ entries: [...currentEntries, entry] });
        }
    },

    updateEntry: (entry: TimeEntryDto) => {
        const currentEntries = get().entries;
        set({
            entries: currentEntries.map(e => e.id === entry.id ? entry : e)
        });
    },

    removeEntry: (id: string) => {
        const currentEntries = get().entries;
        set({
            entries: currentEntries.filter(e => e.id !== id)
        });
    },

    createTimeEntry: async (data: CreateTimeEntryInput) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post<{ success: boolean; data: TimeEntryDto }>('/time-entries', data);
            const newEntry = response.data.data;

            // Add to store
            get().addEntry(newEntry);

            set({ isLoading: false });
            return newEntry;
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
            const response = await apiClient.put<{ success: boolean; data: TimeEntryDto }>(`/time-entries/${id}`, data);
            const updatedEntry = response.data.data;

            // Update in store
            get().updateEntry(updatedEntry);

            set({ isLoading: false });
            return updatedEntry;
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

            // Remove from store
            get().removeEntry(id);

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

