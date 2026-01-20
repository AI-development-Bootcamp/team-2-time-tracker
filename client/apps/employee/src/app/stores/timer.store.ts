/**
 * @fileoverview Zustand store for timer state management
 * @module stores/timer.store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { timerApi } from '@client/api-client';
import { TimerDto, StopTimerRequestDto, TimeEntryDto } from '@shared/types';

/**
 * Timer store state interface
 * @description Manages work timer state and operations for tracking work time
 */
interface TimerState {
    /** Current timer data from server */
    timer: TimerDto | null;
    /** Whether timer is currently running */
    isRunning: boolean;
    /** Elapsed minutes calculated from start time */
    elapsedMinutes: number;
    /** Loading state for async timer operations */
    isLoading: boolean;
    /** Error message from timer operations */
    error: string | null;

    /**
     * Start a new work timer
     * @description Creates a new timer for today's date
     * @returns {Promise<void>}
     * @throws {Error} When timer start fails or timer already running
     */
    startTimer: () => Promise<void>;

    /**
     * Stop timer and create time entry
     * @description Stops the running timer and converts it to a time entry with task details
     * @param {Omit<StopTimerRequestDto, 'timerId'>} data - Time entry details (task, location, description)
     * @returns {Promise<TimeEntryDto | null>} Created time entry or null if failed
     * @throws {Error} When timer stop fails
     */
    stopTimer: (data: Omit<StopTimerRequestDto, 'timerId'>) => Promise<TimeEntryDto | null>;

    /**
     * Cancel timer without saving
     * @description Cancels the running timer without creating a time entry
     * @returns {Promise<void>}
     * @throws {Error} When timer cancellation fails
     */
    cancelTimer: () => Promise<void>;

    /**
     * Fetch current timer status from server
     * @description Syncs local timer state with server state
     * @returns {Promise<void>}
     */
    fetchStatus: () => Promise<void>;

    /**
     * Update elapsed time locally
     * @description Called by interval to update elapsed minutes based on start time.
     * Should be called every minute when timer is running.
     */
    tick: () => void;

    /**
     * Clear error message
     */
    clearError: () => void;
}

/**
 * Zustand store for timer management
 * @description Manages work timer state with real-time elapsed time tracking.
 * Integrates with timer API for start, stop, and cancel operations.
 * @example
 * ```tsx
 * const { isRunning, startTimer, stopTimer, elapsedMinutes } = useTimerStore();
 * 
 * // Start timer
 * await startTimer();
 * 
 * // Stop timer and create time entry
 * const entry = await stopTimer({
 *   taskId: 'task-123',
 *   location: 'OFFICE',
 *   description: 'Working on feature'
 * });
 * ```
 */
export const useTimerStore = create<TimerState>()(
    devtools(
        (set, get) => ({
            timer: null,
            isRunning: false,
            elapsedMinutes: 0,
            isLoading: false,
            error: null,

            startTimer: async () => {
                set({ isLoading: true, error: null });
                try {
                    const today = new Date().toISOString().split('T')[0];
                    const response = await timerApi.start({ workDate: today });

                    set({
                        timer: {
                            id: response.id,
                            userId: '',
                            workDate: today,
                            startedAt: response.startedAt,
                            stoppedAt: null,
                            durationMinutes: null,
                            isRunning: true,
                            createdAt: response.startedAt,
                            updatedAt: response.startedAt,
                        },
                        isRunning: true,
                        elapsedMinutes: 0,
                        isLoading: false,
                    });
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to start timer';
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            stopTimer: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const timeEntry = await timerApi.stop(data);

                    set({
                        timer: null,
                        isRunning: false,
                        elapsedMinutes: 0,
                        isLoading: false,
                    });

                    return timeEntry;
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to stop timer';
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            cancelTimer: async () => {
                set({ isLoading: true, error: null });
                try {
                    await timerApi.cancel();

                    set({
                        timer: null,
                        isRunning: false,
                        elapsedMinutes: 0,
                        isLoading: false,
                    });
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to cancel timer';
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            fetchStatus: async () => {
                try {
                    const status = await timerApi.getStatus();

                    set({
                        timer: status.timer,
                        isRunning: status.isRunning,
                        elapsedMinutes: status.elapsedMinutes ?? 0,
                    });
                } catch (error) {
                    console.error('Failed to fetch timer status:', error);
                }
            },

            tick: () => {
                const { isRunning, timer } = get();
                if (isRunning && timer) {
                    // Calculate elapsed from startedAt
                    const startedAt = new Date(timer.startedAt);
                    const now = new Date();
                    const elapsedMs = now.getTime() - startedAt.getTime();
                    const elapsedMinutes = Math.floor(elapsedMs / 60000);
                    set({ elapsedMinutes });
                }
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'timer-store' }
    )
);
