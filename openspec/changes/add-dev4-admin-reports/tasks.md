# Tasks: Developer 4 - Admin Panel & Reporting

## 1. Database Schema

### 1.1 Prisma Models
- [ ] 1.1.1 Add Client model to `prisma/schema.prisma`
- [ ] 1.1.2 Add Project model with reportType field
- [ ] 1.1.3 Add Task model
- [ ] 1.1.4 Add TaskAssignment model
- [ ] 1.1.5 Add MonthLock model
- [ ] 1.1.6 Create migration for all admin-related tables
- [ ] 1.1.7 Add necessary indexes for query optimization

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

### 5.5 Admin Absence Management
- [ ] 5.5.1 Implement `GET /admin/users/:userId/absences` (admin view)
- [ ] 5.5.2 Implement `PUT /admin/users/:userId/absences/:id` (admin edit)
- [ ] 5.5.3 Implement `POST /admin/users/:userId/absences` (admin create)

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

## 7. Shared DTOs & Types

### 7.1 Admin DTOs
- [ ] 7.1.1 Create `admin-users.dto.ts` in `shared/types/src/dtos/`
- [ ] 7.1.2 Create `admin-entities.dto.ts` in `shared/types/src/dtos/`
- [ ] 7.1.3 Create `admin-assignments.dto.ts` in `shared/types/src/dtos/`
- [ ] 7.1.4 Create `admin-reports.dto.ts` in `shared/types/src/dtos/`
- [ ] 7.1.5 Create `month-locks.dto.ts` in `shared/types/src/dtos/`
- [ ] 7.1.6 Export all DTOs from `shared/types/src/index.ts`

### 7.2 Zod Schemas
- [ ] 7.2.1 Create validation schemas for all admin DTOs
- [ ] 7.2.2 Add schemas to `shared/types/src/zod/` directory

## 8. Frontend Admin App Setup

### 8.1 Admin App Structure
- [ ] 8.1.1 Create admin app routing structure
- [ ] 8.1.2 Create `AdminLayout.tsx` with sidebar navigation
- [ ] 8.1.3 Create admin navigation menu items
- [ ] 8.1.4 Set up admin app state management (Zustand stores)

### 8.2 Shared Admin Components
- [ ] 8.2.1 Create `DataTable.tsx` component (TanStack Table wrapper)
- [ ] 8.2.2 Create `ReportFilters.tsx` component
- [ ] 8.2.3 Create `StatusBadge.tsx` component
- [ ] 8.2.4 Create `PaginationControls.tsx` component

## 9. Testing

### 9.1 Backend Tests
- [ ] 9.1.1 Write unit tests for admin services
- [ ] 9.1.2 Write integration tests for admin endpoints
- [ ] 9.1.3 Test CSV export functionality
- [ ] 9.1.4 Test month lock validation
- [ ] 9.1.5 Achieve minimum 60% coverage for admin modules

### 9.2 Frontend Tests
- [ ] 9.2.1 Write tests for admin pages
- [ ] 9.2.2 Write tests for admin components
- [ ] 9.2.3 Write tests for admin stores

## 10. Documentation

### 10.1 API Documentation
- [ ] 10.1.1 Document all admin endpoints in Swagger
- [ ] 10.1.2 Add examples for all admin DTOs
- [ ] 10.1.3 Document CSV export format

### 10.2 Code Documentation
- [ ] 10.2.1 Add JSDoc comments to admin services

