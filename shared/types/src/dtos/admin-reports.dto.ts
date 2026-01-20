// ===========================
// ADMIN DASHBOARD DTOs
// ===========================

/**
 * Today's statistics for dashboard
 */
export interface DashboardTodayStatsDto {
    working: number;
    absent: number;
    late: number;
}

/**
 * Admin Dashboard DTO - Overview statistics
 */
export interface AdminDashboardDto {
    activeUsersCount: number;
    activeProjectsCount: number;
    todayStats: DashboardTodayStatsDto;
    monthCompletionRate: number;
}

/**
 * Response wrapper for admin dashboard
 */
export interface AdminDashboardResponseDto {
    success: boolean;
    data: AdminDashboardDto;
}

// ===========================
// MONTHLY REPORT DTOs
// ===========================

/**
 * Daily summary in monthly report
 */
export interface DailySummaryDto {
    date: string;
    status: 'WORKING' | 'ABSENT' | 'WEEKEND' | 'HOLIDAY' | 'NOT_SUBMITTED';
    workMinutes: number;
    absenceMinutes: number;
    isSubmitted: boolean;
    submittedAt: string | null;
}

/**
 * Period summary in monthly report
 */
export interface PeriodSummaryDto {
    targetMinutes: number;
    actualWorkMinutes: number;
    absenceMinutes: number;
    balance: number;
}

/**
 * User monthly report DTO
 */
export interface UserMonthlyReportDto {
    userId: string;
    userFullName: string;
    month: string;
    periodSummary: PeriodSummaryDto;
    dailySummaries: DailySummaryDto[];
}

/**
 * Response wrapper for user monthly report
 */
export interface UserMonthlyReportResponseDto {
    success: boolean;
    data: UserMonthlyReportDto;
}

// ===========================
// TIME ENTRY MANAGEMENT DTOs
// ===========================

/**
 * Time Entry DTO for admin operations
 */
export interface AdminTimeEntryDto {
    id: string;
    userId: string;
    taskId: string;
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    totalMinutes: number;
    notes: string | null;
    source: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Response wrapper for list of time entries with pagination
 */
export interface ListTimeEntriesResponseDto {
    success: boolean;
    data: {
        entries: AdminTimeEntryDto[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
}

/**
 * Response wrapper for single time entry
 */
export interface TimeEntryResponseDto {
    success: boolean;
    data: AdminTimeEntryDto;
}

/**
 * Request DTO for creating a time entry (admin)
 */
export interface AdminCreateTimeEntryRequestDto {
    taskId: string;
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes?: number;
    notes?: string;
}

/**
 * Request DTO for updating a time entry (admin)
 */
export interface AdminUpdateTimeEntryRequestDto {
    taskId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    breakMinutes?: number;
    notes?: string;
}

// ===========================
// ABSENCE MANAGEMENT DTOs
// ===========================

/**
 * Absence DTO for admin operations
 */
export interface AdminAbsenceDto {
    id: string;
    userId: string;
    startDate: string;
    endDate: string;
    absenceType: string;
    reason: string | null;
    status: string;
    documentUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Response wrapper for list of absences with pagination
 */
export interface ListAbsencesResponseDto {
    success: boolean;
    data: {
        absences: AdminAbsenceDto[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
}

/**
 * Response wrapper for single absence
 */
export interface AbsenceResponseDto {
    success: boolean;
    data: AdminAbsenceDto;
}

/**
 * Request DTO for creating an absence (admin)
 */
export interface AdminCreateAbsenceRequestDto {
    startDate: string;
    endDate: string;
    absenceType: string;
    reason?: string;
    documentUrl?: string;
}

/**
 * Request DTO for updating an absence (admin)
 */
export interface AdminUpdateAbsenceRequestDto {
    startDate?: string;
    endDate?: string;
    absenceType?: string;
    reason?: string;
    status?: string;
    documentUrl?: string;
}
