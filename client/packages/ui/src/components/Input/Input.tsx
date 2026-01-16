/**
 * @fileoverview Input component with RTL support
 * @module ui/Input
 */

import React, { forwardRef } from 'react';
import * as Label from '@radix-ui/react-label';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Input label */
    label?: string;
    /** Error message */
    error?: string;
    /** Helper text */
    helperText?: string;
    /** Is the field required */
    isRequired?: boolean;
    /** Full width input */
    fullWidth?: boolean;
}

/**
 * Input component
 * @description A reusable input component with label, error, and RTL support
 * @param props - Input properties
 * @returns Input element
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   error={errors.email?.message}
 *   {...register('email')}
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            isRequired = false,
            fullWidth = false,
            id,
            className = '',
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
        const hasError = Boolean(error);

        const containerClasses = [
            'input-field',
            fullWidth && 'input-field--full-width',
            hasError && 'input-field--error',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div className={containerClasses}>
                {label && (
                    <Label.Root className="input-field__label" htmlFor={inputId}>
                        {label}
                        {isRequired && <span className="input-field__required">*</span>}
                    </Label.Root>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className="input-field__input"
                    aria-invalid={hasError}
                    aria-describedby={
                        error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
                    }
                    {...props}
                />
                {error && (
                    <span id={`${inputId}-error`} className="input-field__error" role="alert">
                        {error}
                    </span>
                )}
                {helperText && !error && (
                    <span id={`${inputId}-helper`} className="input-field__helper">
                        {helperText}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export type { InputProps };
