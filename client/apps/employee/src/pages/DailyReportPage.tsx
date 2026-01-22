import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTimeEntryStore } from '@/app/stores/timeEntries.store';
import { useTimerStore } from '@/app/stores/timer.store';
import { TimeEntryDto, CreateTimeEntryInput, GetWorkdayResponseDto, WorkLocation } from '@shared/types';
import { TimeEntryList } from '../components/TimeEntryList';
import { MultiProjectTimeEntryForm } from '../components/MultiProjectTimeEntryForm';
import { FooterActions } from '../components/FooterActions';
import { workdayApi } from '@client/api-client';
import './DailyReportPage.css';

export interface DayData {
    date: string;
    workday: GetWorkdayResponseDto | null;
    entries: TimeEntryDto[];
}

/**
 * DailyReportPage Component
 * Main dashboard for daily time tracking and reporting
 * react.fc is like saying it expects a function component
 */
export const DailyReportPage: React.FC = () => {
    // State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntryDto | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [timerTimes, setTimerTimes] = useState<{ start: string; end: string } | null>(null);
    const [daysData, setDaysData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Hebrew month names
    const hebrewMonths = useMemo(() => [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ], []);

    const currentMonthName = useMemo(() => {
        return hebrewMonths[currentMonth.getMonth()];
    }, [currentMonth, hebrewMonths]);

    const handlePrevMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

    // Stores
    const {
        createTimeEntry,
        deleteTimeEntry,
        updateTimeEntry,
        setEntries
    } = useTimeEntryStore();

    const {
        timer,
        stopTimer,
        error: timerError,
        clearError
    } = useTimerStore();

    // Fetch last 14 days of data
    const fetchMultipleDays = useCallback(async () => {
        setLoading(true);
        const days: DayData[] = [];
        const allEntries: TimeEntryDto[] = [];

        // Get the last day of the selected month
        const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        for (let i = 0; i < 14; i++) {
            const date = new Date(lastDayOfMonth);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            //maybe create an api call that returns all workdays for a range of dates?
            //ask oz tmrw
            try {
                const workday = await workdayApi.getWorkday(dateStr);
                const entries = workday.data?.timeEntries || [];

                // Map absences to virtual time entries
                const absences = workday.data?.absences || [];
                const absenceEntries: TimeEntryDto[] = absences.map((absence: any) => {
                    const absenceTypeMap: Record<string, string> = {
                        'VACATION': 'חופשה',
                        'SICK': 'מחלה',
                        'RESERVES': 'מילואים',
                        'OTHER': 'היעדרות אחרת'
                    };

                    const minutes = absence.minutes;
                    const hours = Math.floor(minutes / 60);
                    const mins = minutes % 60;

                    // Construct end time based on 09:00 start
                    const endHour = 9 + hours;
                    const endMinStr = mins.toString().padStart(2, '0');
                    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinStr}`;

                    return {
                        id: `absence-${absence.id}-${dateStr}`,
                        workDate: dateStr, // Use the actual date of the report
                        startTime: '09:00',
                        endTime: endTime,
                        durationMinutes: absence.minutes,
                        location: WorkLocation.OFFICE, // Default
                        description: 'מערכת: דיווח היעדרות',
                        source: 'MANUAL' as any,
                        task: {
                            id: `absence-task-${absence.id}`,
                            name: absenceTypeMap[absence.type] || 'היעדרות',
                            project: {
                                id: 'absence-project',
                                name: 'היעדרות'
                            },
                            client: {
                                id: 'absence-client',
                                name: 'כללי'
                            }
                        }
                    };
                });

                days.push({
                    date: dateStr,
                    workday,
                    entries: [...entries, ...absenceEntries]
                });
                // Collect all entries for the store
                allEntries.push(...entries, ...absenceEntries);
            } catch (error) {
                // If workday doesn't exist, create empty day
                days.push({
                    date: dateStr,
                    workday: null,
                    entries: []
                });
            }
        }

        // Update both local state and Zustand store
        setDaysData(days);
        setEntries(allEntries);
        setLoading(false);
    }, [currentMonth, setEntries]);

    useEffect(() => {
        fetchMultipleDays();
    }, [fetchMultipleDays]);

    // Display timer errors
    useEffect(() => {
        if (timerError) {
            alert(timerError);
            clearError();
        }
    }, [timerError, clearError]);

    //format time to hh:mm look
    const formatTime = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Handlers
    const handleStopTimer = () => {
        if (timer && timer.startedAt) {
            const startTime = formatTime(new Date(timer.startedAt));
            const endTime = formatTime(new Date());

            setTimerTimes({ start: startTime, end: endTime });
            setSelectedDate(timer.workDate);
            setEditingEntry(null);
            setIsFormOpen(true);
        }
    };

    const handleManualReport = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setEditingEntry(null);
        setTimerTimes(null);
        setIsFormOpen(true);
    };

    const handleEditEntry = (entry: TimeEntryDto) => {
        setEditingEntry(entry);
        setTimerTimes(null);
        setIsFormOpen(true);
    };

    const handleAddEntry = (date: string) => {
        // Open the manual report form with pre-filled date
        setSelectedDate(date);
        setEditingEntry(null);
        setTimerTimes(null);
        setIsFormOpen(true);
    };

    const handleDeleteEntry = async (id: string) => {
        if (confirm('האם אתה בטוח שברצונך למחוק דיווח זה?')) {
            try {
                // Delete from server (store automatically removes it)
                await deleteTimeEntry(id);

                // Refresh the days data to sync with store
                await fetchMultipleDays();
            } catch (error) {
                console.error('Failed to delete entry:', error);
                // If deletion fails, refresh to restore correct state
                await fetchMultipleDays();
            }
        }
    };

    const handleFormSubmit = async (data: CreateTimeEntryInput) => {
        try {
            if (editingEntry) {
                // Update existing entry (store automatically updates)
                await updateTimeEntry(editingEntry.id, data);
            } else if (timerTimes) {
                // Stop timer flow - use timerApi.stop which allows creation while timer is running
                await stopTimer({
                    taskId: data.taskId,
                    location: data.location as WorkLocation,
                    description: data.description
                });

                // Clear timerTimes so subsequent loops (if multi-project) use standard create
                setTimerTimes(null);
            } else {
                // Create new entry (store automatically adds it)
                await createTimeEntry(data);
            }

            // Refresh the days data to sync with store
            await fetchMultipleDays();
        } catch (error) {
            console.error('Failed to save time entry:', error);
            throw error; // Re-throw to let form handle the error
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsFormOpen(open);
        if (!open) {
            setEditingEntry(null);
            setTimerTimes(null);
        }
    };

    if (loading) {
        return (
            <div className="daily-report-page">
                <div className="daily-report-page__loading">טוען...</div>
            </div>
        );
    }

    return (
        <div className="daily-report-page">
            {/* Header with month navigation */}
            <header className="daily-report-page__header">
                <h1 className="daily-report-page__title">דיווח שעות</h1>
                <div className="daily-report-page__month-nav">
                    <button
                        className="daily-report-page__nav-btn"
                        onClick={handlePrevMonth}
                        aria-label="חודש קודם"
                    >
                        <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                            <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <span className="daily-report-page__month-name">{currentMonthName}</span>
                    <button
                        className="daily-report-page__nav-btn"
                        onClick={handleNextMonth}
                        aria-label="חודש הבא"
                    >
                        <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                            <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Scrollable Content Area */}
            <div className="daily-report-page__content">
                <TimeEntryList
                    daysData={daysData}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                    onAddEntry={handleAddEntry}
                />
            </div>

            {/* Fixed Footer */}
            <FooterActions
                onStopTimer={handleStopTimer}
                onManualReport={handleManualReport}
            />

            {/* Entry Form Modal */}
            <MultiProjectTimeEntryForm
                initialData={editingEntry}
                defaultDate={selectedDate}
                initialStartTime={timerTimes?.start}
                initialEndTime={timerTimes?.end}
                isTimeLocked={!!timerTimes}
                open={isFormOpen}
                onOpenChange={handleOpenChange}
                onSubmit={handleFormSubmit}
                onAbsenceSubmitSuccess={fetchMultipleDays}
            />
        </div>
    );
};

