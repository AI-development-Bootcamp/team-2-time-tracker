import React, { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    createTimeEntrySchema,
    CreateTimeEntryInput,
    WorkLocation,
} from '@shared/types';
import {
    Dialog,
    Form,
    FormField,
    FormActions,
    FormSubmitButton,
    Button,
} from '@client/ui';
import { FrequentSelectors } from './FrequentSelectors';
import './TimeEntryForm.css';

interface TimeEntryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Partial<CreateTimeEntryInput>;
    onSubmit: (data: CreateTimeEntryInput) => Promise<void>;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
    open,
    onOpenChange,
    initialData,
    onSubmit,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<CreateTimeEntryInput>({
        resolver: zodResolver(createTimeEntrySchema),
        defaultValues: {
            workDate: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '18:00',
            location: WorkLocation.OFFICE,
            description: '',
            taskId: '',
            ...initialData,
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                workDate: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                endTime: '18:00',
                location: WorkLocation.OFFICE,
                description: '',
                taskId: '',
                ...initialData,
            });
        }
    }, [open, initialData, reset]);

    const handleFormSubmit = async (data: CreateTimeEntryInput) => {
        try {
            await onSubmit(data);
            onOpenChange(false);
            reset();
        } catch (error: any) {
            console.error('Failed to submit time entry:', error);

            let errorMessage = 'שגיאה בשמירת הדיווח';
            if (error.response?.data?.error) {
                const apiError = error.response.data.error;
                errorMessage = typeof apiError === 'string'
                    ? apiError
                    : (apiError.message || JSON.stringify(apiError));
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError('root', {
                type: 'submit',
                message: errorMessage
            });
        }
    };

    const handleSelectorChange = useCallback((selection: any) => {
        setValue('taskId', selection.taskId || '', { shouldValidate: true });
    }, [setValue]);

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title={initialData ? 'Edit Time Entry' : 'New Time Entry'}
        >
            <Form onSubmit={handleSubmit(handleFormSubmit)} className="time-entry-form">
                <FormField
                    label="Date"
                    type="date"
                    error={errors.workDate?.message}
                    {...register('workDate')}
                />

                <div className="time-entry-form__row">
                    <FormField
                        label="Start Time"
                        type="time"
                        error={errors.startTime?.message}
                        {...register('startTime')}
                    />
                    <FormField
                        label="End Time"
                        type="time"
                        error={errors.endTime?.message}
                        {...register('endTime')}
                    />
                </div>

                <div className="input-field input-field--full-width">
                    <label className="input-field__label">Location</label>
                    <select
                        className="input-field__input"
                        {...register('location')}
                    >
                        {Object.values(WorkLocation).map((loc) => (
                            <option key={loc} value={loc}>
                                {loc}
                            </option>
                        ))}
                    </select>
                    {errors.location?.message && (
                        <span className="input-field__error">{errors.location.message}</span>
                    )}
                </div>

                <FrequentSelectors
                    onSelectionChange={handleSelectorChange}
                    initialSelection={{ taskId: initialData?.taskId }}
                    disabled={isSubmitting}
                />
                {errors.taskId?.message && (
                    <span className="input-field__error">{errors.taskId.message}</span>
                )}

                <div className="input-field input-field--full-width">
                    <label className="input-field__label">Description</label>
                    <textarea
                        className="input-field__input time-entry-form__textarea"
                        placeholder="What did you work on?"
                        {...register('description')}
                    />
                    {errors.description?.message && (
                        <span className="input-field__error">{errors.description.message}</span>
                    )}
                </div>

                {errors.root && (
                    <div className="input-field__error" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        {errors.root.message}
                    </div>
                )}

                <FormActions>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <FormSubmitButton isSubmitting={isSubmitting}>
                        {initialData ? 'Update' : 'Create'}
                    </FormSubmitButton>
                </FormActions>
            </Form>
        </Dialog>
    );
};
