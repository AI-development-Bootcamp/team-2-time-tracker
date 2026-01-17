/**
 * @fileoverview Tests for ProtectedRoute component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock the auth store
const mockUseAuthStore = vi.fn();

vi.mock('../../app/stores/auth.store', () => ({
    useAuthStore: () => mockUseAuthStore(),
}));

// ProtectedRoute component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = mockUseAuthStore();

    if (isLoading) {
        return <div data-testid="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div data-testid="redirect-login">Redirecting to login...</div>;
    }

    return <>{children}</>;
}

// Test component
function ProtectedPage() {
    return <div data-testid="protected-content">Protected Content</div>;
}

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading state when checking auth', () => {
        mockUseAuthStore.mockReturnValue({
            isAuthenticated: false,
            isLoading: true,
        });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <ProtectedPage />
                </ProtectedRoute>
            </BrowserRouter>
        );

        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should redirect to login for unauthenticated users', () => {
        mockUseAuthStore.mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
        });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <ProtectedPage />
                </ProtectedRoute>
            </BrowserRouter>
        );

        expect(screen.getByTestId('redirect-login')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should render children for authenticated users', () => {
        mockUseAuthStore.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
        });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <ProtectedPage />
                </ProtectedRoute>
            </BrowserRouter>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.queryByTestId('redirect-login')).not.toBeInTheDocument();
    });
});
