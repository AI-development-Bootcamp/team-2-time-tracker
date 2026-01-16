import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@client/ui';
import { useAuthStore } from '../app/stores/auth.store';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, isLoading, error } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleSubmit = async (data: { email: string; password: string; rememberMe?: boolean }) => {
        try {
            await login(data);
            // Navigation handled by effect
        } catch (err) {
            // Error set in store
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
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
