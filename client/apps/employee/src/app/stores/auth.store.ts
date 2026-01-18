import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authApi } from '@client/api-client';
import { UserDto, LoginRequestDto, ChangePasswordRequestDto } from '@shared/types';

interface AuthState {
    user: UserDto | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    mustChangePassword: boolean;

    login: (data: LoginRequestDto) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (data: ChangePasswordRequestDto) => Promise<void>;
    checkAuth: () => Promise<void>;
    setTokens: (token: string, refreshToken: string) => void;
    clearError: () => void;
}

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
                    if (!token) {
                        set({ isAuthenticated: false, user: null, isLoading: false });
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

// Subscribe store to interceptor updates if needed, though localstorage sync is handled
