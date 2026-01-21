/**
 * @fileoverview API client and TanStack Query hooks for absence management
 * @module api/absencesApi
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient, type AxiosProgressEvent } from '@client/api-client';
import {
    CreateAbsenceRequestDto,
    UpdateAbsenceRequestDto,
    AbsenceRequestDto,
    ListAbsencesResponseDto,
    CreateAbsenceResponseDto,
    UpdateAbsenceResponseDto,
    DeleteAbsenceResponseDto,
    UploadAbsenceDocumentResponseDto,
    ListAbsenceDocumentsResponseDto,
} from '@shared/types';

// Query keys for TanStack Query
export const absenceKeys = {
    all: ['absences'] as const,
    lists: () => [...absenceKeys.all, 'list'] as const,
    list: (params?: { page?: number; pageSize?: number }) => [...absenceKeys.lists(), params] as const,
    details: () => [...absenceKeys.all, 'detail'] as const,
    detail: (id: string) => [...absenceKeys.details(), id] as const,
    documents: (absenceId: string) => [...absenceKeys.detail(absenceId), 'documents'] as const,
};

// ============================================================================
// API Client Methods
// ============================================================================

/**
 * API client for absence management operations
 */
export const absencesApi = {
    /**
     * Create a new absence request
     */
    createAbsence: async (data: CreateAbsenceRequestDto): Promise<AbsenceRequestDto> => {
        const response = await httpClient.post<CreateAbsenceResponseDto>('/absences', data);
        return response.data.data;
    },

    /**
     * Get list of user's absences with pagination
     */
    getAbsences: async (params?: { page?: number; pageSize?: number }): Promise<ListAbsencesResponseDto['data']> => {
        const response = await httpClient.get<ListAbsencesResponseDto>('/absences', { params });
        return response.data.data;
    },

    /**
     * Get single absence by ID
     */
    getAbsenceById: async (id: string): Promise<AbsenceRequestDto> => {
        const response = await httpClient.get<CreateAbsenceResponseDto>(`/absences/${id}`);
        return response.data.data;
    },

    /**
     * Update absence request
     */
    updateAbsence: async (id: string, data: UpdateAbsenceRequestDto): Promise<AbsenceRequestDto> => {
        const response = await httpClient.put<UpdateAbsenceResponseDto>(`/absences/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete absence request
     */
    deleteAbsence: async (id: string): Promise<void> => {
        await httpClient.delete<DeleteAbsenceResponseDto>(`/absences/${id}`);
    },

    /**
     * Upload document for absence request
     * @param absenceId - ID of the absence request
     * @param file - File to upload
     * @param onUploadProgress - Optional progress callback
     */
    uploadDocument: async (
        absenceId: string,
        file: File,
        onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
    ): Promise<UploadAbsenceDocumentResponseDto['data']> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await httpClient.post<UploadAbsenceDocumentResponseDto>(
            `/absences/${absenceId}/documents`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress,
            }
        );
        return response.data.data;
    },

    /**
     * Get list of documents for absence request
     */
    getDocuments: async (absenceId: string): Promise<ListAbsenceDocumentsResponseDto['data']> => {
        const response = await httpClient.get<ListAbsenceDocumentsResponseDto>(`/absences/${absenceId}/documents`);
        return response.data.data;
    },

    /**
     * Download document
     * @param absenceId - ID of the absence request
     * @param docId - ID of the document
     * @returns Signed URL or blob for download
     */
    downloadDocument: async (absenceId: string, docId: string): Promise<string> => {
        const response = await httpClient.get(`/absences/${absenceId}/documents/${docId}/download`, {
            responseType: 'blob',
        });
        // If response is a redirect to signed URL, extract it from Location header or return blob URL
        // For now, return blob URL - adjust based on actual API response
        return URL.createObjectURL(response.data);
    },

    /**
     * Delete document from absence request
     */
    deleteDocument: async (absenceId: string, docId: string): Promise<void> => {
        await httpClient.delete(`/absences/${absenceId}/documents/${docId}`);
    },
};

// ============================================================================
// Error Handling Helpers
// ============================================================================

/**
 * Maps API error response to Hebrew error message
 * @description Extracts error messages from Axios error responses and translates them to Hebrew.
 * Handles both single error messages and arrays of validation errors.
 * @param {unknown} error - The error object from API request (typically AxiosError)
 * @returns {string} Hebrew error message suitable for display to users
 * @example
 * ```tsx
 * try {
 *   await api.createAbsence(data);
 * } catch (error) {
 *   const hebrewError = getHebrewErrorMessage(error);
 *   toast.error(hebrewError);
 * }
 * ```
 */
function getHebrewErrorMessage(error: unknown): string {
    console.log('Error object:', error); // Debug log

    if (typeof error === 'object' && error !== null) {
        const axiosError = error as {
            response?: {
                data?: {
                    message?: string | string[];
                    error?: string;
                    errors?: unknown[];
                }
            };
            message?: string
        };

        // Check for axios error response
        if (axiosError.response?.data) {
            const data = axiosError.response.data;
            console.log('Error response data:', data); // Debug log

            // Handle array of messages (validation errors)
            if (Array.isArray(data.message)) {
                const firstMessage = data.message[0];
                return mapErrorToHebrew(String(firstMessage));
            }

            const apiMessage = data.message || data.error;
            if (apiMessage) {
                return mapErrorToHebrew(String(apiMessage));
            }
        }

        // Check for generic error message
        if (axiosError.message) {
            return mapErrorToHebrew(axiosError.message);
        }
    }

    return 'אירעה שגיאה בלתי צפויה. אנא נסה שוב.';
}

/**
 * Maps common error messages to Hebrew
 * @description Translates English error messages to Hebrew using a predefined mapping.
 * Supports both exact matches and partial string matching for flexibility.
 * @param {string} message - The English error message to translate
 * @returns {string} Hebrew translation of the error message, or the original message if no mapping exists
 * @example
 * ```tsx
 * const hebrewMsg = mapErrorToHebrew('Month is locked');
 * // Returns: 'החודש נעול ואי אפשר לערוך דיווחים'
 * ```
 */
function mapErrorToHebrew(message: string): string {
    // Ensure message is a string
    const messageStr = String(message || '');

    const errorMap: Record<string, string> = {
        'Month is locked': 'החודש נעול ואי אפשר לערוך דיווחים',
        'Absence not found': 'ההעדרות לא נמצאה',
        'Overlapping absence': 'קיים דיווח העדרות חופף לתאריכים שנבחרו',
        'Unauthorized': 'אין הרשאה לבצע פעולה זו',
        'File size exceeds limit': 'גודל הקובץ חורג מהמגבלה (10MB)',
        'Invalid file type': 'סוג קובץ לא נתמך. אפשר להעלות רק PDF, PNG, JPG',
        'Document required': 'נדרש לצרף מסמך עבור סוג העדרות זה',
        'Network Error': 'שגיאת רשת. בדוק את החיבור לאינטרנט',
        'Request timeout': 'פג הזמן הקצוב. אנא נסה שוב',
        'Foreign key constraint': 'שגיאה בנתוני המשתמש. אנא התחבר מחדש',
        'user_id_fkey': 'שגיאה בנתוני המשתמש. אנא התחבר מחדש',
        'Failed to upload file to storage': 'שגיאה בהעלאת הקובץ. אנא נסה שוב',
        'Storage is not configured': 'שירות העלאת קבצים אינו זמין כרגע',
        'שירות העלאת קבצים אינו זמין': 'שירות העלאת קבצים אינו זמין כרגע. הדיווח נשמר ללא קובץ',
    };

    // Check for exact match
    if (errorMap[messageStr]) {
        return errorMap[messageStr];
    }

    // Check for partial matches
    const messageLower = messageStr.toLowerCase();
    for (const [key, value] of Object.entries(errorMap)) {
        if (messageLower.includes(key.toLowerCase())) {
            return value;
        }
    }

    // Return original message if no mapping found
    return messageStr || 'אירעה שגיאה בלתי צפויה';
}

// ============================================================================
// TanStack Query Hooks
// ============================================================================

interface UseAbsencesOptions {
    page?: number;
    pageSize?: number;
    enabled?: boolean;
}

/**
 * Query hook to fetch list of absences with pagination
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAbsences({ page: 1, pageSize: 20 });
 * ```
 */
export function useAbsences(options?: UseAbsencesOptions) {
    const { page, pageSize, enabled = true } = options || {};

    return useQuery({
        queryKey: absenceKeys.list({ page, pageSize }),
        queryFn: () => absencesApi.getAbsences({ page, pageSize }),
        enabled,
        staleTime: 30000, // 30 seconds
    });
}

/**
 * Query hook to fetch single absence by ID
 * @param id - Absence ID
 * @param enabled - Whether the query should run (default: true)
 * @example
 * ```tsx
 * const { data, isLoading } = useAbsenceById('123');
 * ```
 */
export function useAbsenceById(id: string, enabled = true) {
    return useQuery({
        queryKey: absenceKeys.detail(id),
        queryFn: () => absencesApi.getAbsenceById(id),
        enabled: enabled && !!id,
        staleTime: 30000,
    });
}

interface CreateAbsenceMutationOptions {
    onSuccess?: (data: AbsenceRequestDto) => void;
    onError?: (error: unknown) => void;
}

/**
 * Mutation hook to create absence request
 * @example
 * ```tsx
 * const createMutation = useCreateAbsence({
 *   onSuccess: (data) => console.log('Created:', data),
 * });
 * createMutation.mutate(absenceData);
 * ```
 */
export function useCreateAbsence(options?: CreateAbsenceMutationOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: absencesApi.createAbsence,
        onSuccess: (data: AbsenceRequestDto) => {
            // Invalidate absences list to refetch
            queryClient.invalidateQueries({ queryKey: absenceKeys.lists() });
            options?.onSuccess?.(data);
        },
        onError: (error: unknown) => {
            const hebrewError = getHebrewErrorMessage(error);
            options?.onError?.(hebrewError);
        },
    });
}

interface UpdateAbsenceMutationOptions {
    onSuccess?: (data: AbsenceRequestDto) => void;
    onError?: (error: unknown) => void;
}

/**
 * Mutation hook to update absence request
 * @example
 * ```tsx
 * const updateMutation = useUpdateAbsence({
 *   onSuccess: (data) => console.log('Updated:', data),
 * });
 * updateMutation.mutate({ id: '123', data: updateData });
 * ```
 */
export function useUpdateAbsence(options?: UpdateAbsenceMutationOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAbsenceRequestDto }) =>
            absencesApi.updateAbsence(id, data),
        onSuccess: (data: AbsenceRequestDto, variables: { id: string; data: UpdateAbsenceRequestDto }) => {
            // Invalidate both list and detail queries
            queryClient.invalidateQueries({ queryKey: absenceKeys.lists() });
            queryClient.invalidateQueries({ queryKey: absenceKeys.detail(variables.id) });
            options?.onSuccess?.(data);
        },
        onError: (error: unknown) => {
            const hebrewError = getHebrewErrorMessage(error);
            options?.onError?.(hebrewError);
        },
    });
}

interface DeleteAbsenceMutationOptions {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}

/**
 * Mutation hook to delete absence request
 * @example
 * ```tsx
 * const deleteMutation = useDeleteAbsence({
 *   onSuccess: () => console.log('Deleted'),
 * });
 * deleteMutation.mutate('123');
 * ```
 */
export function useDeleteAbsence(options?: DeleteAbsenceMutationOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: absencesApi.deleteAbsence,
        onSuccess: (_: void, id: string) => {
            // Remove from cache and invalidate list
            queryClient.removeQueries({ queryKey: absenceKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: absenceKeys.lists() });
            options?.onSuccess?.();
        },
        onError: (error: unknown) => {
            const hebrewError = getHebrewErrorMessage(error);
            options?.onError?.(hebrewError);
        },
    });
}

interface UploadDocumentMutationOptions {
    onProgress?: (progress: number) => void;
    onSuccess?: (data: UploadAbsenceDocumentResponseDto['data']) => void;
    onError?: (error: unknown) => void;
}

/**
 * Mutation hook to upload document with progress tracking
 * @example
 * ```tsx
 * const uploadMutation = useUploadDocument({
 *   onProgress: (progress) => console.log(`${progress}%`),
 *   onSuccess: (data) => console.log('Uploaded:', data),
 * });
 * uploadMutation.mutate({ absenceId: '123', file: fileObject });
 * ```
 */
export function useUploadDocument(options?: UploadDocumentMutationOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ absenceId, file }: { absenceId: string; file: File }) =>
            absencesApi.uploadDocument(absenceId, file, (progressEvent) => {
                if (progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    options?.onProgress?.(progress);
                }
            }),
        onSuccess: (data: UploadAbsenceDocumentResponseDto['data'], variables: { absenceId: string; file: File }) => {
            // Invalidate absence detail and documents list
            queryClient.invalidateQueries({ queryKey: absenceKeys.detail(variables.absenceId) });
            queryClient.invalidateQueries({ queryKey: absenceKeys.documents(variables.absenceId) });
            options?.onSuccess?.(data);
        },
        onError: (error: unknown) => {
            const hebrewError = getHebrewErrorMessage(error);
            options?.onError?.(hebrewError);
        },
    });
}

/**
 * Query hook to fetch documents for an absence request
 * @param absenceId - Absence ID
 * @param enabled - Whether the query should run (default: true)
 */
export function useAbsenceDocuments(absenceId: string, enabled = true) {
    return useQuery({
        queryKey: absenceKeys.documents(absenceId),
        queryFn: () => absencesApi.getDocuments(absenceId),
        enabled: enabled && !!absenceId,
        staleTime: 60000, // 1 minute
    });
}

interface DeleteDocumentMutationOptions {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}

/**
 * Mutation hook to delete document
 * @example
 * ```tsx
 * const deleteMutation = useDeleteDocument({
 *   onSuccess: () => console.log('Document deleted'),
 * });
 * deleteMutation.mutate({ absenceId: '123', docId: '456' });
 * ```
 */
export function useDeleteDocument(options?: DeleteDocumentMutationOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ absenceId, docId }: { absenceId: string; docId: string }) =>
            absencesApi.deleteDocument(absenceId, docId),
        onSuccess: (_: void, variables: { absenceId: string; docId: string }) => {
            // Invalidate documents list and absence detail
            queryClient.invalidateQueries({ queryKey: absenceKeys.documents(variables.absenceId) });
            queryClient.invalidateQueries({ queryKey: absenceKeys.detail(variables.absenceId) });
            options?.onSuccess?.();
        },
        onError: (error: unknown) => {
            const hebrewError = getHebrewErrorMessage(error);
            options?.onError?.(hebrewError);
        },
    });
}
