import { useEffect, useCallback } from 'react';
import { useWorkdayStore } from '../app/stores/workday.store';
import { CalendarDayDto, WorkdayStatus } from '@shared/types';
import './MonthlyCalendar.css';

/** Hebrew day names (Sunday to Saturday) */
const HEBREW_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

/** Hebrew month names */
const HEBREW_MONTHS: Record<number, string> = {
    1: 'ינואר',
    2: 'פברואר',
    3: 'מרץ',
    4: 'אפריל',
    5: 'מאי',
    6: 'יוני',
    7: 'יולי',
    8: 'אוגוסט',
    9: 'ספטמבר',
    10: 'אוקטובר',
    11: 'נובמבר',
    12: 'דצמבר',
};

/**
 * @description Format minutes to hours display
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted hours string
 */
function formatMinutesToHours(minutes: number): string {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? '-' : '';
    return `${sign}${hours}:${mins.toString().padStart(2, '0')}`;
}

/**
 * @description Parse month string to get month and year
 * @param {string} monthStr - Month in YYYY-MM format
 * @returns {{ year: number; month: number }} Year and month (1-indexed)
 */
function parseMonth(monthStr: string): { year: number; month: number } {
    const [yearStr, monthNumStr] = monthStr.split('-');
    return {
        year: parseInt(yearStr, 10),
        month: parseInt(monthNumStr, 10),
    };
}

/**
 * @description Format month for display
 * @param {string} monthStr - Month in YYYY-MM format
 * @returns {string} Hebrew formatted month
 */
function formatMonth(monthStr: string): string {
    const { year, month } = parseMonth(monthStr);
    return `${HEBREW_MONTHS[month]} ${year}`;
}

/**
 * @description Navigate to previous/next month
 * @param {string} monthStr - Current month in YYYY-MM format
 * @param {number} delta - -1 for previous, +1 for next
 * @returns {string} New month in YYYY-MM format
 */
function navigateMonth(monthStr: string, delta: number): string {
    const { year, month } = parseMonth(monthStr);
    const date = new Date(year, month - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * @description Get CSS class for day status
 * @param {WorkdayStatus} status - Day status
 * @returns {string} CSS modifier class
 */
function getDayStatusClass(status: WorkdayStatus): string {
    switch (status) {
        case 'FULL':
            return 'monthly-calendar__day--full';
        case 'MISSING':
            return 'monthly-calendar__day--missing';
        case 'EXCEPTION':
            return 'monthly-calendar__day--exception';
        case 'WEEKEND':
            return 'monthly-calendar__day--weekend';
        default:
            return '';
    }
}

/**
 * @description Calculate padding days to align calendar grid with correct weekday
 * @param {CalendarDayDto[]} days - Array of calendar days
 * @returns {number} Number of empty cells before first day
 */
function getPaddingDays(days: CalendarDayDto[]): number {
    if (days.length === 0) return 0;
    const firstDate = new Date(days[0].date);
    return firstDate.getDay(); // 0 = Sunday
}

interface MonthlyCalendarProps {
    /** Optional callback when a day is clicked */
    onDayClick?: (date: string) => void;
}

/**
 * @description MonthlyCalendar displays a full month view with status indicators
 * Shows all days with color-coded status, navigation between months, and monthly summary
 */
export function MonthlyCalendar({ onDayClick }: MonthlyCalendarProps) {
    const {
        calendar,
        selectedMonth,
        selectedDate,
        isLoading,
        error,
        fetchCalendar,
        setSelectedMonth,
        setSelectedDate,
        clearError,
    } = useWorkdayStore();

    // Fetch calendar on mount and month change
    useEffect(() => {
        fetchCalendar(selectedMonth);
    }, [selectedMonth, fetchCalendar]);

    const handlePrevMonth = useCallback(() => {
        const newMonth = navigateMonth(selectedMonth, -1);
        setSelectedMonth(newMonth);
    }, [selectedMonth, setSelectedMonth]);

    const handleNextMonth = useCallback(() => {
        const newMonth = navigateMonth(selectedMonth, 1);
        setSelectedMonth(newMonth);
    }, [selectedMonth, setSelectedMonth]);

    const handleDayClick = (day: CalendarDayDto) => {
        if (day.status === 'WEEKEND') return;
        setSelectedDate(day.date);
        onDayClick?.(day.date);
    };

    const paddingDays = calendar?.days ? getPaddingDays(calendar.days) : 0;
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="monthly-calendar">
            {/* Header with navigation */}
            <div className="monthly-calendar__header">
                <button
                    className="monthly-calendar__nav-button"
                    onClick={handleNextMonth}
                    disabled={isLoading}
                    aria-label="חודש הבא"
                >
                    ←
                </button>
                <h3 className="monthly-calendar__title">{formatMonth(selectedMonth)}</h3>
                <button
                    className="monthly-calendar__nav-button"
                    onClick={handlePrevMonth}
                    disabled={isLoading}
                    aria-label="חודש קודם"
                >
                    →
                </button>
            </div>

            {/* Error display */}
            {error && (
                <div className="monthly-calendar__error" onClick={clearError}>
                    {error}
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="monthly-calendar__loading">טוען לוח שנה...</div>
            )}

            {/* Calendar grid */}
            {!isLoading && calendar && (
                <>
                    <div className="monthly-calendar__weekdays">
                        {HEBREW_DAYS.map((day) => (
                            <div key={day} className="monthly-calendar__weekday">{day}</div>
                        ))}
                    </div>

                    <div className="monthly-calendar__grid">
                        {/* Empty cells for padding */}
                        {Array.from({ length: paddingDays }).map((_, i) => (
                            <div key={`pad-${i}`} className="monthly-calendar__day monthly-calendar__day--empty" />
                        ))}

                        {/* Calendar days */}
                        {calendar.days.map((day) => {
                            const dayNumber = new Date(day.date).getDate();
                            const isToday = day.date === today;
                            const isSelected = day.date === selectedDate;

                            return (
                                <button
                                    key={day.date}
                                    className={`
                                        monthly-calendar__day
                                        ${getDayStatusClass(day.status)}
                                        ${isToday ? 'monthly-calendar__day--today' : ''}
                                        ${isSelected ? 'monthly-calendar__day--selected' : ''}
                                        ${day.isLocked ? 'monthly-calendar__day--locked' : ''}
                                        ${day.isSubmitted ? 'monthly-calendar__day--submitted' : ''}
                                    `}
                                    onClick={() => handleDayClick(day)}
                                    disabled={day.status === 'WEEKEND'}
                                    aria-label={`${dayNumber}, ${day.status}`}
                                >
                                    <span className="monthly-calendar__day-number">{dayNumber}</span>
                                    {day.minutes > 0 && day.status !== 'WEEKEND' && (
                                        <span className="monthly-calendar__day-minutes">
                                            {Math.floor(day.minutes / 60)}h
                                        </span>
                                    )}
                                    {day.isSubmitted && (
                                        <span className="monthly-calendar__day-check">✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Monthly summary */}
                    <div className="monthly-calendar__summary">
                        <div className="monthly-calendar__summary-item">
                            <span className="monthly-calendar__summary-label">יעד</span>
                            <span className="monthly-calendar__summary-value">
                                {formatMinutesToHours(calendar.summary.totalTargetMinutes)}
                            </span>
                        </div>
                        <div className="monthly-calendar__summary-item">
                            <span className="monthly-calendar__summary-label">בפועל</span>
                            <span className="monthly-calendar__summary-value">
                                {formatMinutesToHours(calendar.summary.totalWorkMinutes)}
                            </span>
                        </div>
                        <div className={`monthly-calendar__summary-item ${calendar.summary.balanceMinutes >= 0
                                ? 'monthly-calendar__summary-item--positive'
                                : 'monthly-calendar__summary-item--negative'
                            }`}>
                            <span className="monthly-calendar__summary-label">מאזן</span>
                            <span className="monthly-calendar__summary-value">
                                {calendar.summary.balanceMinutes >= 0 ? '+' : ''}
                                {formatMinutesToHours(calendar.summary.balanceMinutes)}
                            </span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="monthly-calendar__legend">
                        <div className="monthly-calendar__legend-item">
                            <span className="monthly-calendar__legend-dot monthly-calendar__legend-dot--full" />
                            <span>מלא</span>
                        </div>
                        <div className="monthly-calendar__legend-item">
                            <span className="monthly-calendar__legend-dot monthly-calendar__legend-dot--missing" />
                            <span>חסר</span>
                        </div>
                        <div className="monthly-calendar__legend-item">
                            <span className="monthly-calendar__legend-dot monthly-calendar__legend-dot--exception" />
                            <span>חריגה</span>
                        </div>
                        <div className="monthly-calendar__legend-item">
                            <span className="monthly-calendar__legend-dot monthly-calendar__legend-dot--weekend" />
                            <span>סופ״ש</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
