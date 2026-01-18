/**
 * @fileoverview Absence reporting page
 * @module pages/AbsencePage
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AbsenceForm, AbsenceFormData, useToast } from '@client/ui';
import './AbsencePage.css';

export default function AbsencePage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [dateMode, setDateMode] = useState<'single' | 'range'>('range');

    const handleSubmit = async (data: AbsenceFormData, file?: File) => {
        setIsSubmitting(true);
        setError('');
        setUploadProgress(0);
        setIsUploading(false);

        try {
            // Simulate upload progress if file exists
            if (file) {
                setIsUploading(true);
                // Simulate upload progress
                for (let i = 0; i <= 100; i += 10) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    setUploadProgress(i);
                }
                setIsUploading(false);
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('Absence data:', data);
            console.log('File:', file);

            // TODO: Replace with actual API call
            // await createAbsence(data, file);

            // Form submitted successfully
            toast.success('הדיווח נשמר בהצלחה!');
            
            // Navigate back on success
            setTimeout(() => {
                navigate(-1);
            }, 1000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'שגיאה בשמירת הדיווח';
            setError(errorMessage);
            toast.error('שגיאה', errorMessage);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    const handleModeChange = (mode: 'single' | 'range') => {
        setDateMode(mode);
    };

    return (
        <div className="absence-page">
            <div className="absence-page__wrapper">
                <div className="absence-page__header">
                    <button
                        type="button"
                        className="absence-page__close"
                        onClick={handleClose}
                        aria-label="סגור"
                    >
                        ×
                    </button>
                    <div className="absence-page__header-content">
                        <h1 className="absence-page__title">דיווח העדרות</h1>
                        {dateMode === 'single' && (
                            <h2 className="absence-page__subtitle">יום בודד</h2>
                        )}
                        {dateMode === 'range' && (
                            <h2 className="absence-page__subtitle">לפי טווח ימים</h2>
                        )}
                    </div>
                    <div className="absence-page__spacer"></div>
                </div>
                <div className="absence-page__content">
                    <AbsenceForm
                        onSubmit={handleSubmit}
                        onClose={handleClose}
                        onModeChange={handleModeChange}
                        isLoading={isSubmitting}
                        error={error}
                        uploadProgress={uploadProgress}
                        isUploading={isUploading}
                    />
                </div>
                <div className="absence-page__search-zone">
                    {/* Search zone section */}
                </div>
            </div>
        </div>
    );
}

