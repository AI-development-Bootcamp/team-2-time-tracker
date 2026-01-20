import React, { useEffect, useState, useCallback } from 'react';
import { useTimeEntryStore } from '@/app/stores/timeEntries.store';
import { useTimerStore } from '@/app/stores/timer.store';
import { TimeEntryDto, CreateTimeEntryInput, GetWorkdayResponseDto, WorkLocation } from '@shared/types';
import { TimeEntryList } from '../components/TimeEntryList';
import { MultiProjectTimeEntryForm } from '../components/MultiProjectTimeEntryForm';
import { FooterActions } from '../components/FooterActions';
import { StopTimerModal } from '../components/StopTimerModal';
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
    const [isStopTimerModalOpen, setIsStopTimerModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntryDto | null>(null);
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
        stopTimer,
        isLoading: timerLoading,
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

    // Handlers
    const handleStopTimer = () => {
        setIsStopTimerModalOpen(true);
    };

    const handleManualReport = () => {
        setEditingEntry(null);
        setIsFormOpen(true);
    };

    const handleEditEntry = (entry: TimeEntryDto) => {
        setEditingEntry(entry);
        setIsFormOpen(true);
    };

    const handleAddEntry = (date: string) => {
        // Open the manual report form
        // TODO: Pre-fill the date in the form
        console.log('Add entry for date:', date);
        setEditingEntry(null);
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
            } else {
                // Create new entry (store automatically adds it)
                await createTimeEntry(data);
            }

            // Refresh the days data to sync with store
            await fetchMultipleDays();

            // Close form and clear editing state
            setEditingEntry(null);
            setIsFormOpen(false);
        } catch (error) {
            console.error('Failed to save time entry:', error);
            // Error is already handled in the store
        }
    };

    const handleStopTimerConfirm = async (data: { taskId: string; location: WorkLocation; description: string }) => {
        try {
            // Stop timer and create time entry (store automatically adds it)
            await stopTimer(data);

            // Refresh the days data to sync with store
            await fetchMultipleDays();

            // Close modal
            setIsStopTimerModalOpen(false);
        } catch (error) {
            // Error is handled in the store
            console.error('Failed to stop timer:', error);
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
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleFormSubmit}
            />

            {/* Stop Timer Modal */}
            <StopTimerModal
                isOpen={isStopTimerModalOpen}
                isLoading={timerLoading}
                onClose={() => setIsStopTimerModalOpen(false)}
                onConfirm={handleStopTimerConfirm}
            />
        </div>
    );
};

