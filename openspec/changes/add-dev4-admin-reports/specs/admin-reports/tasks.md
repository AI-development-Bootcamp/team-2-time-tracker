# Tasks: Admin Reports Module

**Spec**: `spec.md`

This module handles admin dashboard, user reports, CSV exports, and admin time entry/absence management.

## 1. Backend - Reports Module

### 1.1 Module Structure
- [ ] 1.1.1 Create `server/src/modules/admin/reports/reports.routes.ts`
- [ ] 1.1.2 Create `server/src/modules/admin/reports/reports.controller.ts`
- [ ] 1.1.3 Create `server/src/modules/admin/reports/reports.service.ts`
- [ ] 1.1.4 Create `server/src/modules/admin/reports/reports.repo.ts`

### 1.2 Dashboard Endpoint
- [ ] 1.2.1 Implement `GET /admin/reports/dashboard` endpoint
- [ ] 1.2.2 Calculate active users count (isActive = true)
- [ ] 1.2.3 Calculate active projects count (status = ACTIVE)
- [ ] 1.2.4 Calculate today's working users count
- [ ] 1.2.5 Calculate today's absent users count
- [ ] 1.2.6 Calculate today's late users count
- [ ] 1.2.7 Calculate current month completion rate (% submitted workdays)
- [ ] 1.2.8 Return all statistics in single response

### 1.3 User Monthly Report
- [ ] 1.3.1 Implement `GET /admin/reports/users/:userId/monthly/:month` endpoint
- [ ] 1.3.2 Include user info (name, email, role)
- [ ] 1.3.3 Calculate period summary (target, actual, absence, balance)
- [ ] 1.3.4 Generate daily breakdown for all days in month
- [ ] 1.3.5 Include time entries for each day
- [ ] 1.3.6 Include absences for each day
- [ ] 1.3.7 Include submission status for each day

### 1.4 CSV Export
- [ ] 1.4.1 Implement `GET /admin/reports/users/:userId/monthly/:month/export` endpoint
- [ ] 1.4.2 Set proper Content-Type header (text/csv; charset=utf-8)
- [ ] 1.4.3 Set Content-Disposition header for file download
- [ ] 1.4.4 Add BOM for Hebrew character support
- [ ] 1.4.5 Generate CSV with headers (Date, Work Minutes, Absence Minutes, Status, Submitted)
- [ ] 1.4.6 Format dates properly for CSV
- [ ] 1.4.7 Include daily breakdown rows

### 1.5 Admin Time Entry Management
- [ ] 1.5.1 Implement `GET /admin/users/:userId/time-entries` endpoint
- [ ] 1.5.2 Add pagination to time entries list
- [ ] 1.5.3 Add filtering by date range
- [ ] 1.5.4 Implement `POST /admin/users/:userId/time-entries` endpoint
- [ ] 1.5.5 Bypass month lock validation for admin
- [ ] 1.5.6 Create audit log on admin create
- [ ] 1.5.7 Implement `PUT /admin/users/:userId/time-entries/:id` endpoint
- [ ] 1.5.8 Bypass month lock validation for admin
- [ ] 1.5.9 Create audit log on admin edit
- [ ] 1.5.10 Implement `DELETE /admin/users/:userId/time-entries/:id` endpoint
- [ ] 1.5.11 Soft delete time entry
- [ ] 1.5.12 Create audit log on admin delete

### 1.6 Admin Absence Management
- [ ] 1.6.1 Implement `GET /admin/users/:userId/absences` endpoint
- [ ] 1.6.2 Add pagination to absences list
- [ ] 1.6.3 Add filtering by date range
- [ ] 1.6.4 Implement `POST /admin/users/:userId/absences` endpoint
- [ ] 1.6.5 Bypass month lock validation for admin
- [ ] 1.6.6 Create audit log on admin create
- [ ] 1.6.7 Implement `PUT /admin/users/:userId/absences/:id` endpoint
- [ ] 1.6.8 Bypass month lock validation for admin
- [ ] 1.6.9 Create audit log on admin edit

## 2. Frontend - Admin Reports

### 2.1 Admin Dashboard
- [ ] 2.1.1 Create `client/apps/admin/src/pages/AdminDashboardPage.tsx`
- [ ] 2.1.2 Create stat cards for active users
- [ ] 2.1.3 Create stat cards for active projects
- [ ] 2.1.4 Create today's statistics section (working, absent, late)
- [ ] 2.1.5 Create month completion rate progress indicator
- [ ] 2.1.6 Add refresh button to reload dashboard
- [ ] 2.1.7 Display real-time or cached data

### 2.2 User Reports Page
- [ ] 2.2.1 Create `client/apps/admin/src/pages/UserReportsPage.tsx`
- [ ] 2.2.2 Add user selector dropdown (searchable)
- [ ] 2.2.3 Add month selector (month/year picker)
- [ ] 2.2.4 Display user info section
- [ ] 2.2.5 Display period summary (target, actual, balance)
- [ ] 2.2.6 Display daily breakdown table

### 2.3 Monthly Report View
- [ ] 2.3.1 Create `MonthlyReportView.tsx` component
- [ ] 2.3.2 Display summary statistics at top
- [ ] 2.3.3 Create daily breakdown table with all days
- [ ] 2.3.4 Show time entries for each day
- [ ] 2.3.5 Show absences for each day
- [ ] 2.3.6 Show submission status for each day
- [ ] 2.3.7 Highlight weekends or special days
- [ ] 2.3.8 Add expandable rows for detailed time entries

### 2.4 CSV Export
- [ ] 2.4.1 Create `CSVExportButton.tsx` component
- [ ] 2.4.2 Trigger download on button click
- [ ] 2.4.3 Show loading state during export
- [ ] 2.4.4 Handle export errors gracefully
- [ ] 2.4.5 Generate proper filename (user-month-report.csv)

### 2.5 Admin Time Entry Editor
- [ ] 2.5.1 Create `AdminTimeEntryEditor.tsx` component
- [ ] 2.5.2 Display list of user's time entries
- [ ] 2.5.3 Add edit button for each entry
- [ ] 2.5.4 Add delete button for each entry
- [ ] 2.5.5 Add create new entry button
- [ ] 2.5.6 Show confirmation dialogs for destructive actions
- [ ] 2.5.7 Display audit trail (who edited when)
- [ ] 2.5.8 Add date range filter

### 2.6 Admin Absence Editor
- [ ] 2.6.1 Create `AdminAbsenceEditor.tsx` component
- [ ] 2.6.2 Display list of user's absences
- [ ] 2.6.3 Add edit button for each absence
- [ ] 2.6.4 Add create new absence button
- [ ] 2.6.5 Show confirmation dialogs
- [ ] 2.6.6 Display audit trail
- [ ] 2.6.7 Add date range filter

### 2.7 State Management
- [ ] 2.7.1 Create Zustand store for dashboard state
- [ ] 2.7.2 Create Zustand store for user reports state
- [ ] 2.7.3 Implement fetch dashboard action
- [ ] 2.7.4 Implement fetch monthly report action
- [ ] 2.7.5 Implement export CSV action
- [ ] 2.7.6 Implement admin time entry CRUD actions
- [ ] 2.7.7 Implement admin absence CRUD actions

## 3. Shared Types & DTOs

### 3.1 DTOs
- [ ] 3.1.1 Create `shared/types/src/dtos/admin-reports.dto.ts`
- [ ] 3.1.2 Define `DashboardResponseDto`
- [ ] 3.1.3 Define `TodayStatsDto` (working, absent, late counts)
- [ ] 3.1.4 Define `MonthlyReportDto` (user, summary, dailyBreakdown)
- [ ] 3.1.5 Define `DailySummaryDto` (date, minutes, status, submitted)
- [ ] 3.1.6 Define `AdminTimeEntryDto` (extends user time entry DTO)
- [ ] 3.1.7 Define `AdminAbsenceDto` (extends user absence DTO)

### 3.2 Validation Schemas
- [ ] 3.2.1 Create `shared/types/src/zod/admin-reports.schema.ts`
- [ ] 3.2.2 Add Zod schemas for all report DTOs
- [ ] 3.2.3 Add month format validation (YYYY-MM)

### 3.3 Exports
- [ ] 3.3.1 Export admin-reports DTOs from `shared/types/src/index.ts`

## 4. Testing

### 4.1 Backend Tests
- [ ] 4.1.1 Write unit tests for reports.service.ts
- [ ] 4.1.2 Write integration tests for dashboard endpoint
- [ ] 4.1.3 Write integration tests for monthly report endpoint
- [ ] 4.1.4 Write integration tests for CSV export endpoint
- [ ] 4.1.5 Test CSV format and Hebrew character support
- [ ] 4.1.6 Write integration tests for admin time entry endpoints
- [ ] 4.1.7 Write integration tests for admin absence endpoints
- [ ] 4.1.8 Test admin override of month locks
- [ ] 4.1.9 Test audit log integration for admin edits

### 4.2 Frontend Tests
- [ ] 4.2.1 Write tests for AdminDashboardPage.tsx
- [ ] 4.2.2 Write tests for UserReportsPage.tsx
- [ ] 4.2.3 Write tests for MonthlyReportView.tsx
- [ ] 4.2.4 Write tests for CSVExportButton.tsx
- [ ] 4.2.5 Write tests for AdminTimeEntryEditor.tsx
- [ ] 4.2.6 Write tests for AdminAbsenceEditor.tsx
- [ ] 4.2.7 Write tests for reports stores

## 5. Documentation

### 5.1 API Documentation
- [ ] 5.1.1 Document `GET /admin/reports/dashboard` in Swagger
- [ ] 5.1.2 Document `GET /admin/reports/users/:userId/monthly/:month` in Swagger
- [ ] 5.1.3 Document `GET /admin/reports/users/:userId/monthly/:month/export` in Swagger
- [ ] 5.1.4 Document admin time entry endpoints in Swagger
- [ ] 5.1.5 Document admin absence endpoints in Swagger
- [ ] 5.1.6 Document CSV export format
- [ ] 5.1.7 Add request/response examples for all endpoints

### 5.2 Code Documentation
- [ ] 5.2.1 Add JSDoc comments to reports.service.ts
- [ ] 5.2.2 Document dashboard calculation logic
- [ ] 5.2.3 Document CSV generation logic
- [ ] 5.2.4 Document admin override behavior
