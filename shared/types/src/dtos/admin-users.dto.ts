import { UserRole } from '../enums/roles.enum';

/**
 * Admin User DTO - Response DTO for admin operations
 * This is returned by the server when fetching/creating/updating users
 * Includes system-generated fields like id, timestamps, and status flags
 */
export interface AdminUserDto {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    mustChangePassword: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Response wrapper for single admin user
 */
export interface AdminUserResponseDto {
    success: boolean;
    data: AdminUserDto;
}

/**
 * Pagination metadata
 */
export interface PaginationDto {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Response wrapper for list of users with pagination
 */
export interface ListUsersResponseDto {
    success: boolean;
    data: {
        users: AdminUserDto[];
        pagination: PaginationDto;
    };
}

/**
 * Request DTO for creating a new user
 * This is sent by the client when creating a new user
 * Includes password field (required for creation) and admin-settable fields only
 */
export interface AdminCreateUserRequestDto {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
}

/**
 * Request DTO for updating user details
 * This is sent by the client when updating a user
 * All fields are optional - only provided fields will be updated
 */
export interface AdminUpdateUserRequestDto {
    fullName?: string;
    email?: string;
}

/**
 * Request DTO for updating user status (activate/deactivate)
 * This is sent by the client to change user's active status
 */
export interface AdminUpdateUserStatusRequestDto {
    isActive: boolean;
}

/**
 * Request DTO for resetting user password
 * This is sent by the client when admin resets a user's password
 */
export interface AdminResetPasswordRequestDto {
    newPassword: string;
    requireChangeOnLogin?: boolean;
}
