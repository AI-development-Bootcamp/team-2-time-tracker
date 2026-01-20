/**
 * @fileoverview FooterActions Component
 * 
 * This component renders the fixed footer bar at the bottom of the mobile layout.
 * It provides the primary actions for the daily report page:
 * 1. Timer Control: A prominent button to Start/Stop the work timer.
 *    - Displays "Start Timer" with a play icon when idle.
 *    - Displays the elapsed time and a stop icon when running.
 * 2. Manual Report: A button to open the manual time entry form.
 * 
 * The component interacts with the `useTimerStore` to manage timer state and updates.
 */

import React, { useEffect, useRef } from 'react';
import { useTimerStore } from '../app/stores/timer.store';
import './FooterActions.css';

interface FooterActionsProps {
    onStopTimer: () => void;
    onManualReport: () => void;
}

/**
 * FooterActions Component
 * 
 * @param {FooterActionsProps} props
 * @param {() => void} props.onStopTimer - Callback fired when the user clicks the "Stop Timer" button
 * @param {() => void} props.onManualReport - Callback fired when the user clicks the "Manual Report" (plus) button
 */
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
     * Formats the elapsed time of the current timer into a readable HH:MM:SS string.
     * Calculates the difference between the current time and the timer's start time.
     * 
     * @returns {string} Formatted elapsed time (e.g., "01:23:45") or "00:00:00" if no timer is active.
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

    /**
     * Handles the click event for the main timer button.
     * - If the timer is runnning, it triggers the `onStopTimer` callback (which typically opens the unified report form).
     * - If the timer is stopped, it directly calls `startTimer` from the store to begin a new session.
     */
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
