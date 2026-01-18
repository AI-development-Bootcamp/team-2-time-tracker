/**
 * @fileoverview Admin authentication store using Zustand
 * @module stores/authStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '@shared/types';
import { adminAuthApi } from '../api/adminAuthApi';

interface AuthState {
    user: UserDto | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

/**
 * @description Zustand store for admin authentication state management
 * Persists auth state to localStorage
 */
export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            /**
             * @description Authenticates admin user with email and password
             * @param {string} email - User's email
             * @param {string} password - User's password
             * @param {boolean} [rememberMe=false] - Extend session duration
             */
            login: async (email: string, password: string, rememberMe = false) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await adminAuthApi.login({ email, password, rememberMe });

                    // Store tokens in localStorage for httpClient interceptor
                    localStorage.setItem('accessToken', response.token);
                    localStorage.setItem('refreshToken', response.refreshToken);

                    set({
                        user: response.user,
                        accessToken: response.token,
                        refreshToken: response.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Login failed';
                    set({
                        isLoading: false,
                        error: errorMessage,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            /**
             * @description Logs out the current admin user
             */
            logout: async () => {
                const { refreshToken } = get();

                try {
                    if (refreshToken) {
                        await adminAuthApi.logout({ refreshToken });
                    }
                } catch {
                    // Ignore logout API errors, proceed with local cleanup
                } finally {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    set(initialState);
                }
            },

            /**
             * @description Checks if the current session is valid
             */
            checkAuth: async () => {
                const { accessToken } = get();

                if (!accessToken) {
                    set({ isAuthenticated: false });
                    return;
                }

                set({ isLoading: true });

                try {
                    const user = await adminAuthApi.getMe();
                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    set({
                        ...initialState,
                        isLoading: false,
                    });
                }
            },

            /**
             * @description Clears the current error message
             */
            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'admin-auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
