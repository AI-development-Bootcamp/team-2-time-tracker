# Tasks: Developer 4 - Admin Panel & Reporting

## 0. Admin Authentication

### 0.1 Backend Admin Auth (extends existing auth module)
- [x] 0.1.1 Create `admin/auth/auth.routes.ts` with admin login endpoint
- [x] 0.1.2 Create `admin/auth/auth.controller.ts`
- [x] 0.1.3 Create `admin/auth/auth.service.ts` that wraps existing auth service
- [x] 0.1.4 Implement `POST /admin/auth/login` - calls existing login and rejects non-ADMIN users
- [x] 0.1.5 Implement `POST /admin/auth/refresh` - reuse existing refresh logic
- [x] 0.1.6 Implement `GET /admin/auth/me` - reuse existing me logic with requireAdmin

### 0.2 Frontend Admin Login
- [ ] 0.2.1 Create `LoginPage.tsx` component with email/password form
- [ ] 0.2.2 Create `useAuth` hook or auth store (Zustand)
- [ ] 0.2.3 Implement login API call to `/admin/auth/login`
- [ ] 0.2.4 Store auth token and user info in state/localStorage
- [ ] 0.2.5 Create `AuthGuard.tsx` component to protect admin routes
- [ ] 0.2.6 Redirect unauthenticated users to login page
- [ ] 0.2.7 Add logout functionality

## 1. Database Schema

### 1.1 Prisma Models
- [ ] 1.1.1 Add Client model to `prisma/schema.prisma`
- [ ] 1.1.2 Add Project model with reportType field
- [ ] 1.1.3 Add Task model
- [ ] 1.1.4 Add TaskAssignment model
- [ ] 1.1.5 Add MonthLock model
- [ ] 1.1.6 Add AuditLog model
- [ ] 1.1.7 Create migration for all admin-related tables
- [ ] 1.1.8 Add necessary indexes for query optimization

## 2. Admin Users Module

### 2.1 Backend Users Module
- [ ] 2.1.1 Create `admin/users.routes.ts`
- [ ] 2.1.2 Create `admin/users.controller.ts`
- [ ] 2.1.3 Create `admin/users.service.ts`
- [ ] 2.1.4 Create `admin/users.repo.ts`

### 2.2 User Management Endpoints
- [ ] 2.2.1 Implement `GET /admin/users` (list with filters)
- [ ] 2.2.2 Implement `POST /admin/users` (create user)
- [ ] 2.2.3 Implement `GET /admin/users/:id` (get user)
- [ ] 2.2.4 Implement `PUT /admin/users/:id` (update user)
- [ ] 2.2.5 Implement `PUT /admin/users/:id/status` (activate/deactivate)
- [ ] 2.2.6 Implement `POST /admin/users/:id/reset-password` (reset password)

### 2.3 Frontend User Management
- [ ] 2.3.1 Create `UsersPage.tsx` with data table
- [ ] 2.3.2 Create `UserForm.tsx` component (create/edit)
- [ ] 2.3.3 Create `UserStatusToggle.tsx` component
- [ ] 2.3.4 Implement user filtering and pagination
- [ ] 2.3.5 Implement user search functionality

## 3. Admin Entities Module

### 3.1 Backend Clients Module
- [ ] 3.1.1 Create `admin/entities/clients.routes.ts`
- [ ] 3.1.2 Create `admin/entities/clients.controller.ts`
- [ ] 3.1.3 Create `admin/entities/clients.service.ts`
- [ ] 3.1.4 Create `admin/entities/clients.repo.ts`

### 3.2 Backend Projects Module
- [ ] 3.2.1 Create `admin/entities/projects.routes.ts`
- [ ] 3.2.2 Create `admin/entities/projects.controller.ts`
- [ ] 3.2.3 Create `admin/entities/projects.service.ts`
- [ ] 3.2.4 Create `admin/entities/projects.repo.ts`

### 3.3 Backend Tasks Module
- [ ] 3.3.1 Create `admin/entities/tasks.routes.ts`
- [ ] 3.3.2 Create `admin/entities/tasks.controller.ts`
- [ ] 3.3.3 Create `admin/entities/tasks.service.ts`
- [ ] 3.3.4 Create `admin/entities/tasks.repo.ts`

### 3.4 Entity CRUD Endpoints
- [ ] 3.4.1 Implement clients CRUD endpoints
- [ ] 3.4.2 Implement projects CRUD endpoints
- [ ] 3.4.3 Implement tasks CRUD endpoints
- [ ] 3.4.4 Implement status update endpoints for all entities
- [ ] 3.4.5 Implement project reportType update endpoint

### 3.5 Frontend Entity Management
- [ ] 3.5.1 Create `ClientsPage.tsx` with CRUD table
- [ ] 3.5.2 Create `ProjectsPage.tsx` with CRUD table
- [ ] 3.5.3 Create `TasksPage.tsx` with CRUD table
- [ ] 3.5.4 Create `EntityFormDrawer.tsx` reusable component
- [ ] 3.5.5 Implement soft delete (status change) UI

## 4. Admin Assignments Module

### 4.1 Backend Assignments Module
- [ ] 4.1.1 Create `admin/assignments.routes.ts`
- [ ] 4.1.2 Create `admin/assignments.controller.ts`
- [ ] 4.1.3 Create `admin/assignments.service.ts`
- [ ] 4.1.4 Create `admin/assignments.repo.ts`

### 4.2 Assignment Endpoints
- [ ] 4.2.1 Implement `GET /admin/assignments` (list with filters)
- [ ] 4.2.2 Implement `POST /admin/assignments` (create single)
- [ ] 4.2.3 Implement `POST /admin/assignments/bulk` (bulk create)
- [ ] 4.2.4 Implement `DELETE /admin/assignments/:id` (remove)

### 4.3 Frontend Assignments
- [ ] 4.3.1 Create `AssignmentsPage.tsx`
- [ ] 4.3.2 Create `BulkAssignmentForm.tsx` component
- [ ] 4.3.3 Implement cartesian product logic for bulk assignments

## 5. Admin Reports Module

### 5.1 Backend Reports Module
- [ ] 5.1.1 Create `admin/reports.routes.ts`
- [ ] 5.1.2 Create `admin/reports.controller.ts`
- [ ] 5.1.3 Create `admin/reports.service.ts`
- [ ] 5.1.4 Create `admin/reports.repo.ts`

### 5.2 Dashboard Endpoint
- [ ] 5.2.1 Implement `GET /admin/reports/dashboard` (overview stats)
- [ ] 5.2.2 Calculate active users count
- [ ] 5.2.3 Calculate active projects count
- [ ] 5.2.4 Calculate today's statistics (working, absent, late)
- [ ] 5.2.5 Calculate month completion rate

### 5.3 User Reports Endpoints
- [ ] 5.3.1 Implement `GET /admin/reports/users/:userId/monthly/:month` (detailed report)
- [ ] 5.3.2 Implement `GET /admin/reports/users/:userId/monthly/:month/export` (CSV export)
- [ ] 5.3.3 Generate CSV with proper formatting and Hebrew support
- [ ] 5.3.4 Include daily breakdown in monthly report

### 5.4 Admin Time Entry Management
- [ ] 5.4.1 Implement `GET /admin/users/:userId/time-entries` (admin view)
- [ ] 5.4.2 Implement `PUT /admin/users/:userId/time-entries/:id` (admin edit)
- [ ] 5.4.3 Implement `DELETE /admin/users/:userId/time-entries/:id` (admin delete)
- [ ] 5.4.4 Implement `POST /admin/users/:userId/time-entries` (admin create)
- [ ] 5.4.5 Log all admin edits to audit log

### 5.5 Admin Absence Management
- [ ] 5.5.1 Implement `GET /admin/users/:userId/absences` (admin view)
- [ ] 5.5.2 Implement `PUT /admin/users/:userId/absences/:id` (admin edit)
- [ ] 5.5.3 Implement `POST /admin/users/:userId/absences` (admin create)
- [ ] 5.5.4 Log all admin edits to audit log

### 5.6 Frontend Reports
- [ ] 5.6.1 Create `AdminDashboardPage.tsx` with overview cards
- [ ] 5.6.2 Create `UserReportsPage.tsx` with user selector
- [ ] 5.6.3 Create `MonthlyReportView.tsx` component
- [ ] 5.6.4 Create `CSVExportButton.tsx` component
- [ ] 5.6.5 Create `AdminTimeEntryEditor.tsx` component
- [ ] 5.6.6 Create `AdminAbsenceEditor.tsx` component

## 6. Month Locks Module

### 6.1 Backend Month Locks Module
- [ ] 6.1.1 Create `admin/month-locks.routes.ts`
- [ ] 6.1.2 Create `admin/month-locks.controller.ts`
- [ ] 6.1.3 Create `admin/month-locks.service.ts`
- [ ] 6.1.4 Create `admin/month-locks.repo.ts`

### 6.2 Month Lock Endpoints
- [ ] 6.2.1 Implement `GET /admin/month-locks` (list all locks)
- [ ] 6.2.2 Implement `GET /admin/month-locks/status/:month` (check status)
- [ ] 6.2.3 Implement `POST /admin/month-locks/lock` (lock month)
- [ ] 6.2.4 Implement `POST /admin/month-locks/unlock` (unlock month)
- [ ] 6.2.5 Validate month lock prevents edits in workday/time-entry services

### 6.3 Frontend Month Locks
- [ ] 6.3.1 Create `MonthLocksPage.tsx`
- [ ] 6.3.2 Create `MonthLockToggle.tsx` component
- [ ] 6.3.3 Display lock status in calendar views

## 7. Audit Logs Module

### 7.1 Backend Audit Logs Module
- [ ] 7.1.1 Create `admin/audit-logs.routes.ts`
- [ ] 7.1.2 Create `admin/audit-logs.controller.ts`
- [ ] 7.1.3 Create `admin/audit-logs.service.ts`
- [ ] 7.1.4 Create `admin/audit-logs.repo.ts`
- [ ] 7.1.5 Create `shared/audit-logger.ts` utility (used by other modules)

### 7.2 Audit Log Endpoints
- [ ] 7.2.1 Implement `GET /admin/audit-logs` (list with filters)
- [ ] 7.2.2 Implement `GET /admin/audit-logs/:id` (get single log)
- [ ] 7.2.3 Support filtering by entity, entityId, adminId, action, date range

### 7.3 Audit Logging Integration
- [ ] 7.3.1 Integrate audit logging in admin user operations
- [ ] 7.3.2 Integrate audit logging in admin entity operations
- [ ] 7.3.3 Integrate audit logging in admin time entry operations
- [ ] 7.3.4 Integrate audit logging in admin absence operations
- [ ] 7.3.5 Integrate audit logging in month lock operations

### 7.4 Frontend Audit Logs
- [ ] 7.4.1 Create `AuditLogsPage.tsx` with data table
- [ ] 7.4.2 Create `AuditLogFilters.tsx` component
- [ ] 7.4.3 Display old/new value diffs
- [ ] 7.4.4 Implement date range picker for filtering

## 8. Shared DTOs & Types

### 8.1 Admin DTOs
- [ ] 8.1.1 Create `admin-users.dto.ts` in `shared/types/src/dtos/`
- [ ] 8.1.2 Create `admin-entities.dto.ts` in `shared/types/src/dtos/`
- [ ] 8.1.3 Create `admin-assignments.dto.ts` in `shared/types/src/dtos/`
- [ ] 8.1.4 Create `admin-reports.dto.ts` in `shared/types/src/dtos/`
- [ ] 8.1.5 Create `month-locks.dto.ts` in `shared/types/src/dtos/`
- [ ] 8.1.6 Create `audit-logs.dto.ts` in `shared/types/src/dtos/`
- [ ] 8.1.7 Export all DTOs from `shared/types/src/index.ts`

### 8.2 Zod Schemas
- [ ] 8.2.1 Create validation schemas for all admin DTOs
- [ ] 8.2.2 Add schemas to `shared/types/src/zod/` directory

## 9. Frontend Admin App Setup

### 9.1 Admin App Structure
- [ ] 9.1.1 Create admin app routing structure
- [ ] 9.1.2 Create `AdminLayout.tsx` with sidebar navigation
- [ ] 9.1.3 Create admin navigation menu items
- [ ] 9.1.4 Set up admin app state management (Zustand stores)

### 9.2 Shared Admin Components
- [ ] 9.2.1 Create `DataTable.tsx` component (TanStack Table wrapper)
- [ ] 9.2.2 Create `ReportFilters.tsx` component
- [ ] 9.2.3 Create `StatusBadge.tsx` component
- [ ] 9.2.4 Create `PaginationControls.tsx` component

## 10. Testing

### 10.1 Backend Tests
- [ ] 10.1.1 Write unit tests for admin services
- [ ] 10.1.2 Write integration tests for admin endpoints
- [ ] 10.1.3 Test CSV export functionality
- [ ] 10.1.4 Test audit logging integration
- [ ] 10.1.5 Test month lock validation
- [ ] 10.1.6 Achieve minimum 60% coverage for admin modules

### 10.2 Frontend Tests
- [ ] 10.2.1 Write tests for admin pages
- [ ] 10.2.2 Write tests for admin components
- [ ] 10.2.3 Write tests for admin stores

## 11. Documentation

### 11.1 API Documentation
- [ ] 11.1.1 Document all admin endpoints in Swagger
- [ ] 11.1.2 Add examples for all admin DTOs
- [ ] 11.1.3 Document CSV export format

### 11.2 Code Documentation
- [ ] 11.2.1 Add JSDoc comments to admin services
- [ ] 11.2.2 Document audit logging patterns for other developers

