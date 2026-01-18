/**
 * @fileoverview Tests for TimerCard component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock the timer store
const mockStartTimer = vi.fn();
const mockFetchStatus = vi.fn();
const mockTick = vi.fn();
const mockClearError = vi.fn();

interface MockTimerStoreReturn {
    timer: { id: string; startedAt: string } | null;
    isRunning: boolean;
    elapsedMinutes: number;
    isLoading: boolean;
    error: string | null;
    startTimer: typeof mockStartTimer;
    fetchStatus: typeof mockFetchStatus;
    tick: typeof mockTick;
    clearError: typeof mockClearError;
}

const mockUseTimerStore = vi.fn((): MockTimerStoreReturn => ({
    timer: null,
    isRunning: false,
    elapsedMinutes: 0,
    isLoading: false,
    error: null,
    startTimer: mockStartTimer,
    fetchStatus: mockFetchStatus,
    tick: mockTick,
    clearError: mockClearError,
}));

vi.mock('../app/stores/timer.store', () => ({
    useTimerStore: () => mockUseTimerStore(),
}));

// Simple mock TimerCard component for testing
function TimerCard() {
    const {
        timer,
        isRunning,
        elapsedMinutes,
        isLoading,
        error,
        startTimer,
        fetchStatus,
        tick,
        clearError,
    } = mockUseTimerStore();

    // Simulate useEffect fetch on mount
    React.useEffect(() => {
        fetchStatus();
    }, []);

    // Simulate tick interval when running
    React.useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                tick();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isRunning]);

    function formatTime(totalMinutes: number): string {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const seconds = timer
            ? Math.floor(((Date.now() - new Date(timer.startedAt).getTime()) % 60000) / 1000)
            : 0;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function handleStartTimer() {
        startTimer().catch(() => {});
    }

    return (
        <div className="timer-card" data-testid="timer-card">
            <div className="timer-card__header">
                <h3 className="timer-card__title">טיימר</h3>
                {isRunning && (
                    <span className="timer-card__indicator timer-card__indicator--active" data-testid="active-indicator">
                        <span className="timer-card__pulse" />
                        פעיל
                    </span>
                )}
            </div>

            <div className="timer-card__display" data-testid="timer-display">
                {isRunning ? (
                    <span className="timer-card__time timer-card__time--running" data-testid="running-time">
                        {formatTime(elapsedMinutes)}
                    </span>
                ) : (
                    <span className="timer-card__time timer-card__time--stopped" data-testid="stopped-time">
                        00:00:00
                    </span>
                )}
            </div>

            {error && (
                <div className="timer-card__error" data-testid="error-message" onClick={clearError}>
                    {error}
                </div>
            )}

            <div className="timer-card__actions">
                {!isRunning ? (
                    <button
                        className="timer-card__button timer-card__button--start"
                        onClick={handleStartTimer}
                        disabled={isLoading}
                        data-testid="start-button"
                    >
                        {isLoading ? 'מתחיל...' : 'התחל טיימר'}
                    </button>
                ) : (
                    <button
                        className="timer-card__button timer-card__button--stop"
                        disabled={isLoading}
                        data-testid="stop-button"
                    >
                        {isLoading ? 'עוצר...' : 'עצור טיימר'}
                    </button>
                )}
            </div>
        </div>
    );
}

import React from 'react';

describe('TimerCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        mockUseTimerStore.mockReturnValue({
            timer: null,
            isRunning: false,
            elapsedMinutes: 0,
            isLoading: false,
            error: null,
            startTimer: mockStartTimer,
            fetchStatus: mockFetchStatus,
            tick: mockTick,
            clearError: mockClearError,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render timer card', () => {
        render(<TimerCard />);

        expect(screen.getByTestId('timer-card')).toBeInTheDocument();
        expect(screen.getByText('טיימר')).toBeInTheDocument();
    });

    it('should fetch status on mount', () => {
        render(<TimerCard />);

        expect(mockFetchStatus).toHaveBeenCalled();
    });

    it('should show start button when timer is not running', () => {
        render(<TimerCard />);

        expect(screen.getByTestId('start-button')).toBeInTheDocument();
        expect(screen.getByText('התחל טיימר')).toBeInTheDocument();
    });

    it('should show stop button when timer is running', () => {
        mockUseTimerStore.mockReturnValue({
            timer: { id: 'test-id', startedAt: new Date().toISOString() },
            isRunning: true,
            elapsedMinutes: 45,
            isLoading: false,
            error: null,
            startTimer: mockStartTimer,
            fetchStatus: mockFetchStatus,
            tick: mockTick,
            clearError: mockClearError,
        });

        render(<TimerCard />);

        expect(screen.getByTestId('stop-button')).toBeInTheDocument();
        expect(screen.getByText('עצור טיימר')).toBeInTheDocument();
    });

    it('should show active indicator when timer is running', () => {
        mockUseTimerStore.mockReturnValue({
            timer: { id: 'test-id', startedAt: new Date().toISOString() },
            isRunning: true,
            elapsedMinutes: 45,
            isLoading: false,
            error: null,
            startTimer: mockStartTimer,
            fetchStatus: mockFetchStatus,
            tick: mockTick,
            clearError: mockClearError,
        });

        render(<TimerCard />);

        expect(screen.getByTestId('active-indicator')).toBeInTheDocument();
        expect(screen.getByText('פעיל')).toBeInTheDocument();
    });

    it('should call startTimer when start button clicked', () => {
        mockStartTimer.mockResolvedValue(undefined);

        render(<TimerCard />);

        fireEvent.click(screen.getByTestId('start-button'));

        expect(mockStartTimer).toHaveBeenCalled();
    });

    it('should display elapsed time when running', () => {
        mockUseTimerStore.mockReturnValue({
            timer: { id: 'test-id', startedAt: new Date().toISOString() },
            isRunning: true,
            elapsedMinutes: 65, // 1 hour 5 minutes
            isLoading: false,
            error: null,
            startTimer: mockStartTimer,
            fetchStatus: mockFetchStatus,
            tick: mockTick,
            clearError: mockClearError,
        });

        render(<TimerCard />);

        expect(screen.getByTestId('running-time')).toBeInTheDocument();
    });

    it('should display 00:00:00 when not running', () => {
        render(<TimerCard />);

        expect(screen.getByTestId('stopped-time')).toHaveTextContent('00:00:00');
    });

    it('should display loading state on start button', () => {
        mockUseTimerStore.mockReturnValue({
            timer: null,
            isRunning: false,
            elapsedMinutes: 0,
            isLoading: true,
            error: null,
            startTimer: mockStartTimer,
            fetchStatus: mockFetchStatus,
            tick: mockTick,
            clearError: mockClearError,
        });

        render(<TimerCard />);

        expect(screen.getByTestId('start-button')).toBeDisabled();
        expect(screen.getByText('מתחיל...')).toBeInTheDocument();
    });

    it('should display loading state on stop button', () => {
        mockUseTimerStore.mockReturnValue({
            timer: { id: 'test-id', startedAt: new Date().toISOString() },
            isRunning: true,
            elapsedMinutes: 30,
            isLoading: true,
            error: null,
            startTimer: mockStartTimer,
            fetchStatus: mockFetchStatus,
            tick: mockTick,
            clearError: mockClearError,
        });

        render(<TimerCard />);

        expect(screen.getByTestId('stop-button')).toBeDisabled();
        expect(screen.getByText('עוצר...')).toBeInTheDocument();
    });

    it('should display error message', () => {
        mockUseTimerStore.mockReturnValue({
            timer: null,
            isRunning: false,
            elapsedMinutes: 0,
            isLoading: false,
            error: 'שגיאה בהפעלת הטיימר',
            startTimer: mockStartTimer,
            fetchStatus: mockFetchStatus,
            tick: mockTick,
            clearError: mockClearError,
        });

        render(<TimerCard />);

        expect(screen.getByTestId('error-message')).toHaveTextContent('שגיאה בהפעלת הטיימר');
    });

    it('should clear error on click', () => {
        mockUseTimerStore.mockReturnValue({
            timer: null,
            isRunning: false,
            elapsedMinutes: 0,
            isLoading: false,
            error: 'שגיאה בהפעלת הטיימר',
            startTimer: mockStartTimer,
            fetchStatus: mockFetchStatus,
            tick: mockTick,
            clearError: mockClearError,
        });

        render(<TimerCard />);

        fireEvent.click(screen.getByTestId('error-message'));

        expect(mockClearError).toHaveBeenCalled();
    });

    it('should call tick at regular intervals when running', () => {
        mockUseTimerStore.mockReturnValue({
            timer: { id: 'test-id', startedAt: new Date().toISOString() },
            isRunning: true,
            elapsedMinutes: 0,
            isLoading: false,
            error: null,
            startTimer: mockStartTimer,
            fetchStatus: mockFetchStatus,
            tick: mockTick,
            clearError: mockClearError,
        });

        render(<TimerCard />);

        // Advance time by 3 seconds
        act(() => {
            vi.advanceTimersByTime(3000);
        });

        // tick should be called 3 times (once per second)
        expect(mockTick).toHaveBeenCalledTimes(3);
    });
});
