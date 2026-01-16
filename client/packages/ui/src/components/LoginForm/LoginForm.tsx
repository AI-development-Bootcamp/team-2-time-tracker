/**
 * @fileoverview LoginForm component for authentication
 * @module ui/LoginForm
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormActions, FormSubmitButton } from '../Form/Form';
import './LoginForm.css';

const loginSchema = z.object({
    email: z.string().email('אימייל לא תקין'),
    password: z.string().min(1, 'נדרשת סיסמה'),
    rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
    /** Form submit handler */
    onSubmit: (data: LoginFormData) => Promise<void> | void;
    /** Is form submitting */
    isLoading?: boolean;
    /** Error message to display */
    error?: string;
}

/**
 * LoginForm component
 * @description A login form with email, password, and remember me fields
 * @param props - LoginForm properties
 * @returns LoginForm element
 * @example
 * <LoginForm
 *   onSubmit={handleLogin}
 *   isLoading={isLoading}
 *   error={loginError}
 * />
 */
export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    return (
        <Form onSubmit={handleSubmit(onSubmit)} className="login-form">
            {error && (
                <div className="login-form__error" role="alert">
                    {error}
                </div>
            )}

            <FormField
                label="אימייל"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                isRequired
                {...register('email')}
            />

            <FormField
                label="סיסמה"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                isRequired
                {...register('password')}
            />

            <label className="login-form__remember">
                <input type="checkbox" {...register('rememberMe')} />
                <span>זכור אותי</span>
            </label>

            <FormActions align="stretch">
                <FormSubmitButton isSubmitting={isLoading} variant="primary" size="lg">
                    התחברות
                </FormSubmitButton>
            </FormActions>
        </Form>
    );
}

export type { LoginFormProps, LoginFormData };
