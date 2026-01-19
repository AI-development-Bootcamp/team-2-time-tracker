import React, { useEffect, useState } from 'react';
import { useWorkdayStore } from '@/app/stores/workday.store';
import { useTimeEntryStore } from '@/app/stores/timeEntries.store';
import { TimeEntryDto, CreateTimeEntryInput } from '@shared/types';
import { Button } from '@client/ui';
import { WorkdayProgress } from '../components/WorkdayProgress';
import { DailySummaryCard } from '../components/DailySummaryCard';
import { TimerCard } from '../components/TimerCard';
import { TimeEntryList } from '../components/TimeEntryList';
import { TimeEntryForm } from '../components/TimeEntryForm';
import './DailyReportPage.css';

/**
 * DailyReportPage Component
 * Main dashboard for daily time tracking and reporting
 */
export const DailyReportPage: React.FC = () => {
    // State
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Partial<CreateTimeEntryInput> | undefined>(undefined);

    // Stores
    const {
        currentWorkday,
        fetchWorkday,
    } = useWorkdayStore();

    const {
        createTimeEntry,
        updateTimeEntry,
        deleteTimeEntry
    } = useTimeEntryStore();

    // Fetch data on date change
    useEffect(() => {
        fetchWorkday(currentDate);
    }, [currentDate, fetchWorkday]);

    // Derived state
    const entries = currentWorkday?.timeEntries || [];
    const summary = currentWorkday?.summary;
    const isToday = currentDate === new Date().toISOString().split('T')[0];

    // Handlers
    const handlePrevDay = () => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - 1);
        setCurrentDate(date.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + 1);
        setCurrentDate(date.toISOString().split('T')[0]);
    };

    const handleToday = () => {
        setCurrentDate(new Date().toISOString().split('T')[0]);
    };

    const handleCreateEntry = () => {
        setEditingEntry(undefined);
        setIsFormOpen(true);
    };

    const handleEditEntry = (entry: TimeEntryDto) => {
        setEditingEntry({
            ...entry,
            taskId: entry.task.id,
            workDate: entry.workDate, // Keep original date
        });
        setIsFormOpen(true);
    };

    const handleDeleteEntry = async (entry: TimeEntryDto) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            await deleteTimeEntry(entry.id);
            // Refresh logic handled by store usually, or we refetch
            fetchWorkday(currentDate);
        }
    };

    const handleFormSubmit = async (data: CreateTimeEntryInput) => {
        if ((editingEntry as any)?.id) {
            await updateTimeEntry((editingEntry as any).id, data);
        } else {
            await createTimeEntry({ ...data, workDate: currentDate });
        }
        fetchWorkday(currentDate); // Refresh data
    };

    return (
        <div className="daily-report-page">
            {/* Header / Date Nav */}
            <div className="daily-report-page__header">
                <div className="daily-report-page__date-nav">
                    <button className="daily-report-page__nav-btn" onClick={handleNextDay} disabled={isToday}>
                        &lt;
                    </button>
                    <span onClick={handleToday} style={{ cursor: 'pointer' }}>
                        {new Date(currentDate).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    <button className="daily-report-page__nav-btn" onClick={handlePrevDay}>
                        &gt;
                    </button>
                    {!isToday && (
                        <Button size="sm" variant="ghost" onClick={handleToday}>
                            חזור להיום
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <WorkdayProgress />

            {/* Summary & Timer Grid */}
            <div className="daily-report-page__summary-grid">
                <TimerCard />
                {summary && (
                    <DailySummaryCard
                        date={currentDate}
                        summary={summary}
                        status={currentWorkday?.status || 'MISSING'}
                        isLocked={currentWorkday?.isLocked || false}
                        isSubmitted={currentWorkday?.isSubmitted || false}
                    />
                )}
            </div>

            {/* Entries List */}
            <div className="daily-report-page__entries-section">
                <div className="daily-report-page__section-header">
                    <h2 className="daily-report-page__section-title">דיווחים ({entries.length})</h2>
                    <Button onClick={handleCreateEntry}>
                        + דיווח ידני
                    </Button>
                </div>

                <TimeEntryList
                    entries={entries}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                />
            </div>

            {/* Entry Form Modal */}
            <TimeEntryForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingEntry}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
};
