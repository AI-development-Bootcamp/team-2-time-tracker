/**
 * @fileoverview Admin login page component
 * @module pages/LoginPage
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import loginBackground from '../assets/images/login-background.png';
import './LoginPage.css';

/**
 * @description Admin login page with full-page background image and centered login form
 * @returns Login page component
 */
function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    /**
     * @description Handles form submission for login
     * @param {FormEvent} e - Form event
     */
    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault();
        clearError();

        try {
            await login(email, password, rememberMe);
            navigate('/');
        } catch {
            // Error is handled by the store
        }
    }

    return (
        <div className="login-page">
            <div
                className="login-page__background"
                style={{ backgroundImage: `url(${loginBackground})` }}
            />
            <div className="login-page__overlay" />

            <div className="login-page__container">
                <div className="login-card">
                    <div className="login-card__header">
                        <h1 className="login-card__title">פורטל ניהול</h1>
                        <p className="login-card__subtitle">מערכת דיווח שעות</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="login-form__error">
                                {error}
                            </div>
                        )}

                        <div className="login-form__field">
                            <label htmlFor="email" className="login-form__label">
                                אימייל
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="login-form__input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                autoComplete="email"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="login-form__field">
                            <label htmlFor="password" className="login-form__label">
                                סיסמה
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="login-form__input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="הזן את הסיסמה שלך"
                                required
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="login-form__options">
                            <label className="login-form__checkbox-label">
                                <input
                                    type="checkbox"
                                    className="login-form__checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                />
                                <span>זכור אותי</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="login-form__submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'מתחבר...' : 'התחברות'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
