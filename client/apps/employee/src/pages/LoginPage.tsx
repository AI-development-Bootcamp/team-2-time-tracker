import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@client/ui';
import { useAuthStore } from '../app/stores/auth.store';
import logoImage from '../assets/logo.png';
import welcomeImage from '../assets/Welcome_app.png';
import backgroundImage from '../assets/employee-bg.png';
import './LoginPage.css';

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
        if (isAuthenticated && !hasRedirectedRef.current && !isLoading) {
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
            console.log('[LoginPage] Submitting login...');
            await login(data);
            console.log('[LoginPage] Login successful, auth state:', { isAuthenticated, isLoading });
            // Navigation handled by effect
        } catch (err) {
            console.error('[LoginPage] Login failed:', err);
            // Error set in store
        }
    };

    return (
        <div className="login-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="login-card">
                <img src={logoImage} alt="abra" className="login-logo" />

                <img src={welcomeImage} alt="Welcome" className="login-welcome-image" />

                <h1 className="login-title">ברוכים הבאים!</h1>

                <p className="login-description">
                    ברוכים הבאים למערכת דיווחי השעות שלנו 🎉
                    <br />
                    שנוצרה במיוחד עבורכם!
                </p>

                <LoginForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    error={error || undefined}
                />
            </div>
        </div>
    );
}
