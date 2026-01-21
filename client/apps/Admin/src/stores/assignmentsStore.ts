/**
 * @fileoverview Assignments store using Zustand for state management
 * @module stores/assignmentsStore
 */

import { create } from 'zustand';
import type { TaskAssignmentDto, CreateTaskAssignmentRequestDto, BulkCreateTaskAssignmentsRequestDto } from '@shared/types';
import { getAssignments, createAssignment, bulkCreateAssignments, deleteAssignment } from '../api/assignmentsApi';

interface AssignmentsState {
    assignments: TaskAssignmentDto[];
    isLoading: boolean;
    error: string | null;
    filters: {
        userId?: string;
        taskId?: string;
        projectId?: string;
        userName?: string;
    };
}

interface AssignmentsActions {
    fetchAssignments: () => Promise<void>;
    createSingleAssignment: (data: CreateTaskAssignmentRequestDto) => Promise<TaskAssignmentDto>;
    createBulkAssignments: (data: BulkCreateTaskAssignmentsRequestDto) => Promise<{ count: number; created: TaskAssignmentDto[] }>;
    removeAssignment: (id: string) => Promise<void>;
    setFilters: (filters: AssignmentsState['filters']) => void;
    clearError: () => void;
}

type AssignmentsStore = AssignmentsState & AssignmentsActions;

const initialState: AssignmentsState = {
    assignments: [],
    isLoading: false,
    error: null,
    filters: {},
};

/**
 * @description Zustand store for assignments state management
 * Manages assignments list, CRUD operations, and filtering
 */
export const useAssignmentsStore = create<AssignmentsStore>()((set, get) => ({
    ...initialState,

    /**
     * @description Fetches assignments from the API with current filters
     */
    fetchAssignments: async () => {
        set({ isLoading: true, error: null });

        try {
            const { filters } = get();
            const assignments = await getAssignments(filters);
            set({ assignments, isLoading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch assignments';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    /**
     * @description Creates a single task assignment
     * @param {CreateTaskAssignmentRequestDto} data - Assignment data (userId, taskId)
     * @returns {Promise<TaskAssignmentDto>} Created assignment
     */
    createSingleAssignment: async (data: CreateTaskAssignmentRequestDto) => {
        set({ isLoading: true, error: null });

        try {
            const newAssignment = await createAssignment(data);

            // Add new assignment to the list
            set((state) => ({
                assignments: [...state.assignments, newAssignment],
                isLoading: false,
            }));

            return newAssignment;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create assignment';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    /**
     * @description Creates multiple task assignments using cartesian product
     * @param {BulkCreateTaskAssignmentsRequestDto} data - Bulk assignment data (userIds[], taskIds[])
     * @returns {Promise<{count: number, created: TaskAssignmentDto[]}>} Created assignments and count
     */
    createBulkAssignments: async (data: BulkCreateTaskAssignmentsRequestDto) => {
        set({ isLoading: true, error: null });

        try {
            const result = await bulkCreateAssignments(data);

            // Add new assignments to the list
            set((state) => ({
                assignments: [...state.assignments, ...result.created],
                isLoading: false,
            }));

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create bulk assignments';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    /**
     * @description Removes a task assignment
     * @param {string} id - Assignment ID to delete
     */
    removeAssignment: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
            await deleteAssignment(id);

            // Remove assignment from the list
            set((state) => ({
                assignments: state.assignments.filter(assignment => assignment.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete assignment';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    /**
     * @description Updates filter criteria and refetches assignments
     * @param {Object} filters - Filter criteria
     */
    setFilters: (filters: AssignmentsState['filters']) => {
        set({ filters });
        // Automatically refetch with new filters
        get().fetchAssignments();
    },

    /**
     * @description Clears the current error message
     */
    clearError: () => {
        set({ error: null });
    },
}));
