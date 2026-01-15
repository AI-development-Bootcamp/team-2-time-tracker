import { UserRole } from '../enums/roles.enum';

export interface LoginRequestDto {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface UserDto {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
}

export interface LoginResponseDto {
    success: boolean;
    data: {
        token: string;
        refreshToken: string;
        expiresIn: number;
        user: UserDto;
        mustChangePassword: boolean;
    };
}

export interface RefreshTokenRequestDto {
    refreshToken: string;
}

export interface RefreshTokenResponseDto {
    success: boolean;
    data: {
        token: string;
        expiresIn: number;
    };
}

export interface ChangePasswordRequestDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface MeUserDto extends UserDto {
    isActive: boolean;
}

export interface MeResponseDto {
    success: boolean;
    data: MeUserDto;
}

export interface LogoutRequestDto {
    refreshToken: string;
}
