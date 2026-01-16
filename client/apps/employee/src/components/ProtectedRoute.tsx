import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../app/stores/auth.store';
import { useEffect } from 'react';

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading, checkAuth, mustChangePassword } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Force password change if required, but allow access to the change-password page itself
    if (mustChangePassword && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    return <Outlet />;
}
