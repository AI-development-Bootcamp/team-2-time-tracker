// ===========================
// MONTH LOCK DTOs
// ===========================

/**
 * Month Lock DTO - Response DTO for month lock operations
 */
export interface MonthLockDto {
    id: string;
    month: string;
    isLocked: boolean;
    lockedAt: string | null;
    lockedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Response wrapper for single month lock
 */
export interface MonthLockResponseDto {
    success: boolean;
    data: MonthLockDto;
}

/**
 * Response wrapper for list of month locks
 */
export interface ListMonthLocksResponseDto {
    success: boolean;
    data: MonthLockDto[];
}

/**
 * Month lock status DTO
 */
export interface MonthLockStatusDto {
    month: string;
    isLocked: boolean;
    lockedAt: string | null;
    lockedBy: string | null;
}

/**
 * Response wrapper for month lock status
 */
export interface MonthLockStatusResponseDto {
    success: boolean;
    data: MonthLockStatusDto;
}

/**
 * Request DTO for locking a month
 */
export interface LockMonthRequestDto {
    month: string;
}

/**
 * Request DTO for unlocking a month
 */
export interface UnlockMonthRequestDto {
    month: string;
}
