import { WorkdaySummaryDto, WorkdayStatus } from '@shared/types';
import './DailySummaryCard.css';

interface DailySummaryCardProps {
    /** Date in YYYY-MM-DD format */
    date: string;
    /** Workday summary data */
    summary: WorkdaySummaryDto;
    /** Current workday status */
    status: WorkdayStatus;
    /** Whether the day is locked */
    isLocked: boolean;
    /** Whether the day is submitted */
    isSubmitted: boolean;
}

/**
 * @description Format minutes to hours:minutes display
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time string
 */
function formatMinutes(minutes: number): string {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? '-' : '';
    return `${sign}${hours}:${mins.toString().padStart(2, '0')}`;
}

/**
 * @description Format date for Hebrew display
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Formatted Hebrew date
 */
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}

/**
 * @description Get status icon based on workday status
 * @param {WorkdayStatus} status - Workday status
 * @returns {string} Status icon
 */
function getStatusIcon(status: WorkdayStatus): string {
    switch (status) {
        case 'FULL':
            return '✓';
        case 'EXCEPTION':
            return '⚠';
        case 'MISSING':
        default:
            return '○';
    }
}

/**
 * @description DailySummaryCard displays a compact summary of a single workday
 * Shows date, status, time breakdown, and lock/submission status
 */
export function DailySummaryCard({
    date,
    summary,
    status,
    isLocked,
    isSubmitted,
}: DailySummaryCardProps) {
    const balanceClass = summary.balanceMinutes >= 0 ? 'positive' : 'negative';

    return (
        <div className={`daily-summary-card daily-summary-card--${status.toLowerCase()}`}>
            <div className="daily-summary-card__header">
                <div className="daily-summary-card__date">
                    <span className={`daily-summary-card__status-icon daily-summary-card__status-icon--${status.toLowerCase()}`}>
                        {getStatusIcon(status)}
                    </span>
                    <span className="daily-summary-card__date-text">{formatDate(date)}</span>
                </div>
                <div className="daily-summary-card__badges">
                    {isLocked && (
                        <span className="daily-summary-card__badge daily-summary-card__badge--locked">
                            🔒 נעול
                        </span>
                    )}
                    {isSubmitted && (
                        <span className="daily-summary-card__badge daily-summary-card__badge--submitted">
                            ✓ נשלח
                        </span>
                    )}
                </div>
            </div>

            <div className="daily-summary-card__breakdown">
                <div className="daily-summary-card__row">
                    <span className="daily-summary-card__label">שעות עבודה</span>
                    <span className="daily-summary-card__value">{formatMinutes(summary.workMinutes)}</span>
                </div>
                <div className="daily-summary-card__row">
                    <span className="daily-summary-card__label">היעדרות</span>
                    <span className="daily-summary-card__value">{formatMinutes(summary.absenceMinutes)}</span>
                </div>
                <div className="daily-summary-card__row daily-summary-card__row--total">
                    <span className="daily-summary-card__label">סה״כ</span>
                    <span className="daily-summary-card__value">
                        {formatMinutes(summary.totalMinutes)} / {formatMinutes(summary.targetMinutes)}
                    </span>
                </div>
                <div className={`daily-summary-card__row daily-summary-card__row--balance daily-summary-card__row--${balanceClass}`}>
                    <span className="daily-summary-card__label">מאזן</span>
                    <span className="daily-summary-card__value">
                        {summary.balanceMinutes >= 0 ? '+' : ''}{formatMinutes(summary.balanceMinutes)}
                    </span>
                </div>
            </div>

            {isSubmitted && summary.submittedAt && (
                <div className="daily-summary-card__footer">
                    נשלח ב-{new Date(summary.submittedAt).toLocaleString('he-IL', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                    })}
                </div>
            )}
        </div>
    );
}
