/**
 * @fileoverview Zustand store for time entries management
 * @module stores/timeEntries.store
 */

import { create } from 'zustand';
import { CreateTimeEntryInput, TimeEntryDto } from '@shared/types';
import { httpClient as apiClient } from '@client/api-client';

/**
 * Time entry store state interface
 * @description Manages time entries with CRUD operations and local state caching
 */
interface TimeEntryStore {
    /** Cached time entries */
    entries: TimeEntryDto[];
    /** Loading state for async operations */
    isLoading: boolean;
    /** Error message from operations */
    error: string | null;

    /**
     * Set all time entries
     * @param {TimeEntryDto[]} entries - Array of time entries to set
     */
    setEntries: (entries: TimeEntryDto[]) => void;

    /**
     * Add a new entry to the store
     * @description Adds entry only if it doesn't already exist (checks by ID)
     * @param {TimeEntryDto} entry - Time entry to add
     */
    addEntry: (entry: TimeEntryDto) => void;

    /**
     * Update an existing entry in the store
     * @param {TimeEntryDto} entry - Updated time entry
     */
    updateEntry: (entry: TimeEntryDto) => void;

    /**
     * Remove an entry from the store
     * @param {string} id - ID of entry to remove
     */
    removeEntry: (id: string) => void;

    /**
     * Create a new time entry via API
     * @description Creates time entry on server and adds to local store
     * @param {CreateTimeEntryInput} data - Time entry data
     * @returns {Promise<TimeEntryDto>} Created time entry
     * @throws {Error} When creation fails
     */
    createTimeEntry: (data: CreateTimeEntryInput) => Promise<TimeEntryDto>;

    /**
     * Update an existing time entry via API
     * @param {string} id - ID of entry to update
     * @param {Partial<CreateTimeEntryInput>} data - Partial update data
     * @returns {Promise<TimeEntryDto>} Updated time entry
     * @throws {Error} When update fails
     */
    updateTimeEntry: (id: string, data: Partial<CreateTimeEntryInput>) => Promise<TimeEntryDto>;

    /**
     * Delete a time entry via API
     * @param {string} id - ID of entry to delete
     * @returns {Promise<void>}
     * @throws {Error} When deletion fails
     */
    deleteTimeEntry: (id: string) => Promise<void>;

    /**
     * Clear error message
     */
    clearError: () => void;
}

/**
 * Zustand store for time entries management
 * @description Manages time entries with local caching and API integration.
 * Provides CRUD operations for time entries.
 * @example
 * ```tsx
 * const { entries, createTimeEntry, isLoading } = useTimeEntryStore();
 * 
 * // Create new entry
 * const entry = await createTimeEntry({
 *   workDate: '2026-01-20',
 *   taskId: 'task-123',
 *   location: 'OFFICE',
 *   startTime: '09:00',
 *   endTime: '17:00',
 *   description: 'Development work'
 * });
 * ```
 */
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

