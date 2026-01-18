/**
 * @fileoverview Time Reports module index
 * @module time-reports
 */

export * from './timeReports.routes';
export * from './timeReports.controller';
export * from './timeReports.service';
export * from './timeReports.schemas';

// Re-export repo functions with explicit names to avoid conflicts with service functions
export {
    findTimeEntryById,
    findTimeEntriesWithFilters,
    findRunningTimer,
    findMonthLock,
    findTaskAssignment,
    findWorkdaySummary,
    updateWorkdaySummaryMinutes,
    softDeleteTimeEntry,
    createTimeEntry as createTimeEntryRepo,
    updateTimeEntry as updateTimeEntryRepo,
    findTaskWithProject,
    findEntryExitForProject,
} from './timeReports.repo';
