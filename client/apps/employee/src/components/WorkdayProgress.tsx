import { useWorkdayStore } from '../app/stores/workday.store';
import './WorkdayProgress.css';

/** Target minutes for a standard workday */
const TARGET_MINUTES = 540;

/**
 * @description Format minutes as hours and minutes display (e.g., "8:30")
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time string
 */
function formatMinutesToTime(minutes: number): string {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? '-' : '';
    return `${sign}${hours}:${mins.toString().padStart(2, '0')}`;
}

/**
 * @description Get status color class based on completion status
 * @param {string} status - Workday status (FULL/MISSING/EXCEPTION)
 * @returns {string} CSS modifier class
 */
function getStatusColorClass(status: string): string {
    switch (status) {
        case 'FULL':
            return 'workday-progress--full';
        case 'EXCEPTION':
            return 'workday-progress--exception';
        case 'MISSING':
        default:
            return 'workday-progress--missing';
    }
}

/**
 * @description Get status label in Hebrew
 * @param {string} status - Workday status
 * @returns {string} Hebrew label
 */
function getStatusLabel(status: string): string {
    switch (status) {
        case 'FULL':
            return 'יום מלא';
        case 'EXCEPTION':
            return 'חריגה';
        case 'MISSING':
        default:
            return 'חסר';
    }
}

/**
 * @description WorkdayProgress component displays daily progress with visual progress bar
 * Shows completion percentage, worked minutes, and balance against target
 */
export function WorkdayProgress() {
    const {
        currentWorkday,
        isLoading,
        error,
        submitWorkday,
        cancelWorkday,
        clearError,
    } = useWorkdayStore();

    // Data is fetched by the parent component (DailyReportPage)


    const summary = currentWorkday?.summary;
    const totalMinutes = summary?.totalMinutes ?? 0;
    const completionPercentage = summary?.completionPercentage ?? 0;
    const balanceMinutes = summary?.balanceMinutes ?? 0;
    const status = currentWorkday?.status ?? 'MISSING';
    const isSubmitted = currentWorkday?.isSubmitted ?? false;
    const isLocked = currentWorkday?.isLocked ?? false;

    // Cap progress bar at 100% for visual display
    const progressWidth = Math.min(completionPercentage, 100);

    const canSubmit = !isSubmitted && !isLocked && totalMinutes === TARGET_MINUTES;
    const canCancel = isSubmitted && !isLocked;

    function handleSubmit() {
        if (currentWorkday) {
            submitWorkday(currentWorkday.date).catch(() => {
                // Error handled in store
            });
        }
    }

    function handleCancel() {
        if (currentWorkday) {
            cancelWorkday(currentWorkday.date).catch(() => {
                // Error handled in store
            });
        }
    }

    return (
        <div className={`workday-progress ${getStatusColorClass(status)}`}>
            <div className="workday-progress__header">
                <h3 className="workday-progress__title">התקדמות יומית</h3>
                <span className={`workday-progress__status-badge workday-progress__status-badge--${status.toLowerCase()}`}>
                    {getStatusLabel(status)}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="workday-progress__bar-container">
                <div
                    className="workday-progress__bar"
                    style={{ width: `${progressWidth}%` }}
                    role="progressbar"
                    aria-valuenow={completionPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
                <span className="workday-progress__percentage">{completionPercentage}%</span>
            </div>

            {/* Summary Stats */}
            <div className="workday-progress__stats">
                <div className="workday-progress__stat">
                    <span className="workday-progress__stat-label">עבודה</span>
                    <span className="workday-progress__stat-value">
                        {formatMinutesToTime(summary?.workMinutes ?? 0)}
                    </span>
                </div>
                <div className="workday-progress__stat">
                    <span className="workday-progress__stat-label">היעדרות</span>
                    <span className="workday-progress__stat-value">
                        {formatMinutesToTime(summary?.absenceMinutes ?? 0)}
                    </span>
                </div>
                <div className="workday-progress__stat workday-progress__stat--highlight">
                    <span className="workday-progress__stat-label">סה״כ</span>
                    <span className="workday-progress__stat-value">
                        {formatMinutesToTime(totalMinutes)} / {formatMinutesToTime(TARGET_MINUTES)}
                    </span>
                </div>
                <div className={`workday-progress__stat ${balanceMinutes >= 0 ? 'workday-progress__stat--positive' : 'workday-progress__stat--negative'}`}>
                    <span className="workday-progress__stat-label">מאזן</span>
                    <span className="workday-progress__stat-value">
                        {balanceMinutes >= 0 ? '+' : ''}{formatMinutesToTime(balanceMinutes)}
                    </span>
                </div>
            </div>

            {/* Lock/Submit Status */}
            {isLocked && (
                <div className="workday-progress__lock-notice">
                    <span className="workday-progress__lock-icon">🔒</span>
                    החודש נעול - לא ניתן לבצע שינויים
                </div>
            )}

            {isSubmitted && (
                <div className="workday-progress__submitted-notice">
                    <span className="workday-progress__check-icon">✓</span>
                    יום נשלח בתאריך {summary?.submittedAt ? new Date(summary.submittedAt).toLocaleDateString('he-IL') : ''}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="workday-progress__error" onClick={clearError}>
                    {error}
                </div>
            )}

            {/* Action Buttons */}
            <div className="workday-progress__actions">
                {canSubmit && (
                    <button
                        className="workday-progress__button workday-progress__button--submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'שולח...' : 'שלח יום'}
                    </button>
                )}
                {canCancel && (
                    <button
                        className="workday-progress__button workday-progress__button--cancel"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        {isLoading ? 'מבטל...' : 'בטל שליחה'}
                    </button>
                )}
            </div>
        </div>
    );
}
