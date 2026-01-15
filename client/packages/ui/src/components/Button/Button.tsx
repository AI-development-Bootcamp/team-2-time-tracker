/**
 * @fileoverview Button component with Radix primitives
 * @module ui/Button
 */

import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button visual variant */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Show loading state */
    isLoading?: boolean;
    /** Full width button */
    fullWidth?: boolean;
    /** Button content */
    children: React.ReactNode;
}

/**
 * Button component
 * @description A reusable button component with multiple variants and sizes
 * @param props - Button properties
 * @returns Button element
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...props
}: ButtonProps) {
    const classNames = [
        'button',
        `button--${variant}`,
        `button--${size}`,
        fullWidth && 'button--full-width',
        isLoading && 'button--loading',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            className={classNames}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="button__spinner" aria-hidden="true" />
            ) : null}
            <span className={isLoading ? 'button__content--hidden' : ''}>
                {children}
            </span>
        </button>
    );
}

export type { ButtonProps };
