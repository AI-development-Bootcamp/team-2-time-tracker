/**
 * @fileoverview Absence reporting page
 * @module pages/AbsencePage
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AbsenceForm, AbsenceFormData, useToast } from '@client/ui';
import { useCreateAbsence, useUploadDocument } from '../api/absencesApi';
import { useAbsenceStore } from '../app/stores/absence.store';
import { CreateAbsenceRequestDto } from '@shared/types';
import { mapAbsenceType, formatDate } from '../utils';
import './AbsencePage.css';

export default function AbsencePage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [uploadProgress, setUploadProgress] = useState(0);

    // Get store actions
    const {
        setCreateAbsenceLoading,
        setCreateAbsenceError,
        setCreateAbsenceSuccess,
        setUploadProgress: setStoreUploadProgress,
        setUploading,
        setUploadError,
        setUploadSuccess,
    } = useAbsenceStore();

    // Setup mutations
    const createAbsenceMutation = useCreateAbsence({
        onSuccess: (absence) => {
            console.log('Absence created:', absence);
        },
        onError: (error) => {
            // error is already a Hebrew string from getHebrewErrorMessage
            const errorMessage = String(error) || 'שגיאה בשמירת הדיווח';
            setCreateAbsenceError(errorMessage);
            toast.error(errorMessage);
        },
    });

    const uploadDocumentMutation = useUploadDocument({
        onProgress: (progress) => {
            setUploadProgress(progress);
            setStoreUploadProgress(progress);
        },
        onSuccess: (document) => {
            console.log('Document uploaded:', document);
            setUploadSuccess();
        },
        onError: (error) => {
            // error is already a Hebrew string from getHebrewErrorMessage
            const errorMessage = String(error) || 'שגיאה בהעלאת המסמך';
            setUploadError(errorMessage);
            toast.error(errorMessage);
        },
    });

    const handleSubmit = async (data: AbsenceFormData, file?: File) => {
        setCreateAbsenceLoading(true);
        setCreateAbsenceError(null);

        try {
            // Map form data to API DTO
            const absenceData = mapFormDataToDto(data);

            // Create absence request
            const createdAbsence = await createAbsenceMutation.mutateAsync(absenceData);

            // If file is provided, upload it
            let fileUploadSuccess = true;
            if (file && createdAbsence.id) {
                try {
                    setUploading(true);
                    await uploadDocumentMutation.mutateAsync({
                        absenceId: createdAbsence.id,
                        file,
                    });
                } catch (uploadErr) {
                    // File upload failed, but absence was created
                    fileUploadSuccess = false;
                    const errorMessage = typeof uploadErr === 'string' ? uploadErr : 'שגיאה בהעלאת הקובץ';
                    console.error('Error uploading file:', uploadErr);
                    
                    // Show warning that absence was saved but file upload failed
                    toast.warning(`הדיווח נשמר, אך העלאת הקובץ נכשלה: ${errorMessage}`);
                }
            }

            // Success - clear form and show notification
            setCreateAbsenceSuccess();
            
            if (fileUploadSuccess) {
                toast.success('הדיווח נשמר בהצלחה!');
            }

            // Navigate to home page on success
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            // Error handling is done in mutation callbacks
            console.error('Error submitting absence:', err);
        } finally {
            setCreateAbsenceLoading(false);
            setUploading(false);
        }
    };

    /**
     * Maps AbsenceFormData to CreateAbsenceRequestDto
     * This page only handles single day absences
     */
    const mapFormDataToDto = (data: AbsenceFormData): CreateAbsenceRequestDto => {
        // This page only handles single day mode
        if (data.dateMode !== 'single' || !data.singleDate) {
            throw new Error('דף זה מיועד לדיווח יום בודד בלבד');
        }

        // Determine absence type and isHalfDay using mapping utility
        const { type, isHalfDay } = mapAbsenceType(data.absenceType);

        const startDate = data.singleDate;
        const endDate = data.singleDate;

        return {
            type,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            isHalfDay,
            note: data.note,
        };
    };

    const handleClose = () => {
        navigate(-1);
    };

    const handleModeChange = (mode: 'single' | 'range') => {
        // If user switches to range mode, navigate to range page
        if (mode === 'range') {
            navigate('/absences/range');
        }
        // If mode is 'single', stay on this page (default behavior)
    };

    // Get loading and error states from store and mutations
    const { isLoading, error, isUploading } = useAbsenceStore();
    const isSubmitting = createAbsenceMutation.isPending || uploadDocumentMutation.isPending || isLoading;
    // Use error from store - it's already set by onError callbacks with Hebrew message
    const errorMessage = error || '';

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
                        <h1 className="absence-page__title">דיווח היעדרות</h1>
                        <h2 className="absence-page__subtitle">יום בודד</h2>
                    </div>
                    <div className="absence-page__spacer"></div>
                </div>
                <div className="absence-page__content">
                    <AbsenceForm
                        onSubmit={handleSubmit}
                        onClose={handleClose}
                        onModeChange={handleModeChange}
                        isLoading={isSubmitting}
                        error={errorMessage}
                        uploadProgress={uploadProgress}
                        isUploading={isUploading}
                        defaultValues={{ dateMode: 'single' }}
                    />
                </div>
            </div>
        </div>
    );
}

