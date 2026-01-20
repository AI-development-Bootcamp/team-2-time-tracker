import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    TimeEntryDto,
    CreateTimeEntryInput
} from '@shared/types';
import { timeReportsApi } from '@client/api-client';
import {
    Button,
    Dialog,
    useToast
} from '@client/ui';
import { TimeEntryForm } from '../components/TimeEntryForm';
import { TimeEntryList, DayData } from '../components/TimeEntryList';
import './TimeEntryHistoryPage.css';

/**
 * Group time entries by work date
 * @description Transforms flat array of entries into day-grouped structure for TimeEntryList
 * @param {TimeEntryDto[]} entries - Flat array of time entries
 * @returns {DayData[]} Entries grouped by date, sorted newest first
 */
function groupEntriesByDate(entries: TimeEntryDto[]): DayData[] {
    const grouped = entries.reduce((acc, entry) => {
        const date = entry.workDate;
        if (!acc[date]) {
            acc[date] = {
                date,
                workday: null, // Workday data not available in history endpoint
                entries: []
            };
        }
        acc[date].entries.push(entry);
        return acc;
    }, {} as Record<string, DayData>);

    return Object.values(grouped).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function TimeEntryHistoryPage() {
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [entries, setEntries] = useState<TimeEntryDto[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        total: 0
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntryDto | null>(null);
    const [deleteCandidate, setDeleteCandidate] = useState<TimeEntryDto | null>(null);

    // Transform entries into day-grouped format
    const daysData = useMemo(() => groupEntriesByDate(entries), [entries]);

    const fetchHistory = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await timeReportsApi.getHistory({
                page,
                pageSize: 20
            });

            if (response.success) {
                setEntries(response.data.entries);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
            error('Error', 'Failed to load time entries');
        } finally {
            setIsLoading(false);
        }
    }, [error]);

    useEffect(() => {
        fetchHistory(1);
    }, [fetchHistory]);

    const handleCreate = () => {
        setEditingEntry(null);
        setIsFormOpen(true);
    };

    const handleEdit = (entry: TimeEntryDto) => {
        setEditingEntry(entry);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        const entry = entries.find(e => e.id === id);
        if (entry) {
            setDeleteCandidate(entry);
        }
    };

    const handleFormSubmit = async (data: CreateTimeEntryInput) => {
        try {
            if (editingEntry) {
                // Update
                await timeReportsApi.update(editingEntry.id, data);
                success('Success', 'Entry updated successfully');
            } else {
                // Create
                await timeReportsApi.create(data);
                success('Success', 'Entry created successfully');
            }
            fetchHistory(pagination.page);
        } catch (err) {
            console.error('Operation failed:', err);
            error('Error', 'Failed to save time entry');
            throw err;
        }
    };

    const confirmDelete = async () => {
        if (!deleteCandidate) return;

        try {
            await timeReportsApi.delete(deleteCandidate.id);
            success('Success', 'Entry deleted successfully');
            fetchHistory(pagination.page);
        } catch (err) {
            console.error('Delete failed:', err);
            error('Error', 'Failed to delete entry');
        } finally {
            setDeleteCandidate(null);
        }
    };

    return (
        <div className="time-entry-history-page">
            <header className="time-entry-history-page__header">
                <h1 className="time-entry-history-page__title">Time Entries History</h1>
                <div className="time-entry-history-page__action">
                    <Button onClick={handleCreate}>New Entry</Button>
                </div>
            </header>

            <main className="time-entry-history-page__content">
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <TimeEntryList
                        daysData={daysData}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}
            </main>

            <div className="time-entry-history-page__pagination">
                <Button
                    variant="secondary"
                    disabled={!pagination.hasPrev}
                    onClick={() => fetchHistory(pagination.page - 1)}
                >
                    Previous
                </Button>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <Button
                    variant="secondary"
                    disabled={!pagination.hasNext}
                    onClick={() => fetchHistory(pagination.page + 1)}
                >
                    Next
                </Button>
            </div>

            <TimeEntryForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingEntry ? {
                    workDate: editingEntry.workDate,
                    startTime: editingEntry.startTime,
                    endTime: editingEntry.endTime,
                    location: editingEntry.location,
                    description: editingEntry.description,
                    taskId: editingEntry.task.id
                } : undefined}
                onSubmit={handleFormSubmit}
            />

            <Dialog
                open={!!deleteCandidate}
                onOpenChange={(open) => !open && setDeleteCandidate(null)}
                title="Confirm Delete"
            >
                <div style={{ padding: '20px 0' }}>
                    Are you sure you want to delete this time entry?
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button variant="secondary" onClick={() => setDeleteCandidate(null)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </div>
            </Dialog>
        </div>
    );
}
