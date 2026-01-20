import { useEffect, useRef } from 'react';
import { useTimerStore } from '../app/stores/timer.store';
import './TimerBanner.css';

interface TimerBannerProps {
    onStopClick?: () => void;
}

/**
 * Fixed timer banner visible on all pages when timer is running
 * Following Figma design specifications
 */
export function TimerBanner({ onStopClick }: TimerBannerProps) {
    const {
        timer,
        isRunning,
        elapsedMinutes,
        isLoading,
        fetchStatus,
        tick,
        cancelTimer,
    } = useTimerStore();

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

    // Don't render if timer is not running
    if (!isRunning || !timer) {
        return null;
    }

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

    function handleQuickCancel() {
        if (window.confirm('האם אתה בטוח שברצונך לבטל את הטיימר?')) {
            cancelTimer().catch(() => {
                // Error handled in store
            });
        }
    }

    function handleStopClick() {
        if (onStopClick) {
            onStopClick();
        }
    }

    return (
        <div className="timer-banner">
            <div className="timer-banner__content">
                <div className="timer-banner__status">
                    <span className="timer-banner__pulse" />
                    <span className="timer-banner__label">טיימר פעיל</span>
                </div>

                <div className="timer-banner__time">
                    {formatTime(elapsedMinutes)}
                </div>

                <div className="timer-banner__actions">
                    <button
                        className="timer-banner__button timer-banner__button--stop"
                        onClick={handleStopClick}
                        disabled={isLoading}
                    >
                        עצור ושמור
                    </button>
                    <button
                        className="timer-banner__button timer-banner__button--cancel"
                        onClick={handleQuickCancel}
                        disabled={isLoading}
                    >
                        ביטול
                    </button>
                </div>
            </div>
        </div>
    );
}
