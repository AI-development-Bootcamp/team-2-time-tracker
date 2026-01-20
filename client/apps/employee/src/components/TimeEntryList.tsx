import React, { useState } from 'react';
import { TimeEntryDto, GetWorkdayResponseDto } from '@shared/types';
import './TimeEntryList.css';

export interface DayData {
    date: string;
    workday: GetWorkdayResponseDto | null;
    entries: TimeEntryDto[];
}

interface TimeEntryListProps {
    daysData: DayData[];
    onEdit: (entry: TimeEntryDto) => void;
    onDelete: (id: string) => void;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
    daysData,
    onEdit,
}) => {
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

    const toggleDate = (date: string) => {
        const newExpanded = new Set(expandedDates);
        if (newExpanded.has(date)) {
            newExpanded.delete(date);
        } else {
            newExpanded.add(date);
        }
        setExpandedDates(newExpanded);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        const dayName = dayNames[date.getDay()];
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `יום ${dayName} ${day}/${month}/${year}`;
    };

    const getDayStatus = (dayData: DayData): { badge: string; color: string; icon: string } => {
        const totalMinutes = dayData.entries.reduce((sum, e) => sum + e.durationMinutes, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const hoursText = `${totalHours} ש'`;

        // If no entries at all
        if (totalMinutes === 0) {
            return { badge: 'חסר', color: 'red', icon: '!' };
        }

        const isSubmitted = dayData.workday?.data?.isSubmitted;

        // Check if submitted
        if (isSubmitted) {
            return { badge: hoursText, color: 'green', icon: '✓' };
        }

        // Check hours
        if (totalMinutes >= 480) { // 8+ hours
            return { badge: hoursText, color: 'green', icon: '✓' };
        } else if (totalMinutes >= 240) { // 4+ hours
            return { badge: hoursText, color: 'yellow', icon: '⚠' };
        } else {
            return { badge: hoursText, color: 'yellow', icon: '⚠' };
        }
    };

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `ש' ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    if (daysData.length === 0) {
        return (
            <div className="time-entry-list__empty">
                <p>אין דיווחים להצגה</p>
            </div>
        );
    }

    return (
        <div className="time-entry-list">
            {daysData.map((dayData) => {
                const isExpanded = expandedDates.has(dayData.date);
                const status = getDayStatus(dayData);

                return (
                    <div key={dayData.date} className="time-entry-group">
                        {/* Date Header */}
                        <button
                            className="time-entry-group__header"
                            onClick={() => toggleDate(dayData.date)}
                        >
                            <div className="time-entry-group__header-left">
                                <span className="time-entry-group__chevron">
                                    {isExpanded ? '▼' : '◀'}
                                </span>
                                {status.badge && (
                                    <span className={`time-entry-group__badge time-entry-group__badge--${status.color}`}>
                                        {status.badge}
                                    </span>
                                )}
                                {!status.badge && (
                                    <span className={`time-entry-group__icon time-entry-group__icon--${status.color}`}>
                                        {status.icon}
                                    </span>
                                )}
                            </div>
                            <span className="time-entry-group__date">{formatDate(dayData.date)}</span>
                        </button>

                        {/* Entries */}
                        {isExpanded && dayData.entries.length > 0 && (
                            <div className="time-entry-group__entries">
                                {dayData.entries.map((entry) => (
                                    <div key={entry.id} className="time-entry-item">
                                        <div className="time-entry-item__main">
                                            <div className="time-entry-item__left">
                                                <button
                                                    className="time-entry-item__edit"
                                                    onClick={() => onEdit(entry)}
                                                    aria-label="ערוך"
                                                >
                                                    עריכה
                                                </button>
                                                <div className="time-entry-item__time-range">
                                                    {entry.startTime}-{entry.endTime}
                                                </div>
                                            </div>
                                            <div className="time-entry-item__right">
                                                <div className="time-entry-item__task-name">
                                                    {entry.task.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="time-entry-item__details">
                                            <div className="time-entry-item__location">
                                                {entry.location}
                                            </div>
                                            <div className="time-entry-item__duration">
                                                {formatDuration(entry.durationMinutes)}
                                            </div>
                                        </div>
                                        {entry.description && (
                                            <div className="time-entry-item__description">
                                                {entry.description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty state for expanded day with no entries */}
                        {isExpanded && dayData.entries.length === 0 && (
                            <div className="time-entry-group__empty">
                                אין דיווחים ליום זה
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
