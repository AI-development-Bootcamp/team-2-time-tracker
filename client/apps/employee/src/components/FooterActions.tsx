import React, { useEffect, useRef } from 'react';
import { useTimerStore } from '../app/stores/timer.store';
import './FooterActions.css';

interface FooterActionsProps {
    onStopTimer: () => void;
    onManualReport: () => void;
}

export const FooterActions: React.FC<FooterActionsProps> = ({
    onStopTimer,
    onManualReport,
}) => {
    const {
        timer,
        isRunning,
        startTimer,
        fetchStatus,
        tick,
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

    /**
     * Format elapsed time to HH:MM:SS string
     */
    const formatTime = (): string => {
        if (!timer) return '00:00:00';

        const startedAt = new Date(timer.startedAt);
        const now = new Date();
        const elapsedMs = now.getTime() - startedAt.getTime();

        const hours = Math.floor(elapsedMs / 3600000);
        const minutes = Math.floor((elapsedMs % 3600000) / 60000);
        const seconds = Math.floor((elapsedMs % 60000) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleTimerButtonClick = async () => {
        if (isRunning) {
            // Timer is running - stop it
            onStopTimer();
        } else {
            // Timer is not running - start it
            try {
                await startTimer();
            } catch (error) {
                console.error('Failed to start timer:', error);
            }
        }
    };

    return (
        <div className="footer-actions">
            <div className="footer-actions__buttons">
                {/* Timer Button - changes based on timer state */}
                <button
                    className={`footer-actions__button footer-actions__button--timer ${isRunning ? 'footer-actions__button--timer-running' : ''}`}
                    onClick={handleTimerButtonClick}
                >
                    {isRunning ? (
                        <>
                            {/* Stop Icon */}
                            <div className="footer-actions__icon footer-actions__icon--stop">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" fill="#FF4444" />
                                    <rect x="8" y="8" width="8" height="8" fill="white" />
                                </svg>
                            </div>
                            {/* Timer Display */}
                            <span className="footer-actions__timer-display">{formatTime()}</span>
                        </>
                    ) : (
                        <>
                            {/* Play Icon */}
                            <div className="footer-actions__icon footer-actions__icon--play">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M8 5v14l11-7z" fill="white" />
                                </svg>
                            </div>
                            <span className="footer-actions__label">הפעלת שעון</span>
                        </>
                    )}
                </button>

                {/* Separator */}
                <div className="footer-actions__separator" />

                {/* Manual Report Button */}
                <button
                    className="footer-actions__button footer-actions__button--manual"
                    onClick={onManualReport}
                >
                    <span className="footer-actions__label">דיווח ידני</span>
                    <div className="footer-actions__icon footer-actions__icon--plus">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                            <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    );
};
