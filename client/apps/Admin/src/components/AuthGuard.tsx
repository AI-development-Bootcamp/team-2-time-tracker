/**
 * @fileoverview Auth guard component to protect admin routes
 * @module components/AuthGuard
 */

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * @description Protects routes by checking authentication status.
 * Redirects unauthenticated users to the login page.
 * @param {AuthGuardProps} props - Component props
 * @param {React.ReactNode} props.children - Protected content to render
 * @returns {React.JSX.Element} Protected content or redirect
 */
function AuthGuard({ children }: AuthGuardProps): React.JSX.Element {
    const location = useLocation();
    const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return (
            <div className="auth-guard__loading">
                <div className="auth-guard__spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

export default AuthGuard;
