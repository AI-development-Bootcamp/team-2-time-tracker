import { useEffect, useRef, useState } from 'react';
import { useTimerStore } from '../app/stores/timer.store';
import { StopTimerModal } from './StopTimerModal';
import { WorkLocation } from '@shared/types';
import './TimerCard.css';

/**
 * TimerCard component displays the current timer status
 * with real-time counter and start/stop controls
 */
export function TimerCard() {
    const {
        timer,
        isRunning,
        elapsedMinutes,
        isLoading,
        error,
        startTimer,
        stopTimer,
        fetchStatus,
        tick,
        clearError,
    } = useTimerStore();

    const [isStopModalOpen, setIsStopModalOpen] = useState(false);
    const intervalRef = useRef<number | null>(null);

    // Fetch timer status on mount
    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // Set up tick interval when timer is running
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = window.setInterval(() => {
                tick();
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, tick]);

    /**
     * Format minutes to HH:MM:SS string
     */
    function formatTime(totalMinutes: number): string {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const seconds = Math.floor(
            ((Date.now() - new Date(timer?.startedAt || Date.now()).getTime()) % 60000) / 1000
        );
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function handleStartTimer() {
        startTimer().catch(() => {
            // Error handled in store
        });
    }

    function handleStopClick() {
        setIsStopModalOpen(true);
    }

    function handleConfirmStop(data: { taskId: string; location: WorkLocation; description: string }) {
        stopTimer(data)
            .then(() => {
                setIsStopModalOpen(false);
            })
            .catch(() => {
                // Error handled in store, keep modal open
            });
    }

    return (
        <div className="timer-card">
            <div className="timer-card__header">
                <h3 className="timer-card__title">טיימר</h3>
                {isRunning && (
                    <span className="timer-card__indicator timer-card__indicator--active">
                        <span className="timer-card__pulse" />
                        פעיל
                    </span>
                )}
            </div>

            <div className="timer-card__display">
                {isRunning ? (
                    <span className="timer-card__time timer-card__time--running">
                        {formatTime(elapsedMinutes)}
                    </span>
                ) : (
                    <span className="timer-card__time timer-card__time--stopped">
                        00:00:00
                    </span>
                )}
            </div>

            {error && (
                <div className="timer-card__error" onClick={clearError}>
                    {error}
                </div>
            )}

            <div className="timer-card__actions">
                {!isRunning ? (
                    <button
                        className="timer-card__button timer-card__button--start"
                        onClick={handleStartTimer}
                        disabled={isLoading}
                    >
                        {isLoading ? 'מתחיל...' : 'התחל טיימר'}
                    </button>
                ) : (
                    <button
                        className="timer-card__button timer-card__button--stop"
                        onClick={handleStopClick}
                        disabled={isLoading}
                    >
                        {isLoading ? 'עוצר...' : 'עצור טיימר'}
                    </button>
                )}
            </div>

            <StopTimerModal
                isOpen={isStopModalOpen}
                isLoading={isLoading}
                onClose={() => setIsStopModalOpen(false)}
                onConfirm={handleConfirmStop}
            />
        </div>
    );
}
