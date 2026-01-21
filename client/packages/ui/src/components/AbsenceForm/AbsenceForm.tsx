/**
 * @fileoverview Absence Form component for reporting absences
 * @module ui/AbsenceForm
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, SelectOption } from '../Select/Select';
import { DatePicker } from '../DatePicker/DatePicker';
import { Button } from '../Button/Button';
import { DocumentUploader } from '../DocumentUploader/DocumentUploader';
import './AbsenceForm.css';

/** Absence type options with Hebrew labels and emojis */
const ABSENCE_TYPE_OPTIONS: SelectOption[] = [
    { value: 'VACATION_HALF', label: 'חופשה - חצי יום', emoji: '🏖️' },
    { value: 'VACATION_FULL', label: 'חופשה - יום מלא', emoji: '🏖️' },
    { value: 'SICK', label: 'מחלה', emoji: '😷' },
    { value: 'RESERVES', label: 'מילואים', emoji: '🚨' },
    { value: 'OTHER', label: 'אחר', emoji: '📝' },
];



/** Zod schema for absence form validation */
const absenceFormSchema = z.object({
    absenceType: z.string().optional(),
    dateMode: z.enum(['single', 'range']),
    singleDate: z.date().optional(),
    dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
    }).optional(),
    note: z.string().max(500, 'ההערה ארוכה מדי (מקסימום 500 תווים)').optional(),
}).refine((data) => {
    if (data.dateMode === 'single') {
        return data.singleDate !== undefined;
    }
    return data.dateRange?.from !== undefined;
}, {
    message: 'נא לבחור תאריך',
    path: ['singleDate'],
}).refine((data) => {
    if (data.dateMode === 'range' && data.dateRange?.from && data.dateRange?.to) {
        return data.dateRange.to >= data.dateRange.from;
    }
    return true;
}, {
    message: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה',
    path: ['dateRange'],
}).refine((data) => {
    // absenceType is required only for absence report (single mode)
    if (data.dateMode === 'single') {
        return data.absenceType && data.absenceType.length > 0;
    }
    return true;
}, {
    message: 'נא לבחור סוג העדרות',
    path: ['absenceType'],
});

export type AbsenceFormData = z.infer<typeof absenceFormSchema>;

export interface AbsenceFormProps {
    /** Callback when form is submitted */
    onSubmit: (data: AbsenceFormData, file?: File) => void;
    /** Callback when form is closed */
    onClose?: () => void;
    /** Callback when date mode changes (single/range) */
    onModeChange?: (mode: 'single' | 'range') => void;
    /** Whether form is loading/submitting */
    isLoading?: boolean;
    /** Error message to display */
    error?: string;
    /** Initial values for the form */
    defaultValues?: Partial<AbsenceFormData>;
    /** Custom class name */
    className?: string;
    /** Upload progress (0-100) */
    uploadProgress?: number;
    /** Whether document upload is in progress */
    isUploading?: boolean;
}

/**
 * Calculates the number of Israeli workdays in a date range
 * Excludes Friday (5) and Saturday (6)
 */
function calculateWorkdays(from: Date | undefined, to: Date | undefined): number {
    if (!from || !to) return 0;

    let count = 0;
    const current = new Date(from);

    while (current <= to) {
        const dayOfWeek = current.getDay();
        // Exclude Friday (5) and Saturday (6)
        if (dayOfWeek !== 5 && dayOfWeek !== 6) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    return count;
}

/**
 * AbsenceForm component
 * @description A form for reporting absences with Hebrew/RTL support
 * @param props - AbsenceForm properties
 * @returns AbsenceForm element
 * @example
 * <AbsenceForm
 *   onSubmit={(data, file) => console.log(data, file)}
 *   onClose={() => setIsOpen(false)}
 *   isLoading={isSubmitting}
 * />
 */
export function AbsenceForm({
    onSubmit,
    onClose: _onClose,
    onModeChange,
    isLoading = false,
    error,
    defaultValues,
    className = '',
    uploadProgress = 0,
    isUploading = false,
}: AbsenceFormProps) {
    // onClose is available via _onClose if needed by parent components
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<AbsenceFormData>({
        resolver: zodResolver(absenceFormSchema),
        defaultValues: {
            absenceType: '',
            dateMode: 'range',
            singleDate: undefined,
            dateRange: { from: undefined, to: undefined },
            note: '',
            ...defaultValues,
        },
    });

    const dateMode = watch('dateMode');
    const dateRange = watch('dateRange');
    const absenceType = watch('absenceType');

    const workdaysCount = calculateWorkdays(dateRange?.from, dateRange?.to);

    const handleFormSubmit = (data: AbsenceFormData) => {
        onSubmit(data, selectedFile || undefined);
    };

    const handleDateModeChange = (value: string) => {
        const mode = value as 'single' | 'range';
        setValue('dateMode', mode);
        onModeChange?.(mode);
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
    };

    const handleFileRemove = () => {
        setSelectedFile(null);
    };

    // Determine if document is required (SICK or RESERVES)
    const isDocumentRequired = absenceType === 'SICK' || absenceType === 'RESERVES';

    const classNames = ['absence-form', className].filter(Boolean).join(' ');

    return (
        <form className={classNames} onSubmit={handleSubmit(handleFormSubmit)} noValidate>


            {/* Date Range Fields (for work report - range mode) */}
            {dateMode === 'range' && (
                <div className="absence-form__date-range">
                    <div className="absence-form__date-range-header">
                        <span>מלא את הזמנים</span>
                    </div>
                    <Controller
                        name="dateRange"
                        control={control}
                        render={({ field }) => (
                            <>
                                <div className="absence-form__date-fields">
                                    <div className="absence-form__date-field">
                                        <label className="absence-form__label">תאריך התחלה</label>
                                        <DatePicker
                                            mode="single"
                                            value={field.value?.from}
                                            onChange={(date) => field.onChange({ ...field.value, from: date })}
                                            placeholder="בחר תאריך"
                                            disableWeekends
                                        />
                                    </div>
                                    <div className="absence-form__date-field">
                                        <label className="absence-form__label">תאריך סיום</label>
                                        <DatePicker
                                            mode="single"
                                            value={field.value?.to}
                                            onChange={(date) => field.onChange({ ...field.value, to: date })}
                                            placeholder="בחר תאריך"
                                            disableWeekends
                                        />
                                    </div>
                                </div>
                                {workdaysCount > 0 && (
                                    <div className="absence-form__workdays">
                                        סה"כ ימי דיווח: <strong>{workdaysCount} ימים</strong>
                                    </div>
                                )}
                            </>
                        )}
                    />
                    {errors.dateRange && (
                        <span className="absence-form__error">{errors.dateRange.message}</span>
                    )}
                </div>
            )}

            {/* Date Display (for absence report - single mode) */}
            {dateMode === 'single' && (
                <div className="absence-form__date-display">
                    <Controller
                        name="singleDate"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                mode="single"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="בחר תאריך"
                                disableWeekends
                                error={errors.singleDate?.message}
                            />
                        )}
                    />
                </div>
            )}

            {/* Absence Type Dropdown (for absence report - single mode) */}
            {dateMode === 'single' && (
                <div className="absence-form__field">
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
            )}

            {/* Document Upload Section - only for absence report */}
            {dateMode === 'single' && (
                <div className="absence-form__upload-section">
                    <DocumentUploader
                        onFileSelect={handleFileSelect}
                        onFileRemove={handleFileRemove}
                        selectedFile={selectedFile}
                        required={isDocumentRequired}
                        uploadProgress={uploadProgress}
                        isUploading={isUploading}
                    />
                </div>
            )}

            {/* Divider with "או" - only for absence report */}
            {dateMode === 'single' && (
                <>
                    <div className="absence-form__divider">
                        <span>או</span>
                    </div>

                    {/* Link to range mode */}
                    <button
                        type="button"
                        className="absence-form__range-link"
                        onClick={() => {
                            // If onModeChange is provided, use it (for navigation)
                            // Otherwise, change mode locally
                            if (onModeChange) {
                                onModeChange('range');
                            } else {
                                handleDateModeChange('range');
                            }
                        }}
                    >
                        <span>לדווח על העדרות יותר מיום אחד</span>
                        <ChevronLeftIcon />
                    </button>
                </>
            )}

            {/* Error Message */}
            {error && (
                <div className="absence-form__form-error" role="alert">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <div className="absence-form__actions">
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    שמירה
                </Button>
            </div>
        </form>
    );
}

/** Chevron left icon for RTL navigation */
function ChevronLeftIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export type { SelectOption as AbsenceTypeOption };
