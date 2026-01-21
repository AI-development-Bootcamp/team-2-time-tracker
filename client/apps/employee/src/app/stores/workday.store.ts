import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { workdayApi } from '@client/api-client';
import {
    WorkdaySummaryDto,
    TimeEntryDto,
    CalendarDayDto,
    MonthlyCalendarSummaryDto,
    WorkdayStatus,
} from '@shared/types';

/**
 * Workday data structure
 */
interface WorkdayData {
    date: string;
    status: WorkdayStatus;
    isLocked: boolean;
    isSubmitted: boolean;
    summary: WorkdaySummaryDto;
    timeEntries: TimeEntryDto[];
    absences: unknown[];
}

/**
 * Calendar data structure
 */
interface CalendarData {
    month: string;
    days: CalendarDayDto[];
    summary: MonthlyCalendarSummaryDto;
}

/**
 * Workday store state
 */
interface WorkdayState {
    /** Current workday data */
    currentWorkday: WorkdayData | null;
    /** Monthly calendar data */
    calendar: CalendarData | null;
    /** Currently selected date (YYYY-MM-DD) */
    selectedDate: string;
    /** Currently selected month (YYYY-MM) */
    selectedMonth: string;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;

    /** Fetch workday data for a specific date */
    fetchWorkday: (date: string) => Promise<void>;
    /** Submit a workday */
    submitWorkday: (date: string) => Promise<boolean>;
    /** Cancel a workday submission */
    cancelWorkday: (date: string) => Promise<boolean>;
    /** Fetch monthly calendar */
    fetchCalendar: (month: string) => Promise<void>;
    /** Set selected date */
    setSelectedDate: (date: string) => void;
    /** Set selected month */
    setSelectedMonth: (month: string) => void;
    /** Refresh current workday */
    refreshCurrentWorkday: () => Promise<void>;
    /** Clear error */
    clearError: () => void;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * @description Zustand store for workday state management
 * Handles workday data, calendar, and submission state
 */
export const useWorkdayStore = create<WorkdayState>()(
    devtools(
        (set, get) => ({
            currentWorkday: null,
            calendar: null,
            selectedDate: getTodayDate(),
            selectedMonth: getCurrentMonth(),
            isLoading: false,
            error: null,

            fetchWorkday: async (date: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await workdayApi.getWorkday(date);
                    set({
                        currentWorkday: response.data,
                        selectedDate: date,
                        isLoading: false,
                    });
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error
                        || 'אירעה שגיאה בטעינת נתוני יום העבודה';
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                }
            },

            submitWorkday: async (date: string) => {
                set({ isLoading: true, error: null });
                try {
                    await workdayApi.submitWorkday(date);
                    // Refresh workday data after submission
                    await get().fetchWorkday(date);
                    // Refresh calendar if viewing the same month
                    const { selectedMonth } = get();
                    if (date.startsWith(selectedMonth)) {
                        await get().fetchCalendar(selectedMonth);
                    }
                    set({ isLoading: false });
                    return true;
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error
                        || 'אירעה שגיאה בשליחת יום העבודה';
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    return false;
                }
            },

            cancelWorkday: async (date: string) => {
                set({ isLoading: true, error: null });
                try {
                    await workdayApi.cancelWorkday(date);
                    // Refresh workday data after cancellation
                    await get().fetchWorkday(date);
                    // Refresh calendar if viewing the same month
                    const { selectedMonth } = get();
                    if (date.startsWith(selectedMonth)) {
                        await get().fetchCalendar(selectedMonth);
                    }
                    set({ isLoading: false });
                    return true;
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error
                        || 'אירעה שגיאה בביטול שליחת יום העבודה';
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    return false;
                }
            },

            fetchCalendar: async (month: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await workdayApi.getMonthlyCalendar(month);
                    set({
                        calendar: response.data,
                        selectedMonth: month,
                        isLoading: false,
                    });
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error
                        || 'אירעה שגיאה בטעינת לוח השנה';
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                }
            },

            setSelectedDate: (date: string) => {
                set({ selectedDate: date });
            },

            setSelectedMonth: (month: string) => {
                set({ selectedMonth: month });
            },

            refreshCurrentWorkday: async () => {
                const { selectedDate } = get();
                await get().fetchWorkday(selectedDate);
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'workday-store' }
    )
);
