/**
 * @fileoverview Zustand store for authentication state management
 * @module stores/auth.store
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authApi } from '@client/api-client';
import { UserDto, LoginRequestDto, ChangePasswordRequestDto } from '@shared/types';

/**
 * Authentication store state interface
 * @description Manages user authentication state, tokens, and auth-related operations
 */
interface AuthState {
    /** Currently authenticated user data */
    user: UserDto | null;
    /** JWT access token */
    token: string | null;
    /** JWT refresh token for obtaining new access tokens */
    refreshToken: string | null;
    /** Whether user is currently authenticated */
    isAuthenticated: boolean;
    /** Loading state for async auth operations */
    isLoading: boolean;
    /** Error message from auth operations */
    error: string | null;
    /** Whether user must change password on next login */
    mustChangePassword: boolean;

    /**
     * Authenticate user with email and password
     * @param {LoginRequestDto} data - Login credentials
     * @returns {Promise<void>}
     * @throws {Error} When login fails
     */
    login: (data: LoginRequestDto) => Promise<void>;

    /**
     * Log out current user and clear session
     * @returns {Promise<void>}
     */
    logout: () => Promise<void>;

    /**
     * Change user password
     * @param {ChangePasswordRequestDto} data - Old and new password
     * @returns {Promise<void>}
     * @throws {Error} When password change fails
     */
    changePassword: (data: ChangePasswordRequestDto) => Promise<void>;

    /**
     * Verify authentication status and fetch user data
     * @description Checks if stored token is valid and fetches current user
     * @returns {Promise<void>}
     */
    checkAuth: () => Promise<void>;

    /**
     * Set authentication tokens
     * @param {string} token - Access token
     * @param {string} refreshToken - Refresh token
     */
    setTokens: (token: string, refreshToken: string) => void;

    /**
     * Clear error message
     */
    clearError: () => void;
}

/**
 * Zustand store for authentication management
 * @description Manages user authentication state with persistence and devtools integration.
 * Handles login, logout, password changes, and auth verification.
 * @example
 * ```tsx
 * const { user, login, logout, isAuthenticated } = useAuthStore();
 * 
 * // Login
 * await login({ email: 'user@example.com', password: 'password' });
 * 
 * // Logout
 * await logout();
 * ```
 */
export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                mustChangePassword: false,

                setTokens: (token, refreshToken) => {
                    localStorage.setItem('accessToken', token);
                    localStorage.setItem('refreshToken', refreshToken);
                    set({ token, refreshToken, isAuthenticated: true });
                },

                login: async (data: LoginRequestDto) => {
                    set({ isLoading: true, error: null });
                    try {
                        const response = await authApi.login(data);

                        localStorage.setItem('accessToken', response.token);
                        localStorage.setItem('refreshToken', response.refreshToken);

                        set({
                            user: response.user,
                            token: response.token,
                            refreshToken: response.refreshToken,
                            isAuthenticated: true,
                            mustChangePassword: response.mustChangePassword,
                            isLoading: false,
                        });
                    } catch (error: any) {
                        set({
                            error: error.response?.data?.error || 'Login failed',
                            isLoading: false,
                            isAuthenticated: false,
                        });
                        throw error;
                    }
                },

                logout: async () => {
                    set({ isLoading: true });
                    try {
                        const { refreshToken } = get();
                        if (refreshToken) {
                            await authApi.logout({ refreshToken });
                        }
                    } catch (error) {
                        console.error('Logout failed:', error);
                    } finally {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        set({
                            user: null,
                            token: null,
                            refreshToken: null,
                            isAuthenticated: false,
                            isLoading: false,
                            mustChangePassword: false,
                        });
                    }
                },

                changePassword: async (data: ChangePasswordRequestDto) => {
                    set({ isLoading: true, error: null });
                    try {
                        await authApi.changePassword(data);
                        set({ mustChangePassword: false, isLoading: false });
                    } catch (error: any) {
                        set({
                            error: error.response?.data?.error || 'Password change failed',
                            isLoading: false,
                        });
                        throw error;
                    }
                },

                checkAuth: async () => {
                    const token = localStorage.getItem('accessToken');
                    const refreshToken = localStorage.getItem('refreshToken');

                    if (!token || !refreshToken) {
                        // Clear any partial state
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        set({ isAuthenticated: false, user: null, token: null, refreshToken: null, isLoading: false });
                        return;
                    }

                    // Set loading state to prevent race conditions during auth check
                    set({ isLoading: true });

                    try {
                        const user = await authApi.getMe();
                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            // Ensure tokens are synced if they were set externally or by interceptor
                            token: localStorage.getItem('accessToken'),
                            refreshToken: localStorage.getItem('refreshToken')
                        });
                    } catch (error) {
                        console.error('Auth check failed:', error);
                        // If checkAuth fails (e.g. 401 even after retry), clear session
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        set({
                            isAuthenticated: false,
                            user: null,
                            token: null,
                            refreshToken: null,
                            isLoading: false
                        });
                    }
                },

                clearError: () => set({ error: null }),
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({
                    token: state.token,
                    refreshToken: state.refreshToken,
                    isAuthenticated: state.isAuthenticated,
                    user: state.user,
                }),
            }
        )
    )
);

/**
 * @description Store subscribes to localStorage for token synchronization.
 * Tokens are persisted across sessions and automatically restored on app load.
 */
