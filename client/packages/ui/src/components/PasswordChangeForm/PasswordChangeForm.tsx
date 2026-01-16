/**
 * @fileoverview PasswordChangeForm component
 * @module ui/PasswordChangeForm
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormActions, FormSubmitButton } from '../Form/Form';
import { Button } from '../Button/Button';
import './PasswordChangeForm.css';

const passwordChangeSchema = z
    .object({
        currentPassword: z.string().min(1, 'נדרשת סיסמה נוכחית'),
        newPassword: z
            .string()
            .min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים')
            .regex(/[A-Z]/, 'הסיסמה חייבת להכיל אות גדולה')
            .regex(/[a-z]/, 'הסיסמה חייבת להכיל אות קטנה')
            .regex(/[0-9]/, 'הסיסמה חייבת להכיל מספר'),
        confirmPassword: z.string().min(1, 'נדרש אימות סיסמה'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'הסיסמאות אינן תואמות',
        path: ['confirmPassword'],
    });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeFormProps {
    /** Form submit handler */
    onSubmit: (data: PasswordChangeFormData) => Promise<void> | void;
    /** Cancel handler */
    onCancel?: () => void;
    /** Is form submitting */
    isLoading?: boolean;
    /** Error message to display */
    error?: string;
    /** Success message */
    success?: string;
}

/**
 * PasswordChangeForm component
 * @description A form for changing user password
 * @param props - PasswordChangeForm properties
 * @returns PasswordChangeForm element
 * @example
 * <PasswordChangeForm
 *   onSubmit={handleChangePassword}
 *   onCancel={() => navigate(-1)}
 *   isLoading={isLoading}
 * />
 */
export function PasswordChangeForm({
    onSubmit,
    onCancel,
    isLoading = false,
    error,
    success,
}: PasswordChangeFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PasswordChangeFormData>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const handleFormSubmit = async (data: PasswordChangeFormData) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Form onSubmit={handleSubmit(handleFormSubmit)} className="password-change-form">
            {error && (
                <div className="password-change-form__error" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div className="password-change-form__success" role="status">
                    {success}
                </div>
            )}

            <FormField
                label="סיסמה נוכחית"
                type="password"
                autoComplete="current-password"
                error={errors.currentPassword?.message}
                isRequired
                {...register('currentPassword')}
            />

            <FormField
                label="סיסמה חדשה"
                type="password"
                autoComplete="new-password"
                error={errors.newPassword?.message}
                isRequired
                helperText="לפחות 8 תווים, אות גדולה, אות קטנה ומספר"
                {...register('newPassword')}
            />

            <FormField
                label="אימות סיסמה חדשה"
                type="password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                isRequired
                {...register('confirmPassword')}
            />

            <FormActions align="end">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        ביטול
                    </Button>
                )}
                <FormSubmitButton isSubmitting={isLoading} variant="primary">
                    שנה סיסמה
                </FormSubmitButton>
            </FormActions>
        </Form>
    );
}

export type { PasswordChangeFormProps, PasswordChangeFormData };
