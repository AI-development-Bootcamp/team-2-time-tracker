/**
 * @fileoverview TimeEntryList Component
 * 
 * Renders the list of time entries grouped by day.
 * Features:
 * - Expandable/Collapsible day groups.
 * - Visual status badges (Total Hours, Missing, Submitted).
 * - Edit entry actions.
 * - Add entry action for empty days.
 */

import React, { useState } from 'react';
import { TimeEntryDto, GetWorkdayResponseDto } from '@shared/types';
import './TimeEntryList.css';

// Import icons
import workdayIcon from '../assets/icons/workday.png';
import dayoffIcon from '../assets/icons/dayoff.png';
import halfWorkdayIcon from '../assets/icons/half_workday.png';
import editIcon from '../assets/icons/edit-2.png';
import arrowIcon from '../assets/icons/arrow_forward_ios.png';

/**
 * Data structure representing a single day's entries and status.
 */
export interface DayData {
    date: string;
    workday: GetWorkdayResponseDto | null;
    entries: TimeEntryDto[];
}

interface TimeEntryListProps {
    daysData: DayData[];
    onEdit: (entry: TimeEntryDto) => void;
    onDelete: (id: string) => void;
    onAddEntry?: (date: string) => void;
}

/**
 * TimeEntryList Component
 * 
 * Displays a historical list of work entries.
 */
export const TimeEntryList: React.FC<TimeEntryListProps> = ({
    daysData,
    onEdit,
    onAddEntry,
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
        const dayNames = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
        const dayName = dayNames[date.getDay()];
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}, יום ${dayName}`;
    };

    // Check if day is weekend (Friday or Saturday)
    const isWeekend = (dateStr: string): boolean => {
        const date = new Date(dateStr);
        const day = date.getDay();
        return day === 5 || day === 6; // Friday or Saturday
    };

    // Check if day has absence
    const getAbsenceType = (dayData: DayData): string | null => {
        const absenceEntry = dayData.entries.find(e =>
            e.task?.project?.name === 'היעדרות' ||
            e.id.startsWith('absence-')
        );
        if (absenceEntry) {
            return absenceEntry.task?.name || null;
        }
        return null;
    };

    // Check if it's a half day vacation
    const isHalfDayVacation = (dayData: DayData): boolean => {
        const absenceEntry = dayData.entries.find(e =>
            e.task?.project?.name === 'היעדרות' ||
            e.id.startsWith('absence-')
        );
        if (absenceEntry) {
            const taskName = absenceEntry.task?.name?.toLowerCase() || '';
            return taskName.includes('חצי יום') || taskName.includes('חצי-יום');
        }
        return false;
    };

    const getDayStatus = (dayData: DayData): { badge: string; color: string; icon: 'check' | 'warning' | 'x' | 'none'; isDayOff: boolean; isHalfDay: boolean } => {
        const totalMinutes = dayData.entries.reduce((sum, e) => sum + e.durationMinutes, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const hoursText = `${totalHours} ש'`;

        // Check for weekend
        if (isWeekend(dayData.date)) {
            return { badge: "סופ\"ש", color: 'gray', icon: 'none', isDayOff: true, isHalfDay: false };
        }

        // Check for absence
        const absenceType = getAbsenceType(dayData);
        if (absenceType) {
            const isHalfDay = isHalfDayVacation(dayData);
            return { badge: absenceType, color: isHalfDay ? 'pink' : 'blue', icon: 'none', isDayOff: true, isHalfDay };
        }

        // If no entries at all
        if (totalMinutes === 0) {
            return { badge: 'חסר', color: 'red', icon: 'x', isDayOff: false, isHalfDay: false };
        }

        const isSubmitted = dayData.workday?.data?.isSubmitted;

        // Check if submitted or 8+ hours
        if (isSubmitted || totalMinutes >= 480) {
            return { badge: hoursText, color: 'green', icon: 'check', isDayOff: false, isHalfDay: false };
        }

        // Less than 8 hours
        return { badge: hoursText, color: 'yellow', icon: 'warning', isDayOff: false, isHalfDay: false };
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

    // Render status icon
    const renderStatusIcon = (icon: 'check' | 'warning' | 'x' | 'none', color: string) => {
        if (icon === 'none') return null;

        if (icon === 'check') {
            return (
                <span className={`time-entry-group__status-icon time-entry-group__status-icon--${color}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            );
        }

        if (icon === 'warning') {
            return (
                <span className={`time-entry-group__status-icon time-entry-group__status-icon--${color}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </span>
            );
        }

        if (icon === 'x') {
            return (
                <span className={`time-entry-group__status-icon time-entry-group__status-icon--${color}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="currentColor" />
                        <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </span>
            );
        }

        return null;
    };

    return (
        <div className="time-entry-list">
            {daysData.map((dayData) => {
                const isExpanded = expandedDates.has(dayData.date);
                const status = getDayStatus(dayData);
                const weekend = isWeekend(dayData.date);

                return (
                    <div key={dayData.date} className={`time-entry-group ${weekend ? 'time-entry-group--weekend' : ''}`}>
                        {/* Date Header */}
                        <button
                            className="time-entry-group__header"
                            onClick={() => toggleDate(dayData.date)}
                        >
                            {/* Right side in RTL - Calendar icon and Date */}
                            <div className="time-entry-group__header-right">
                                {/* Calendar Icon - halfWorkday for half-day absence, dayoff for full-day absence, workday for regular days */}
                                <span className="time-entry-group__calendar-icon">
                                    <img
                                        src={status.isHalfDay ? halfWorkdayIcon : (status.isDayOff ? dayoffIcon : workdayIcon)}
                                        alt=""
                                        width="20"
                                        height="20"
                                    />
                                </span>
                                <span className="time-entry-group__date">{formatDate(dayData.date)}</span>
                            </div>
                            {/* Left side in RTL - Badge and chevron */}
                            <div className="time-entry-group__header-left">
                                <span className={`time-entry-group__badge time-entry-group__badge--${status.color}`}>
                                    {status.badge}
                                    {renderStatusIcon(status.icon, status.color)}
                                </span>
                                <span className={`time-entry-group__chevron ${isExpanded ? 'time-entry-group__chevron--expanded' : ''}`}>
                                    <img src={arrowIcon} alt="" width="16" height="16" />
                                </span>
                            </div>
                        </button>

                        {/* Entries */}
                        {isExpanded && dayData.entries.length > 0 && (
                            <div className="time-entry-group__entries">
                                {dayData.entries.map((entry) => (
                                    <div key={entry.id} className="time-entry-item">
                                        <div className="time-entry-item__row">
                                            <button
                                                className="time-entry-item__edit"
                                                onClick={() => onEdit(entry)}
                                                aria-label="ערוך"
                                            >
                                                <img src={editIcon} alt="" width="16" height="16" />
                                                עריכה
                                            </button>
                                            <div className="time-entry-item__time-range">
                                                {entry.startTime}-{entry.endTime}
                                            </div>
                                        </div>
                                        <div className="time-entry-item__row">
                                            <div className="time-entry-item__duration">
                                                {formatDuration(entry.durationMinutes)}
                                            </div>
                                            <div className="time-entry-item__task-name">
                                                {entry.task?.project?.name || entry.task.name}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Add report link inside expanded section */}
                                {onAddEntry && (
                                    <button
                                        className="time-entry-group__add-link"
                                        onClick={() => onAddEntry(dayData.date)}
                                    >
                                        הוספת דיווח
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Empty state for expanded day with no entries */}
                        {isExpanded && dayData.entries.length === 0 && (
                            <div className="time-entry-group__empty">
                                <p className="time-entry-group__empty-text">אין דיווחים ליום זה</p>
                                {onAddEntry && (
                                    <button
                                        className="time-entry-group__add-link"
                                        onClick={() => onAddEntry(dayData.date)}
                                    >
                                        הוספת דיווח
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
