/**
 * @fileoverview Date Range Absence reporting page
 * @module pages/AbsenceRangePage
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, SelectOption, DatePicker, DateRange, Button, DocumentUploader, useToast } from '@client/ui';
import { useCreateAbsence, useUploadDocument } from '../api/absencesApi';
import { useAbsenceStore } from '../app/stores/absence.store';
import { AbsenceType, CreateAbsenceRequestDto } from '@shared/types';
import { calculateWorkdayCount } from '@client/utils';
import './AbsenceRangePage.css';

/** Absence type options with Hebrew labels and emojis */
const ABSENCE_TYPE_OPTIONS: SelectOption[] = [
    { value: 'VACATION', label: 'חופשה', emoji: '🏖️' },
    { value: 'SICK', label: 'מחלה', emoji: '😷' },
    { value: 'RESERVES', label: 'מילואים', emoji: '🚨' },
];

/** Zod schema for absence range form validation */
const absenceRangeFormSchema = z.object({
    absenceType: z.enum(['VACATION', 'SICK', 'RESERVES']).optional(),
    dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
    }).optional(),
    note: z.string().max(500, 'ההערה ארוכה מדי (מקסימום 500 תווים)').optional(),
}).refine((data) => {
    return data.absenceType !== undefined;
}, {
    message: 'נא לבחור סוג העדרות',
    path: ['absenceType'],
}).refine((data) => {
    return data.dateRange?.from !== undefined;
}, {
    message: 'נא לבחור תאריך התחלה',
    path: ['dateRange', 'from'],
}).refine((data) => {
    return data.dateRange?.to !== undefined;
}, {
    message: 'נא לבחור תאריך סיום',
    path: ['dateRange', 'to'],
}).refine((data) => {
    if (data.dateRange?.from && data.dateRange?.to) {
        return data.dateRange.to >= data.dateRange.from;
    }
    return true;
}, {
    message: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה',
    path: ['dateRange', 'to'],
});

type AbsenceRangeFormData = z.infer<typeof absenceRangeFormSchema>;

export default function AbsenceRangePage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<AbsenceRangeFormData>({
        resolver: zodResolver(absenceRangeFormSchema),
        defaultValues: {
            absenceType: undefined,
            dateRange: { from: undefined, to: undefined },
            note: '',
        },
    });

    const dateRange = watch('dateRange');
    const absenceType = watch('absenceType');
    const [showRangePicker, setShowRangePicker] = useState(false);

    // Calculate workdays count
    const workdaysCount = dateRange?.from && dateRange?.to
        ? calculateWorkdayCount(dateRange.from, dateRange.to)
        : 0;

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

    /**
     * Maps form data to CreateAbsenceRequestDto
     */
    const mapFormDataToDto = (data: AbsenceRangeFormData): CreateAbsenceRequestDto => {
        const { dateRange } = data;
        if (!dateRange?.from || !dateRange?.to) {
            throw new Error('תאריכים לא תקינים');
        }

        // Format dates as YYYY-MM-DD (backend expects this format)
        const formatDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            type: data.absenceType as AbsenceType,
            startDate: formatDate(dateRange.from),
            endDate: formatDate(dateRange.to),
            isHalfDay: false, // Range absences are always full day
            note: data.note,
        };
    };

    const handleFormSubmit = async (data: AbsenceRangeFormData) => {
        setCreateAbsenceLoading(true);
        setCreateAbsenceError(null);

        try {
            // Map form data to API DTO
            const absenceData = mapFormDataToDto(data);

            // Create absence request
            const createdAbsence = await createAbsenceMutation.mutateAsync(absenceData);

            // If file is provided, upload it
            if (selectedFile && createdAbsence.id) {
                setUploading(true);
                await uploadDocumentMutation.mutateAsync({
                    absenceId: createdAbsence.id,
                    file: selectedFile,
                });
            }

            // Success - clear form and show notification
            setCreateAbsenceSuccess();
            toast.success('הדיווח נשמר בהצלחה!');

            // Navigate back on success
            setTimeout(() => {
                navigate(-1);
            }, 1000);
        } catch (err) {
            // Error handling is done in mutation callbacks
            console.error('Error submitting absence:', err);
        } finally {
            setCreateAbsenceLoading(false);
            setUploading(false);
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
    };

    const handleFileRemove = () => {
        setSelectedFile(null);
    };

    // Determine if document is required (SICK or RESERVES)
    const isDocumentRequired = absenceType === 'SICK' || absenceType === 'RESERVES';

    // Get loading and error states from store and mutations
    const { isLoading, error, isUploading } = useAbsenceStore();
    const isSubmitting = createAbsenceMutation.isPending || uploadDocumentMutation.isPending || isLoading;
    const errorMessage = error || (createAbsenceMutation.error ? String(createAbsenceMutation.error) : '');

    return (
        <div className="absence-range-page">
            <div className="absence-range-page__wrapper">
                <div className="absence-range-page__header">
                    <button
                        type="button"
                        className="absence-range-page__close"
                        onClick={handleClose}
                        aria-label="סגור"
                    >
                        ×
                    </button>
                    <h1 className="absence-range-page__title">דיווח העדרות - לפי טווח ימים</h1>
                    <button
                        type="button"
                        className="absence-range-page__back"
                        onClick={handleClose}
                        aria-label="חזור"
                    >
                        ›
                    </button>
                </div>
                <div className="absence-range-page__content">
                    <form className="absence-range-form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                        {/* Absence Type Dropdown */}
                        <div className="absence-range-form__field">
                            <Controller
                                name="absenceType"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        placeholder="בחר סוג העדרות"
                                        options={ABSENCE_TYPE_OPTIONS}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.absenceType?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Date Range Section */}
                        <div className="absence-range-form__date-range">
                            <div className="absence-range-form__date-range-header">
                                <span>מלא את הזמנים</span>
                            </div>
                            <Controller
                                name="dateRange"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        {/* Range Picker Option */}
                                        <div className="absence-range-form__range-picker-toggle">
                                            <button
                                                type="button"
                                                className="absence-range-form__range-button"
                                                onClick={() => setShowRangePicker(!showRangePicker)}
                                            >
                                                {showRangePicker ? 'בחר תאריכים בנפרד' : 'בחר טווח תאריכים בקלנדר'}
                                            </button>
                                        </div>

                                        {showRangePicker ? (
                                            /* Range Calendar Picker */
                                            <div className="absence-range-form__range-picker">
                                                <DatePicker
                                                    mode="range"
                                                    value={{
                                                        from: field.value?.from,
                                                        to: field.value?.to,
                                                    } as DateRange}
                                                    onChange={(range) => {
                                                        if (range) {
                                                            field.onChange({
                                                                from: range.from,
                                                                to: range.to,
                                                            });
                                                        }
                                                    }}
                                                    placeholder="בחר טווח תאריכים"
                                                    disableWeekends
                                                />
                                                {errors.dateRange?.message && (
                                                    <span className="absence-range-form__error">
                                                        {errors.dateRange.message}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            /* Separate Date Fields */
                                            <>
                                                <div className="absence-range-form__date-fields">
                                                    <div className="absence-range-form__date-field-wrapper">
                                                        <label className="absence-range-form__label">תאריך התחלה</label>
                                                        <div className="absence-range-form__date-picker-wrapper">
                                                            <DatePicker
                                                                mode="single"
                                                                value={field.value?.from}
                                                                onChange={(date) => {
                                                                    field.onChange({
                                                                        ...field.value,
                                                                        from: date,
                                                                    });
                                                                }}
                                                                placeholder="בחר תאריך"
                                                                disableWeekends
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="absence-range-form__date-field-wrapper">
                                                        <label className="absence-range-form__label">תאריך סיום</label>
                                                        <div className="absence-range-form__date-picker-wrapper">
                                                            <DatePicker
                                                                mode="single"
                                                                value={field.value?.to}
                                                                onChange={(date) => {
                                                                    field.onChange({
                                                                        ...field.value,
                                                                        to: date,
                                                                    });
                                                                }}
                                                                placeholder="בחר תאריך"
                                                                disableWeekends
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {(errors.dateRange?.from || errors.dateRange?.to) && (
                                                    <span className="absence-range-form__error">
                                                        {errors.dateRange?.from?.message || errors.dateRange?.to?.message}
                                                    </span>
                                                )}
                                            </>
                                        )}

                                        {workdaysCount > 0 && (
                                            <div className="absence-range-form__workdays">
                                                סה"כ ימי דיווח: <strong>{workdaysCount} ימים</strong>
                                            </div>
                                        )}
                                    </>
                                )}
                            />
                        </div>

                        {/* Document Upload Section */}
                        <div className="absence-range-form__upload-section">
                            <DocumentUploader
                                onFileSelect={handleFileSelect}
                                onFileRemove={handleFileRemove}
                                selectedFile={selectedFile}
                                required={isDocumentRequired}
                                uploadProgress={uploadProgress}
                                isUploading={isUploading}
                            />
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="absence-range-form__form-error" role="alert">
                                {errorMessage}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="absence-range-form__actions">
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                שמירה
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Bottom Search Zone */}
                <div className="absence-range-page__search-zone">
                    {/* Search zone content - can be customized later */}
                </div>
            </div>
        </div>
    );
}
