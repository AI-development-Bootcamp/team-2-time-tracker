/**
 * @fileoverview Absence reporting page
 * @module pages/AbsencePage
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AbsenceForm, AbsenceFormData, useToast } from '@client/ui';
import { useCreateAbsence, useUploadDocument } from '../api/absencesApi';
import { useAbsenceStore } from '../app/stores/absence.store';
import { AbsenceType, CreateAbsenceRequestDto } from '@shared/types';
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
            const errorMessage = typeof error === 'string' ? error : 'שגיאה בשמירת הדיווח';
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
            const errorMessage = typeof error === 'string' ? error : 'שגיאה בהעלאת המסמך';
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

        // Determine absence type and isHalfDay
        let type: AbsenceType = AbsenceType.VACATION;
        let isHalfDay = false;

        if (data.absenceType) {
            if (data.absenceType === 'VACATION_HALF') {
                type = AbsenceType.VACATION;
                isHalfDay = true;
            } else if (data.absenceType === 'VACATION_FULL') {
                type = AbsenceType.VACATION;
                isHalfDay = false;
            } else if (data.absenceType === 'SICK') {
                type = AbsenceType.SICK;
                isHalfDay = false;
            } else if (data.absenceType === 'RESERVES') {
                type = AbsenceType.RESERVES;
                isHalfDay = false;
            }
        }

        // Format dates as YYYY-MM-DD (backend expects this format)
        const formatDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

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
    const errorMessage = error || (createAbsenceMutation.error ? String(createAbsenceMutation.error) : '');

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

