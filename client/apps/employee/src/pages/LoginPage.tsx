import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@client/ui';
import { useAuthStore } from '../app/stores/auth.store';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, isLoading, error, checkAuth } = useAuthStore();
    const hasRedirectedRef = useRef(false);
    const hasCheckedAuthRef = useRef(false);

    // Verify auth state on mount to handle expired tokens from persisted state
    useEffect(() => {
        if (!hasCheckedAuthRef.current) {
            hasCheckedAuthRef.current = true;
            checkAuth();
        }
    }, [checkAuth]);

    useEffect(() => {
        // Only redirect if authenticated and we haven't already redirected
        // This prevents redirect loops when checkAuth() clears auth state
        // Also wait for auth check to complete (not loading) before redirecting
        if (isAuthenticated && !hasRedirectedRef.current && !isLoading && hasCheckedAuthRef.current) {
            hasRedirectedRef.current = true;
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } else if (!isAuthenticated) {
            // Reset redirect flag when not authenticated (e.g., after logout or failed checkAuth)
            hasRedirectedRef.current = false;
        }
    }, [isAuthenticated, isLoading, navigate, location.state?.from?.pathname]);

    const handleSubmit = async (data: { email: string; password: string; rememberMe?: boolean }) => {
        try {
            await login(data);
            // Navigation handled by effect
        } catch (err) {
            // Error set in store
        }
    };

    return (
        <div className="flex h-full items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        כניסה למערכת
                    </h2>
                </div>

                <div className="bg-white p-8 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    <LoginForm
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        error={error || undefined}
                    />
                </div>
            </div>
        </div>
    );
}
