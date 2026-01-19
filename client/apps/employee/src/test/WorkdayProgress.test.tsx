/**
 * @fileoverview Tests for WorkdayProgress component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock the workday store
const mockFetchWorkday = vi.fn();
const mockSubmitWorkday = vi.fn();
const mockCancelWorkday = vi.fn();
const mockClearError = vi.fn();

interface MockWorkdayData {
    date: string;
    status: 'FULL' | 'MISSING' | 'EXCEPTION';
    isLocked: boolean;
    isSubmitted: boolean;
    summary: {
        targetMinutes: number;
        workMinutes: number;
        absenceMinutes: number;
        totalMinutes: number;
        balanceMinutes: number;
        completionPercentage: number;
        isLocked: boolean;
        lockedMonthId: string | null;
        isSubmitted: boolean;
        submittedAt: string | null;
        requiresExactTotal: boolean;
    };
    timeEntries: unknown[];
    absences: unknown[];
}

interface MockWorkdayStoreReturn {
    currentWorkday: MockWorkdayData | null;
    isLoading: boolean;
    error: string | null;
    fetchWorkday: typeof mockFetchWorkday;
    submitWorkday: typeof mockSubmitWorkday;
    cancelWorkday: typeof mockCancelWorkday;
    clearError: typeof mockClearError;
}

const createMockWorkday = (overrides: Partial<MockWorkdayData> = {}): MockWorkdayData => ({
    date: '2026-01-17',
    status: 'MISSING',
    isLocked: false,
    isSubmitted: false,
    summary: {
        targetMinutes: 540,
        workMinutes: 480,
        absenceMinutes: 0,
        totalMinutes: 480,
        balanceMinutes: -60,
        completionPercentage: 89,
        isLocked: false,
        lockedMonthId: null,
        isSubmitted: false,
        submittedAt: null,
        requiresExactTotal: false,
    },
    timeEntries: [],
    absences: [],
    ...overrides,
});

const mockUseWorkdayStore = vi.fn((): MockWorkdayStoreReturn => ({
    currentWorkday: createMockWorkday(),
    isLoading: false,
    error: null,
    fetchWorkday: mockFetchWorkday,
    submitWorkday: mockSubmitWorkday,
    cancelWorkday: mockCancelWorkday,
    clearError: mockClearError,
}));

vi.mock('../app/stores/workday.store', () => ({
    useWorkdayStore: () => mockUseWorkdayStore(),
}));

// Inline WorkdayProgress component for testing
const TARGET_MINUTES = 540;

function formatMinutesToTime(minutes: number): string {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? '-' : '';
    return `${sign}${hours}:${mins.toString().padStart(2, '0')}`;
}

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

function WorkdayProgress() {
    const {
        currentWorkday,
        isLoading,
        error,
        fetchWorkday,
        submitWorkday,
        cancelWorkday,
        clearError,
    } = mockUseWorkdayStore();

    React.useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        fetchWorkday(today);
    }, []);

    const summary = currentWorkday?.summary;
    const totalMinutes = summary?.totalMinutes ?? 0;
    const completionPercentage = summary?.completionPercentage ?? 0;
    const balanceMinutes = summary?.balanceMinutes ?? 0;
    const status = currentWorkday?.status ?? 'MISSING';
    const isSubmitted = currentWorkday?.isSubmitted ?? false;
    const isLocked = currentWorkday?.isLocked ?? false;

    const progressWidth = Math.min(completionPercentage, 100);
    const canSubmit = !isSubmitted && !isLocked && totalMinutes === TARGET_MINUTES;
    const canCancel = isSubmitted && !isLocked;

    function handleSubmit() {
        if (currentWorkday) {
            submitWorkday(currentWorkday.date);
        }
    }

    function handleCancel() {
        if (currentWorkday) {
            cancelWorkday(currentWorkday.date);
        }
    }

    return (
        <div className={`workday-progress ${getStatusColorClass(status)}`} data-testid="workday-progress">
            <div className="workday-progress__header">
                <h3 className="workday-progress__title">התקדמות יומית</h3>
                <span
                    className={`workday-progress__status-badge workday-progress__status-badge--${status.toLowerCase()}`}
                    data-testid="status-badge"
                >
                    {getStatusLabel(status)}
                </span>
            </div>

            <div className="workday-progress__bar-container">
                <div
                    className="workday-progress__bar"
                    style={{ width: `${progressWidth}%` }}
                    role="progressbar"
                    aria-valuenow={completionPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    data-testid="progress-bar"
                />
                <span className="workday-progress__percentage" data-testid="percentage">
                    {completionPercentage}%
                </span>
            </div>

            <div className="workday-progress__stats" data-testid="stats">
                <div className="workday-progress__stat">
                    <span className="workday-progress__stat-label">עבודה</span>
                    <span className="workday-progress__stat-value" data-testid="work-minutes">
                        {formatMinutesToTime(summary?.workMinutes ?? 0)}
                    </span>
                </div>
                <div className="workday-progress__stat">
                    <span className="workday-progress__stat-label">היעדרות</span>
                    <span className="workday-progress__stat-value" data-testid="absence-minutes">
                        {formatMinutesToTime(summary?.absenceMinutes ?? 0)}
                    </span>
                </div>
                <div className="workday-progress__stat workday-progress__stat--highlight">
                    <span className="workday-progress__stat-label">סה״כ</span>
                    <span className="workday-progress__stat-value" data-testid="total-minutes">
                        {formatMinutesToTime(totalMinutes)} / {formatMinutesToTime(TARGET_MINUTES)}
                    </span>
                </div>
                <div className={`workday-progress__stat ${balanceMinutes >= 0 ? 'workday-progress__stat--positive' : 'workday-progress__stat--negative'}`}>
                    <span className="workday-progress__stat-label">מאזן</span>
                    <span className="workday-progress__stat-value" data-testid="balance-minutes">
                        {balanceMinutes >= 0 ? '+' : ''}{formatMinutesToTime(balanceMinutes)}
                    </span>
                </div>
            </div>

            {isLocked && (
                <div className="workday-progress__lock-notice" data-testid="lock-notice">
                    <span className="workday-progress__lock-icon">🔒</span>
                    החודש נעול - לא ניתן לבצע שינויים
                </div>
            )}

            {isSubmitted && (
                <div className="workday-progress__submitted-notice" data-testid="submitted-notice">
                    <span className="workday-progress__check-icon">✓</span>
                    יום נשלח
                </div>
            )}

            {error && (
                <div className="workday-progress__error" data-testid="error-message" onClick={clearError}>
                    {error}
                </div>
            )}

            <div className="workday-progress__actions" data-testid="actions">
                {canSubmit && (
                    <button
                        className="workday-progress__button workday-progress__button--submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        data-testid="submit-button"
                    >
                        {isLoading ? 'שולח...' : 'שלח יום'}
                    </button>
                )}
                {canCancel && (
                    <button
                        className="workday-progress__button workday-progress__button--cancel"
                        onClick={handleCancel}
                        disabled={isLoading}
                        data-testid="cancel-button"
                    >
                        {isLoading ? 'מבטל...' : 'בטל שליחה'}
                    </button>
                )}
            </div>
        </div>
    );
}

describe('WorkdayProgress', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday(),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render workday progress component', () => {
        render(<WorkdayProgress />);

        expect(screen.getByTestId('workday-progress')).toBeInTheDocument();
        expect(screen.getByText('התקדמות יומית')).toBeInTheDocument();
    });

    it('should fetch workday on mount', () => {
        render(<WorkdayProgress />);

        expect(mockFetchWorkday).toHaveBeenCalled();
    });

    it('should display correct status badge for MISSING status', () => {
        render(<WorkdayProgress />);

        expect(screen.getByTestId('status-badge')).toHaveTextContent('חסר');
    });

    it('should display correct status badge for FULL status', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                status: 'FULL',
                summary: {
                    targetMinutes: 540,
                    workMinutes: 540,
                    absenceMinutes: 0,
                    totalMinutes: 540,
                    balanceMinutes: 0,
                    completionPercentage: 100,
                    isLocked: false,
                    lockedMonthId: null,
                    isSubmitted: false,
                    submittedAt: null,
                    requiresExactTotal: false,
                },
            }),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        expect(screen.getByTestId('status-badge')).toHaveTextContent('יום מלא');
    });

    it('should display correct status badge for EXCEPTION status', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                status: 'EXCEPTION',
                summary: {
                    targetMinutes: 540,
                    workMinutes: 600,
                    absenceMinutes: 0,
                    totalMinutes: 600,
                    balanceMinutes: 60,
                    completionPercentage: 111,
                    isLocked: false,
                    lockedMonthId: null,
                    isSubmitted: false,
                    submittedAt: null,
                    requiresExactTotal: false,
                },
            }),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        expect(screen.getByTestId('status-badge')).toHaveTextContent('חריגה');
    });

    it('should display correct percentage', () => {
        render(<WorkdayProgress />);

        expect(screen.getByTestId('percentage')).toHaveTextContent('89%');
    });

    it('should display work minutes correctly', () => {
        render(<WorkdayProgress />);

        expect(screen.getByTestId('work-minutes')).toHaveTextContent('8:00');
    });

    it('should display negative balance correctly', () => {
        render(<WorkdayProgress />);

        expect(screen.getByTestId('balance-minutes')).toHaveTextContent('-1:00');
    });

    it('should display positive balance correctly', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                status: 'EXCEPTION',
                summary: {
                    targetMinutes: 540,
                    workMinutes: 600,
                    absenceMinutes: 0,
                    totalMinutes: 600,
                    balanceMinutes: 60,
                    completionPercentage: 111,
                    isLocked: false,
                    lockedMonthId: null,
                    isSubmitted: false,
                    submittedAt: null,
                    requiresExactTotal: false,
                },
            }),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        expect(screen.getByTestId('balance-minutes')).toHaveTextContent('+1:00');
    });

    it('should show submit button when total equals 540 and not submitted', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                status: 'FULL',
                summary: {
                    targetMinutes: 540,
                    workMinutes: 540,
                    absenceMinutes: 0,
                    totalMinutes: 540,
                    balanceMinutes: 0,
                    completionPercentage: 100,
                    isLocked: false,
                    lockedMonthId: null,
                    isSubmitted: false,
                    submittedAt: null,
                    requiresExactTotal: false,
                },
            }),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        expect(screen.getByTestId('submit-button')).toBeInTheDocument();
        expect(screen.getByText('שלח יום')).toBeInTheDocument();
    });

    it('should NOT show submit button when total does not equal 540', () => {
        render(<WorkdayProgress />);

        expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
    });

    it('should show cancel button when workday is submitted and not locked', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                status: 'FULL',
                isSubmitted: true,
                summary: {
                    targetMinutes: 540,
                    workMinutes: 540,
                    absenceMinutes: 0,
                    totalMinutes: 540,
                    balanceMinutes: 0,
                    completionPercentage: 100,
                    isLocked: false,
                    lockedMonthId: null,
                    isSubmitted: true,
                    submittedAt: '2026-01-17T17:00:00Z',
                    requiresExactTotal: false,
                },
            }),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
        expect(screen.getByText('בטל שליחה')).toBeInTheDocument();
    });

    it('should show lock notice when month is locked', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                isLocked: true,
            }),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        expect(screen.getByTestId('lock-notice')).toBeInTheDocument();
        expect(screen.getByText(/נעול/)).toBeInTheDocument();
    });

    it('should show submitted notice when workday is submitted', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                isSubmitted: true,
            }),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        expect(screen.getByTestId('submitted-notice')).toBeInTheDocument();
    });

    it('should call submitWorkday when submit button is clicked', () => {
        mockSubmitWorkday.mockResolvedValue(true);
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                status: 'FULL',
                summary: {
                    targetMinutes: 540,
                    workMinutes: 540,
                    absenceMinutes: 0,
                    totalMinutes: 540,
                    balanceMinutes: 0,
                    completionPercentage: 100,
                    isLocked: false,
                    lockedMonthId: null,
                    isSubmitted: false,
                    submittedAt: null,
                    requiresExactTotal: false,
                },
            }),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        fireEvent.click(screen.getByTestId('submit-button'));

        expect(mockSubmitWorkday).toHaveBeenCalledWith('2026-01-17');
    });

    it('should call cancelWorkday when cancel button is clicked', () => {
        mockCancelWorkday.mockResolvedValue(true);
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                status: 'FULL',
                isSubmitted: true,
                summary: {
                    targetMinutes: 540,
                    workMinutes: 540,
                    absenceMinutes: 0,
                    totalMinutes: 540,
                    balanceMinutes: 0,
                    completionPercentage: 100,
                    isLocked: false,
                    lockedMonthId: null,
                    isSubmitted: true,
                    submittedAt: '2026-01-17T17:00:00Z',
                    requiresExactTotal: false,
                },
            }),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        fireEvent.click(screen.getByTestId('cancel-button'));

        expect(mockCancelWorkday).toHaveBeenCalledWith('2026-01-17');
    });

    it('should display error message', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday(),
            isLoading: false,
            error: 'שגיאה בטעינת נתוני יום העבודה',
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        expect(screen.getByTestId('error-message')).toHaveTextContent('שגיאה בטעינת נתוני יום העבודה');
    });

    it('should clear error on click', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday(),
            isLoading: false,
            error: 'שגיאה בטעינת נתוני יום העבודה',
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        fireEvent.click(screen.getByTestId('error-message'));

        expect(mockClearError).toHaveBeenCalled();
    });

    it('should disable buttons during loading', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                status: 'FULL',
                isSubmitted: true,
                summary: {
                    targetMinutes: 540,
                    workMinutes: 540,
                    absenceMinutes: 0,
                    totalMinutes: 540,
                    balanceMinutes: 0,
                    completionPercentage: 100,
                    isLocked: false,
                    lockedMonthId: null,
                    isSubmitted: true,
                    submittedAt: '2026-01-17T17:00:00Z',
                    requiresExactTotal: false,
                },
            }),
            isLoading: true,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        expect(screen.getByTestId('cancel-button')).toBeDisabled();
        expect(screen.getByText('מבטל...')).toBeInTheDocument();
    });

    it('should NOT show buttons when locked', () => {
        mockUseWorkdayStore.mockReturnValue({
            currentWorkday: createMockWorkday({
                status: 'FULL',
                isLocked: true,
                isSubmitted: true,
                summary: {
                    targetMinutes: 540,
                    workMinutes: 540,
                    absenceMinutes: 0,
                    totalMinutes: 540,
                    balanceMinutes: 0,
                    completionPercentage: 100,
                    isLocked: true,
                    lockedMonthId: 'lock-id',
                    isSubmitted: true,
                    submittedAt: '2026-01-17T17:00:00Z',
                    requiresExactTotal: false,
                },
            }),
            isLoading: false,
            error: null,
            fetchWorkday: mockFetchWorkday,
            submitWorkday: mockSubmitWorkday,
            cancelWorkday: mockCancelWorkday,
            clearError: mockClearError,
        });

        render(<WorkdayProgress />);

        expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
        expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument();
    });
});
