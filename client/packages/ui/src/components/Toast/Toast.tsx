/**
 * @fileoverview Toast/Notification component using Radix Toast
 * @module ui/Toast
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import './Toast.css';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
    id: string;
    title: string;
    description?: string;
    variant: ToastVariant;
}

interface ToastContextValue {
    toast: (message: Omit<ToastMessage, 'id'>) => void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Toast Provider component
 * @description Provides toast context and renders toast viewport
 * @example
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...message, id }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value: ToastContextValue = {
        toast: addToast,
        success: (title, description) => addToast({ title, description, variant: 'success' }),
        error: (title, description) => addToast({ title, description, variant: 'error' }),
        warning: (title, description) => addToast({ title, description, variant: 'warning' }),
        info: (title, description) => addToast({ title, description, variant: 'info' }),
    };

    return (
        <ToastContext.Provider value={value}>
            <ToastPrimitive.Provider swipeDirection="left">
                {children}
                {toasts.map((toast) => (
                    <ToastPrimitive.Root
                        key={toast.id}
                        className={`toast toast--${toast.variant}`}
                        onOpenChange={(open) => !open && removeToast(toast.id)}
                    >
                        <ToastPrimitive.Title className="toast__title">
                            {toast.title}
                        </ToastPrimitive.Title>
                        {toast.description && (
                            <ToastPrimitive.Description className="toast__description">
                                {toast.description}
                            </ToastPrimitive.Description>
                        )}
                        <ToastPrimitive.Close className="toast__close" aria-label="Close">
                            ×
                        </ToastPrimitive.Close>
                    </ToastPrimitive.Root>
                ))}
                <ToastPrimitive.Viewport className="toast__viewport" />
            </ToastPrimitive.Provider>
        </ToastContext.Provider>
    );
}

/**
 * useToast hook
 * @description Hook to access toast functions
 * @returns Toast context value
 * @example
 * const toast = useToast();
 * toast.success('Saved!');
 */
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
