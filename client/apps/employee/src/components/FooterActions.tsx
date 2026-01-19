import React from 'react';
import './FooterActions.css';

interface FooterActionsProps {
    onStartTimer: () => void;
    onManualReport: () => void;
}

export const FooterActions: React.FC<FooterActionsProps> = ({
    onStartTimer,
    onManualReport,
}) => {
    return (
        <div className="footer-actions">
            <div className="footer-actions__buttons">
                {/* Start Timer Button */}
                <button
                    className="footer-actions__button footer-actions__button--timer"
                    onClick={onStartTimer}
                >
                    <div className="footer-actions__icon footer-actions__icon--play">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M8 5v14l11-7z" fill="white" />
                        </svg>
                    </div>
                    <span className="footer-actions__label">הפעלת שעון</span>
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
