import { httpClient } from './http';
import {
    LoginRequestDto,
    LoginResponseDto,
    RefreshTokenRequestDto,
    RefreshTokenResponseDto,
    ChangePasswordRequestDto,
    LogoutRequestDto,
    MeResponseDto
} from '@shared/types';

export const authApi = {
    login: async (data: LoginRequestDto): Promise<LoginResponseDto['data']> => {
        const response = await httpClient.post<LoginResponseDto>('/auth/login', data);
        return response.data.data;
    },

    refreshToken: async (data: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto['data']> => {
        const response = await httpClient.post<RefreshTokenResponseDto>('/auth/refresh', data);
        return response.data.data;
    },

    logout: async (data: LogoutRequestDto): Promise<void> => {
        await httpClient.post('/auth/logout', data);
    },

    changePassword: async (data: ChangePasswordRequestDto): Promise<void> => {
        await httpClient.post('/auth/change-password', data);
    },

    getMe: async (): Promise<MeResponseDto['data']> => {
        const response = await httpClient.get<MeResponseDto>('/auth/me');
        return response.data.data;
    }
};
