/**
 * @fileoverview Sheet/Modal component for mobile-first design
 * @module ui/Sheet
 */

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import './Sheet.css';

interface SheetProps {
    /** Sheet open state */
    open: boolean;
    /** Callback when open state changes */
    onOpenChange: (open: boolean) => void;
    /** Sheet title */
    title: string;
    /** Sheet subtitle (optional) */
    subtitle?: string;
    /** Sheet content */
    children: React.ReactNode;
    /** Show close button */
    showClose?: boolean;
    /** Show navigation arrows */
    showNavigation?: boolean;
    /** Callback for previous navigation */
    onPrevious?: () => void;
    /** Callback for next navigation */
    onNext?: () => void;
    /** Custom class name */
    className?: string;
}

/**
 * Sheet component
 * @description A mobile-optimized modal/sheet component
 * @param props - Sheet properties
 * @returns Sheet element
 * @example
 * <Sheet
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="דיווח העדרות"
 *   subtitle="יום בודד"
 * >
 *   <form>...</form>
 * </Sheet>
 */
export function Sheet({
    open,
    onOpenChange,
    title,
    subtitle,
    children,
    showClose = true,
    showNavigation = false,
    onPrevious,
    onNext,
    className = '',
}: SheetProps) {
    const classNames = ['sheet', className].filter(Boolean).join(' ');

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="sheet__overlay" />
                <DialogPrimitive.Content className={classNames}>
                    <div className="sheet__header">
                        {showClose && (
                            <DialogPrimitive.Close className="sheet__close" aria-label="סגור">
                                <CloseIcon />
                            </DialogPrimitive.Close>
                        )}
                        <div className="sheet__titles">
                            <DialogPrimitive.Title className="sheet__title">
                                {title}
                            </DialogPrimitive.Title>
                            {subtitle && (
                                <span className="sheet__subtitle">{subtitle}</span>
                            )}
                        </div>
                        {showNavigation && (
                            <div className="sheet__navigation">
                                <button
                                    type="button"
                                    className="sheet__nav-button"
                                    onClick={onPrevious}
                                    aria-label="הקודם"
                                >
                                    <ChevronRightIcon />
                                </button>
                                <button
                                    type="button"
                                    className="sheet__nav-button"
                                    onClick={onNext}
                                    aria-label="הבא"
                                >
                                    <ChevronLeftIcon />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="sheet__body">{children}</div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

/** Sheet header component for custom layouts */
interface SheetHeaderProps {
    /** Header title */
    title: string;
    /** Header subtitle */
    subtitle?: string;
    /** Show close button */
    showClose?: boolean;
    /** Close callback */
    onClose?: () => void;
    /** Show navigation arrows */
    showNavigation?: boolean;
    /** Previous navigation callback */
    onPrevious?: () => void;
    /** Next navigation callback */
    onNext?: () => void;
}

export function SheetHeader({
    title,
    subtitle,
    showClose = true,
    onClose,
    showNavigation = false,
    onPrevious,
    onNext,
}: SheetHeaderProps) {
    return (
        <div className="sheet__header sheet__header--standalone">
            {showClose && (
                <button
                    type="button"
                    className="sheet__close"
                    onClick={onClose}
                    aria-label="סגור"
                >
                    <CloseIcon />
                </button>
            )}
            <div className="sheet__titles">
                <h2 className="sheet__title">{title}</h2>
                {subtitle && <span className="sheet__subtitle">{subtitle}</span>}
            </div>
            {showNavigation && (
                <div className="sheet__navigation">
                    {onPrevious && (
                        <button
                            type="button"
                            className="sheet__nav-button"
                            onClick={onPrevious}
                            aria-label="הקודם"
                        >
                            <ChevronLeftIcon />
                        </button>
                    )}
                    {onNext && (
                        <button
                            type="button"
                            className="sheet__nav-button"
                            onClick={onNext}
                            aria-label="הבא"
                        >
                            <ChevronRightIcon />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function CloseIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ChevronLeftIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export type { SheetProps, SheetHeaderProps };
