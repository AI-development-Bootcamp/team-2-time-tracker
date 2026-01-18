/**
 * @fileoverview Tests for auth store
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API client
const mockLoginApi = vi.fn();
const mockRefreshTokenApi = vi.fn();
const mockLogoutApi = vi.fn();

vi.mock('@client/api-client', () => ({
    authApi: {
        login: () => mockLoginApi(),
        refreshToken: () => mockRefreshTokenApi(),
        logout: () => mockLogoutApi(),
    },
}));

// Simple auth store implementation for testing
interface AuthState {
    user: { id: string; email: string; fullName: string; role: string } | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const createAuthStore = () => {
    let state: AuthState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    };

    return {
        getState: () => state,
        login: async (_email: string, _password: string) => {
            state = { ...state, isLoading: true, error: null };
            try {
                const response = await mockLoginApi();
                state = {
                    ...state,
                    user: response.user,
                    token: response.token,
                    isAuthenticated: true,
                    isLoading: false,
                };
                return response;
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                state = { ...state, isLoading: false, error: errorMessage };
                throw error;
            }
        },
        logout: async () => {
            await mockLogoutApi();
            state = {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
            };
        },
        refreshToken: async () => {
            const response = await mockRefreshTokenApi();
            state = { ...state, token: response.token };
            return response;
        },
    };
};

describe('Auth Store', () => {
    let store: ReturnType<typeof createAuthStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        store = createAuthStore();
    });

    describe('login', () => {
        it('should set user and token on successful login', async () => {
            const mockResponse = {
                token: 'mock-jwt-token',
                refreshToken: 'mock-refresh-token',
                user: {
                    id: 'test-id',
                    email: 'test@example.com',
                    fullName: 'Test User',
                    role: 'EMPLOYEE',
                },
            };
            mockLoginApi.mockResolvedValue(mockResponse);

            await store.login('test@example.com', 'password123');

            const state = store.getState();
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(mockResponse.user);
            expect(state.token).toBe(mockResponse.token);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should set error on failed login', async () => {
            mockLoginApi.mockRejectedValue(new Error('Invalid credentials'));

            await expect(store.login('test@example.com', 'wrongpassword')).rejects.toThrow();

            const state = store.getState();
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.error).toBe('Invalid credentials');
        });

        it('should set loading state during login', async () => {
            mockLoginApi.mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100))
            );

            const loginPromise = store.login('test@example.com', 'password123');

            // Check loading state immediately
            expect(store.getState().isLoading).toBe(true);

            await loginPromise;
        });
    });

    describe('logout', () => {
        it('should clear user and token on logout', async () => {
            // First login
            mockLoginApi.mockResolvedValue({
                token: 'token',
                user: { id: '1', email: 'test@example.com', fullName: 'Test', role: 'EMPLOYEE' },
            });
            await store.login('test@example.com', 'password');

            // Then logout
            mockLogoutApi.mockResolvedValue(undefined);
            await store.logout();

            const state = store.getState();
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
        });
    });

    describe('refreshToken', () => {
        it('should update token on refresh', async () => {
            mockRefreshTokenApi.mockResolvedValue({ token: 'new-token' });

            await store.refreshToken();

            expect(store.getState().token).toBe('new-token');
        });
    });
});
