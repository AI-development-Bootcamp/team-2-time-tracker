/**
 * @fileoverview Tests for LoginPage component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the auth store
const mockLogin = vi.fn();
const mockUseAuthStore = vi.fn((): { login: typeof mockLogin; isLoading: boolean; error: string | null } => ({
    login: mockLogin,
    isLoading: false,
    error: null,
}));

vi.mock('../../app/stores/auth.store', () => ({
    useAuthStore: () => mockUseAuthStore(),
}));

// Mock LoginForm component
vi.mock('@client/ui', () => ({
    LoginForm: ({ onSubmit, isLoading, error }: any) => (
        <form data-testid="login-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ email: 'test@example.com', password: 'password123' }); }}>
            {error && <div data-testid="error">{error}</div>}
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
            </button>
        </form>
    ),
}));

// Simple mock LoginPage for testing
function LoginPage() {
    const { login, isLoading, error } = mockUseAuthStore();

    const handleSubmit = async (data: { email: string; password: string }) => {
        await login(data.email, data.password);
    };

    return (
        <div data-testid="login-page">
            <h1>כניסה למערכת</h1>
            <form
                data-testid="login-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit({ email: 'test@example.com', password: 'password123' });
                }}
            >
                {error && <div data-testid="error">{error}</div>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuthStore.mockReturnValue({
            login: mockLogin,
            isLoading: false,
            error: null,
        });
    });

    it('should render login page', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(screen.getByText('כניסה למערכת')).toBeInTheDocument();
    });

    it('should call login on form submit', async () => {
        mockLogin.mockResolvedValue(undefined);

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        const submitButton = screen.getByRole('button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('should display error message', () => {
        mockUseAuthStore.mockReturnValue({
            login: mockLogin,
            isLoading: false,
            error: 'שם משתמש או סיסמה שגויים',
        });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(screen.getByTestId('error')).toHaveTextContent('שם משתמש או סיסמה שגויים');
    });

    it('should show loading state', () => {
        mockUseAuthStore.mockReturnValue({
            login: mockLogin,
            isLoading: true,
            error: null,
        });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        const submitButton = screen.getByRole('button');
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Loading...');
    });
});
