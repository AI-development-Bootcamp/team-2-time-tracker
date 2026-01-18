/**
 * @fileoverview Zustand store for absence form state management
 * @module stores/absence.store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AbsenceFormData } from '@client/ui';
// Note: Import types are used for integration with TanStack Query hooks (task 2.10)
// The store manages local form state; API calls are handled by TanStack Query mutations

/** Form mode: single date or date range */
export type AbsenceFormMode = 'single' | 'range';

/** Absence store state interface */
interface AbsenceState {
    // Form state
    formMode: AbsenceFormMode;
    absenceType: string | null;
    singleDate: Date | null;
    dateRange: { from: Date | null; to: Date | null };
    uploadedDocument: File | null;
    note: string;

    // Loading and error states
    isLoading: boolean;
    isUploading: boolean;
    uploadProgress: number;
    error: string | null;

    // Actions for form state
    setFormMode: (mode: AbsenceFormMode) => void;
    setAbsenceType: (type: string | null) => void;
    setSingleDate: (date: Date | null) => void;
    setDateRange: (from: Date | null, to: Date | null) => void;
    setUploadedDocument: (file: File | null) => void;
    setNote: (note: string) => void;
    resetForm: () => void;

    // Actions for creating absence
    // These actions can be called from TanStack Query mutation hooks (see task 2.10)
    setCreateAbsenceLoading: (isLoading: boolean) => void;
    setCreateAbsenceError: (error: string | null) => void;
    setCreateAbsenceSuccess: () => void; // Reset form and clear state on success

    // Actions for uploading document
    // These actions can be called from TanStack Query mutation hooks (see task 2.10)
    setUploadProgress: (progress: number) => void;
    setUploading: (isUploading: boolean) => void;
    setUploadError: (error: string | null) => void;
    setUploadSuccess: () => void; // Clear upload state on success

    // Helper to get form data
    getFormData: () => AbsenceFormData | null;
}

/** Default initial state */
const initialState = {
    formMode: 'range' as AbsenceFormMode,
    absenceType: null,
    singleDate: null,
    dateRange: { from: null, to: null },
    uploadedDocument: null,
    note: '',
    isLoading: false,
    isUploading: false,
    uploadProgress: 0,
    error: null,
};

/**
 * Zustand store for absence form state management
 * @description Manages form state for absence reporting with integration points for TanStack Query
 * 
 * Integration with TanStack Query (task 2.10):
 * - TanStack Query mutation hooks (useCreateAbsence, useUploadDocument) will call store setters
 * - Store manages local form state (dates, type, document, loading, errors)
 * - API calls are handled by TanStack Query hooks, which update store state via setters
 * 
 * @example
 * ```tsx
 * // In a component using TanStack Query hook:
 * const { formMode, setFormMode, setCreateAbsenceLoading } = useAbsenceStore();
 * const createMutation = useCreateAbsence(); // From task 2.10
 * 
 * // TanStack Query mutation will call store setters:
 * createMutation.mutate(data, {
 *   onMutate: () => setCreateAbsenceLoading(true),
 *   onSuccess: () => setCreateAbsenceSuccess(),
 *   onError: (err) => setCreateAbsenceError(err.message),
 * });
 * ```
 */
export const useAbsenceStore = create<AbsenceState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Form state actions
            setFormMode: (mode: AbsenceFormMode) => {
                set({ formMode: mode }, false, 'setFormMode');
            },

            setAbsenceType: (type: string | null) => {
                set({ absenceType: type }, false, 'setAbsenceType');
            },

            setSingleDate: (date: Date | null) => {
                set({ singleDate: date }, false, 'setSingleDate');
            },

            setDateRange: (from: Date | null, to: Date | null) => {
                set(
                    { dateRange: { from, to } },
                    false,
                    'setDateRange'
                );
            },

            setUploadedDocument: (file: File | null) => {
                set({ uploadedDocument: file }, false, 'setUploadedDocument');
            },

            setNote: (note: string) => {
                set({ note }, false, 'setNote');
            },

            resetForm: () => {
                set(initialState, false, 'resetForm');
            },

            // Actions for creating absence (to be called from TanStack Query mutation hooks)
            setCreateAbsenceLoading: (isLoading: boolean) => {
                set({ isLoading }, false, 'setCreateAbsenceLoading');
            },

            setCreateAbsenceError: (error: string | null) => {
                set({ error }, false, 'setCreateAbsenceError');
            },

            setCreateAbsenceSuccess: () => {
                // Reset form and clear state on successful creation
                set(
                    {
                        ...initialState,
                        formMode: get().formMode, // Preserve form mode preference
                    },
                    false,
                    'setCreateAbsenceSuccess'
                );
            },

            // Actions for uploading document (to be called from TanStack Query mutation hooks)
            setUploadProgress: (progress: number) => {
                set({ uploadProgress: progress }, false, 'setUploadProgress');
            },

            setUploading: (isUploading: boolean) => {
                set({ isUploading }, false, 'setUploading');
            },

            setUploadError: (error: string | null) => {
                set({ error }, false, 'setUploadError');
            },

            setUploadSuccess: () => {
                // Clear upload state on successful upload
                set(
                    {
                        isUploading: false,
                        uploadProgress: 0,
                        error: null,
                        uploadedDocument: null, // Clear file after successful upload
                    },
                    false,
                    'setUploadSuccess'
                );
            },

            // Helper to get current form data
            getFormData: (): AbsenceFormData | null => {
                const state = get();
                const { formMode, absenceType, singleDate, dateRange, note } = state;

                // Validate that required fields are present
                if (formMode === 'single') {
                    if (!singleDate || !absenceType) {
                        return null;
                    }
                    return {
                        dateMode: 'single',
                        absenceType: absenceType || undefined,
                        singleDate: singleDate || undefined,
                        note: note || undefined,
                    };
                }

                if (formMode === 'range') {
                    if (!dateRange.from) {
                        return null;
                    }
                    return {
                        dateMode: 'range',
                        dateRange: {
                            from: dateRange.from || undefined,
                            to: dateRange.to || undefined,
                        },
                        note: note || undefined,
                    };
                }

                return null;
            },
        }),
        {
            name: 'absence-store',
        }
    )
);
