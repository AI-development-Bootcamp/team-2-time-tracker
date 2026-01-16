/**
 * @fileoverview Form components integration with react-hook-form + Zod
 * @module ui/Form
 */

import React from 'react';
import { Input, InputProps } from '../Input/Input';
import { Button, ButtonProps } from '../Button/Button';
import './Form.css';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    /** Form submit handler */
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    /** Form content */
    children: React.ReactNode;
}

/**
 * Form component
 * @description A wrapper form component
 * @example
 * <Form onSubmit={handleSubmit(onSubmit)}>
 *   <FormField label="Email" {...register('email')} />
 *   <FormActions>
 *     <Button type="submit">Submit</Button>
 *   </FormActions>
 * </Form>
 */
export function Form({ onSubmit, children, className = '', ...props }: FormProps) {
    return (
        <form
            className={`form ${className}`}
            onSubmit={onSubmit}
            noValidate
            {...props}
        >
            {children}
        </form>
    );
}

interface FormFieldProps extends InputProps {
    /** Field name for react-hook-form */
    name: string;
}

/**
 * FormField component
 * @description A form field wrapper around Input
 */
export function FormField({ className = '', ...props }: FormFieldProps) {
    return <Input className={`form__field ${className}`} fullWidth {...props} />;
}

interface FormActionsProps {
    /** Actions alignment */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /** Actions content */
    children: React.ReactNode;
}

/**
 * FormActions component
 * @description A container for form action buttons
 */
export function FormActions({ align = 'end', children }: FormActionsProps) {
    return (
        <div className={`form__actions form__actions--${align}`}>
            {children}
        </div>
    );
}

interface FormSubmitButtonProps extends Omit<ButtonProps, 'type'> {
    /** Is form submitting */
    isSubmitting?: boolean;
}

/**
 * FormSubmitButton component
 * @description A submit button with loading state
 */
export function FormSubmitButton({
    isSubmitting = false,
    children,
    ...props
}: FormSubmitButtonProps) {
    return (
        <Button type="submit" isLoading={isSubmitting} {...props}>
            {children}
        </Button>
    );
}

export { Input as FormInput };
