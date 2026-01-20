# Tasks: Admin Reports Module

**Spec**: `spec.md`

This module handles admin dashboard, user reports, CSV exports, and admin time entry/absence management.

## 1. Backend - Reports Module

### 1.1 Module Structure
- [ ] 1.1.1 Create `server/src/modules/admin/reports/reports.routes.ts`
- [ ] 1.1.2 Create `server/src/modules/admin/reports/reports.controller.ts`
- [ ] 1.1.3 Create `server/src/modules/admin/reports/reports.service.ts`
- [ ] 1.1.4 Create `server/src/modules/admin/reports/reports.repo.ts`

### 1.2 User Monthly Report
- [ ] 1.2.1 Implement `GET /admin/reports/users/:userId/monthly/:month` endpoint
- [ ] 1.2.2 Include user info (name, email, role)
- [ ] 1.2.3 Calculate period summary (target, actual, absence, balance)
- [ ] 1.2.4 Generate daily breakdown for all days in month
- [ ] 1.2.5 Include time entries for each day
- [ ] 1.2.6 Include absences for each day
- [ ] 1.2.7 Include submission status for each day

### 1.3 CSV Export
- [ ] 1.3.1 Implement `GET /admin/reports/users/:userId/monthly/:month/export` endpoint
- [ ] 1.3.2 Set proper Content-Type header (text/csv; charset=utf-8)
- [ ] 1.3.3 Set Content-Disposition header for file download
- [ ] 1.3.4 Add BOM for Hebrew character support
- [ ] 1.3.5 Generate CSV with headers (Date, Work Minutes, Absence Minutes, Status, Submitted)
- [ ] 1.3.6 Format dates properly for CSV
- [ ] 1.3.7 Include daily breakdown rows

### 1.4 Admin Time Entry Management
- [ ] 1.4.1 Implement `GET /admin/users/:userId/time-entries` endpoint
- [ ] 1.4.2 Add pagination to time entries list
- [ ] 1.4.3 Add filtering by date range
- [ ] 1.4.4 Implement `POST /admin/users/:userId/time-entries` endpoint
- [ ] 1.4.5 Bypass month lock validation for admin
- [ ] 1.4.6 Create audit log on admin create
- [ ] 1.4.7 Implement `PUT /admin/users/:userId/time-entries/:id` endpoint
- [ ] 1.4.8 Bypass month lock validation for admin
- [ ] 1.4.9 Create audit log on admin edit
- [ ] 1.4.10 Implement `DELETE /admin/users/:userId/time-entries/:id` endpoint
- [ ] 1.4.11 Soft delete time entry
- [ ] 1.4.12 Create audit log on admin delete

### 1.5 Admin Absence Management
- [ ] 1.5.1 Implement `GET /admin/users/:userId/absences` endpoint
- [ ] 1.5.2 Add pagination to absences list
- [ ] 1.5.3 Add filtering by date range
- [ ] 1.5.4 Implement `POST /admin/users/:userId/absences` endpoint
- [ ] 1.5.5 Bypass month lock validation for admin
- [ ] 1.5.6 Create audit log on admin create
- [ ] 1.5.7 Implement `PUT /admin/users/:userId/absences/:id` endpoint
- [ ] 1.5.8 Bypass month lock validation for admin
- [ ] 1.5.9 Create audit log on admin edit

## 2. Frontend - Admin Reports

### 2.1 User Reports Page
- [ ] 2.1.1 Create `client/apps/admin/src/pages/UserReportsPage.tsx`
- [ ] 2.1.2 Add user selector dropdown (searchable)
- [ ] 2.1.3 Add month selector (month/year picker)
- [ ] 2.1.4 Display user info section
- [ ] 2.1.5 Display period summary (target, actual, balance)
- [ ] 2.1.6 Display daily breakdown table

### 2.2 Monthly Report View
- [ ] 2.2.1 Create `MonthlyReportView.tsx` component
- [ ] 2.2.2 Display summary statistics at top
- [ ] 2.2.3 Create daily breakdown table with all days
- [ ] 2.2.4 Show time entries for each day
- [ ] 2.2.5 Show absences for each day
- [ ] 2.2.6 Show submission status for each day
- [ ] 2.2.7 Highlight weekends or special days
- [ ] 2.2.8 Add expandable rows for detailed time entries

### 2.3 CSV Export
- [ ] 2.3.1 Create `CSVExportButton.tsx` component
- [ ] 2.3.2 Trigger download on button click
- [ ] 2.3.3 Show loading state during export
- [ ] 2.3.4 Handle export errors gracefully
- [ ] 2.3.5 Generate proper filename (user-month-report.csv)

### 2.4 Admin Time Entry Editor
- [ ] 2.4.1 Create `AdminTimeEntryEditor.tsx` component
- [ ] 2.4.2 Display list of user's time entries
- [ ] 2.4.3 Add edit button for each entry
- [ ] 2.4.4 Add delete button for each entry
- [ ] 2.4.5 Add create new entry button
- [ ] 2.4.6 Show confirmation dialogs for destructive actions
- [ ] 2.4.7 Display audit trail (who edited when)
- [ ] 2.4.8 Add date range filter

### 2.5 Admin Absence Editor
- [ ] 2.5.1 Create `AdminAbsenceEditor.tsx` component
- [ ] 2.5.2 Display list of user's absences
- [ ] 2.5.3 Add edit button for each absence
- [ ] 2.5.4 Add create new absence button
- [ ] 2.5.5 Show confirmation dialogs
- [ ] 2.5.6 Display audit trail
- [ ] 2.5.7 Add date range filter

### 2.6 State Management
- [ ] 2.6.1 Create Zustand store for user reports state
- [ ] 2.6.2 Implement fetch monthly report action
- [ ] 2.6.3 Implement export CSV action
- [ ] 2.6.4 Implement admin time entry CRUD actions
- [ ] 2.6.5 Implement admin absence CRUD actions

## 3. Shared Types & DTOs

### 3.1 DTOs
- [ ] 3.1.1 Create `shared/types/src/dtos/admin-reports.dto.ts`
- [ ] 3.1.2 Define `MonthlyReportDto` (user, summary, dailyBreakdown)
- [ ] 3.1.3 Define `DailySummaryDto` (date, minutes, status, submitted)
- [ ] 3.1.4 Define `AdminTimeEntryDto` (extends user time entry DTO)
- [ ] 3.1.5 Define `AdminAbsenceDto` (extends user absence DTO)

### 3.2 Validation Schemas
- [ ] 3.2.1 Create `shared/types/src/zod/admin-reports.schema.ts`
- [ ] 3.2.2 Add Zod schemas for all report DTOs
- [ ] 3.2.3 Add month format validation (YYYY-MM)

### 3.3 Exports
- [ ] 3.3.1 Export admin-reports DTOs from `shared/types/src/index.ts`

## 4. Testing

### 4.1 Backend Tests
- [ ] 4.1.1 Write unit tests for reports.service.ts
- [ ] 4.1.2 Write integration tests for monthly report endpoint
- [ ] 4.1.3 Write integration tests for CSV export endpoint
- [ ] 4.1.4 Test CSV format and Hebrew character support
- [ ] 4.1.5 Write integration tests for admin time entry endpoints
- [ ] 4.1.6 Write integration tests for admin absence endpoints
- [ ] 4.1.7 Test admin override of month locks
- [ ] 4.1.8 Test audit log integration for admin edits

### 4.2 Frontend Tests
- [ ] 4.2.1 Write tests for UserReportsPage.tsx
- [ ] 4.2.2 Write tests for MonthlyReportView.tsx
- [ ] 4.2.3 Write tests for CSVExportButton.tsx
- [ ] 4.2.4 Write tests for AdminTimeEntryEditor.tsx
- [ ] 4.2.5 Write tests for AdminAbsenceEditor.tsx
- [ ] 4.2.6 Write tests for reports stores

## 5. Documentation

### 5.1 API Documentation
- [ ] 5.1.1 Document `GET /admin/reports/users/:userId/monthly/:month` in Swagger
- [ ] 5.1.2 Document `GET /admin/reports/users/:userId/monthly/:month/export` in Swagger
- [ ] 5.1.3 Document admin time entry endpoints in Swagger
- [ ] 5.1.4 Document admin absence endpoints in Swagger
- [ ] 5.1.5 Document CSV export format
- [ ] 5.1.6 Add request/response examples for all endpoints

### 5.2 Code Documentation
- [ ] 5.2.1 Add JSDoc comments to reports.service.ts
- [ ] 5.2.2 Document CSV generation logic
- [ ] 5.2.3 Document admin override behavior
