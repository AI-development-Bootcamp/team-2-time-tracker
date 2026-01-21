/**
 * @fileoverview Admin users API client
 * @module api/usersApi
 */

import { httpClient } from '@client/api-client';
import type {
    AdminCreateUserRequestDto,
    AdminUserResponseDto,
    ListUsersResponseDto,
    AdminUpdateUserRequestDto,
    AdminUpdateUserStatusRequestDto,
    AdminResetPasswordRequestDto,
} from '@shared/types';

/**
 * @description Admin users API endpoints
 */
export const usersApi = {
    /**
     * @description Creates a new user
     * @param {AdminCreateUserRequestDto} data - User creation data
     * @returns {Promise<AdminUserResponseDto['data']>} Created user data
     */
    createUser: async (data: AdminCreateUserRequestDto): Promise<AdminUserResponseDto['data']> => {
        const response = await httpClient.post<AdminUserResponseDto>('/admin/users', data);
        return response.data.data;
    },

    /**
     * @description Gets list of all users with pagination
     * @param {Object} params - Query parameters
     * @param {number} [params.page=1] - Page number
     * @param {number} [params.pageSize=10] - Items per page
     * @returns {Promise<ListUsersResponseDto['data']>} Paginated users list
     */
    getUsers: async (params?: { page?: number; pageSize?: number }): Promise<ListUsersResponseDto['data']> => {
        const response = await httpClient.get<ListUsersResponseDto>('/admin/users', { params });
        return response.data.data;
    },

    /**
     * @description Gets a single user by ID
     * @param {string} userId - User ID
     * @returns {Promise<AdminUserResponseDto['data']>} User data
     */
    getUserById: async (userId: string): Promise<AdminUserResponseDto['data']> => {
        const response = await httpClient.get<AdminUserResponseDto>(`/admin/users/${userId}`);
        return response.data.data;
    },

    /**
     * @description Updates user details
     * @param {string} userId - User ID
     * @param {AdminUpdateUserRequestDto} data - Updated user data
     * @returns {Promise<AdminUserResponseDto['data']>} Updated user data
     */
    updateUser: async (
        userId: string,
        data: AdminUpdateUserRequestDto
    ): Promise<AdminUserResponseDto['data']> => {
        const response = await httpClient.patch<AdminUserResponseDto>(`/admin/users/${userId}`, data);
        return response.data.data;
    },

    /**
     * @description Updates user status (activate/deactivate)
     * @param {string} userId - User ID
     * @param {AdminUpdateUserStatusRequestDto} data - Status update data
     * @returns {Promise<AdminUserResponseDto['data']>} Updated user data
     */
    updateUserStatus: async (
        userId: string,
        data: AdminUpdateUserStatusRequestDto
    ): Promise<AdminUserResponseDto['data']> => {
        const response = await httpClient.patch<AdminUserResponseDto>(`/admin/users/${userId}/status`, data);
        return response.data.data;
    },

    /**
     * @description Resets user password
     * @param {string} userId - User ID
     * @param {AdminResetPasswordRequestDto} data - New password data
     * @returns {Promise<AdminUserResponseDto['data']>} Updated user data
     */
    resetPassword: async (
        userId: string,
        data: AdminResetPasswordRequestDto
    ): Promise<AdminUserResponseDto['data']> => {
        const response = await httpClient.patch<AdminUserResponseDto>(
            `/admin/users/${userId}/reset-password`,
            data
        );
        return response.data.data;
    },
};
