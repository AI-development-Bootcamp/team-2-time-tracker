import React, { useEffect, useState, useCallback } from 'react';
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
 */
export const DailyReportPage: React.FC = () => {
    // State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntryDto | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [timerTimes, setTimerTimes] = useState<{ start: string; end: string } | null>(null);
    const [daysData, setDaysData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);

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
        const today = new Date();

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            try {
                const workday = await workdayApi.getWorkday(dateStr);
                const entries = workday.data?.timeEntries || [];
                days.push({
                    date: dateStr,
                    workday,
                    entries
                });
                // Collect all entries for the store
                allEntries.push(...entries);
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
    }, [setEntries]);

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
        console.log('Add entry for date:', date);
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
            />
        </div>
    );
};

