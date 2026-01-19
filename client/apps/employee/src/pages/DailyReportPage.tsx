import React, { useEffect, useState } from 'react';
import { useTimeEntryStore } from '@/app/stores/timeEntries.store';
import { TimeEntryDto, CreateTimeEntryInput, GetWorkdayResponseDto } from '@shared/types';
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
    const [daysData, setDaysData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);

    // Stores
    const {
        createTimeEntry,
        deleteTimeEntry
    } = useTimeEntryStore();

    // Fetch last 14 days of data
    useEffect(() => {
        const fetchMultipleDays = async () => {
            setLoading(true);
            const days: DayData[] = [];
            const today = new Date();

            for (let i = 0; i < 14; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                try {
                    const workday = await workdayApi.getWorkday(dateStr);
                    days.push({
                        date: dateStr,
                        workday,
                        entries: workday.data?.timeEntries || []
                    });
                } catch (error) {
                    // If workday doesn't exist, create empty day
                    days.push({
                        date: dateStr,
                        workday: null,
                        entries: []
                    });
                }
            }

            setDaysData(days);
            setLoading(false);
        };

        fetchMultipleDays();
    }, []);

    // Handlers
    const handleStartTimer = () => {
        // TODO: Open timer selection modal or start timer directly
        console.log('Start timer clicked');
    };

    const handleManualReport = () => {
        setIsFormOpen(true);
    };

    const handleEditEntry = (entry: TimeEntryDto) => {
        // TODO: Implement edit functionality
        console.log('Edit entry:', entry);
    };

    const handleDeleteEntry = async (id: string) => {
        if (confirm('האם אתה בטוח שברצונך למחוק דיווח זה?')) {
            await deleteTimeEntry(id);
            // Refresh data
            window.location.reload(); // Temporary solution
        }
    };

    const handleFormSubmit = async (data: CreateTimeEntryInput) => {
        await createTimeEntry(data);
        // Refresh data
        window.location.reload(); // Temporary solution
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
                />
            </div>

            {/* Fixed Footer */}
            <FooterActions
                onStartTimer={handleStartTimer}
                onManualReport={handleManualReport}
            />

            {/* Entry Form Modal */}
            <MultiProjectTimeEntryForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
};
