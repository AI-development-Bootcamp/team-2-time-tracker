import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { timerApi } from '@client/api-client';
import { TimerDto, StopTimerRequestDto, TimeEntryDto } from '@shared/types';

interface TimerState {
    /** Current timer data */
    timer: TimerDto | null;
    /** Whether timer is running */
    isRunning: boolean;
    /** Elapsed minutes from server */
    elapsedMinutes: number;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;

    /** Start a new timer */
    startTimer: () => Promise<void>;
    /** Stop timer and create time entry */
    stopTimer: (data: Omit<StopTimerRequestDto, 'timerId'>) => Promise<TimeEntryDto | null>;
    /** Cancel timer without saving */
    cancelTimer: () => Promise<void>;
    /** Fetch current timer status from server */
    fetchStatus: () => Promise<void>;
    /** Update elapsed time locally (called by interval) */
    tick: () => void;
    /** Clear error */
    clearError: () => void;
}

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
