/**
 * @fileoverview Time Reports module index
 * @module time-reports
 */

// Time entries routes and controller
export { timeReportsRouter } from './timeReports.routes';
export * as timeReportsController from './timeReports.controller';
export * as timeReportsService from './timeReports.service';
export * from './timeReports.schemas';

// Workday routes and controller
export { workdayRouter } from './workday.routes';
export * as workdayController from './workday.controller';
export * as workdayService from './workday.service';

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
