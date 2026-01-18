import React, { useEffect } from 'react';
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
        formState: { errors, isSubmitting },
    } = useForm<CreateTimeEntryInput>({
        resolver: zodResolver(createTimeEntrySchema),
        defaultValues: {
            workDate: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '18:00',
            location: WorkLocation.OFFICE,
            description: '',
            taskId: '', // TODO: Replace with selector
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
        } catch (error) {
            console.error('Failed to submit time entry:', error);
        }
    };

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

                <FormField
                    label="Task ID (UUID)"
                    placeholder="Enter Task UUID"
                    error={errors.taskId?.message}
                    {...register('taskId')}
                />

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
