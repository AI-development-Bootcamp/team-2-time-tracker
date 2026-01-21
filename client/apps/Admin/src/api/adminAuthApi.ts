/**
 * @fileoverview Admin authentication API client
 * @module api/adminAuthApi
 */

import { httpClient } from '@client/api-client';
import type {
    LoginRequestDto,
    LoginResponseDto,
    RefreshTokenRequestDto,
    RefreshTokenResponseDto,
    MeResponseDto,
    LogoutRequestDto,
} from '@shared/types';

/**
 * @description Admin authentication API endpoints
 */
export const adminAuthApi = {
    /**
     * @description Authenticates an admin user
     * @param {LoginRequestDto} data - Login credentials
     * @returns {Promise<LoginResponseDto['data']>} Login response with tokens and user info
     */
    login: async (data: LoginRequestDto): Promise<LoginResponseDto['data']> => {
        const response = await httpClient.post<LoginResponseDto>('/admin/auth/login', data);
        return response.data.data;
    },

    /**
     * @description Refreshes the access token
     * @param {RefreshTokenRequestDto} data - Refresh token
     * @returns {Promise<RefreshTokenResponseDto['data']>} New access token
     */
    refreshToken: async (data: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto['data']> => {
        const response = await httpClient.post<RefreshTokenResponseDto>('/admin/auth/refresh', data);
        return response.data.data;
    },

    /**
     * @description Gets the current admin user's profile
     * @returns {Promise<MeResponseDto['data']>} User profile data
     */
    getMe: async (): Promise<MeResponseDto['data']> => {
        const response = await httpClient.get<MeResponseDto>('/admin/auth/me');
        return response.data.data;
    },

    /**
     * @description Logs out the admin user
     * @param {LogoutRequestDto} data - Refresh token to revoke
     * @returns {Promise<void>}
     */
    logout: async (data: LogoutRequestDto): Promise<void> => {
        await httpClient.post('/admin/auth/logout', data);
    },
};
