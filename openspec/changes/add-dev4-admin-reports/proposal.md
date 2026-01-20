# Change: Developer 4 - Admin Panel & Reporting

## Why

Administrators need comprehensive tools to manage the system, view reports, and ensure data integrity. This includes managing users, entities (clients/projects/tasks), viewing detailed reports, locking months for payroll processing, and maintaining an audit trail of all administrative actions. Without this functionality, administrators cannot effectively oversee employee time tracking, generate payroll reports, or maintain system governance.

## What Changes

### Admin Authentication

- Dedicated admin login page (only ADMIN users can login)
- JWT-based authentication using existing auth infrastructure
- Auth guard to protect all admin routes
- Automatic redirect to login for unauthenticated users

### Admin Dashboard
- Overview statistics (active users, projects, today's stats, month completion rate)
- Real-time dashboard with key metrics
- Visual indicators for system health

### User Management
- Full CRUD operations for users
- User activation/deactivation
- Password reset functionality
- User listing with filtering and pagination

### Entity Management
- CRUD operations for clients, projects, and tasks
- Status management (ACTIVE/INACTIVE for clients/projects, OPEN/CLOSED for tasks)
- Project report type configuration (TOTAL_HOURS vs ENTRY_EXIT)
- **Date range management for projects and tasks**
  - Projects can have optional start/end dates
  - Tasks can have optional start/end dates (must be within project range if both are set)
  - Date validation: endDate >= startDate
  - Prevent closing tasks with existing time entries
- Soft delete pattern (status-based, no physical deletion)

### Task Assignments
- Assign tasks to users (single and bulk operations)
- View all assignments
- Remove assignments

### Admin Reports
- Dashboard overview with aggregated statistics
- User monthly reports with detailed breakdown
- CSV export functionality for monthly reports
- Admin view of user time entries (with edit/create/delete capabilities)
- Admin view of user absences (with edit/create capabilities)

### Month Locks
- Lock/unlock months to prevent edits
- View lock status and history
- Month lock prevents all workday/entry edits

## Impact

- **Affected specs**: `admin-reports`, `admin-users`, `admin-entities`, `admin-assignments`, `month-locks`
- **Affected code**:
  - `server/src/modules/admin/*` (all admin submodules)
  - `server/src/modules/admin/users/*`
  - `server/src/modules/admin/entities/*` (clients, projects, tasks)
  - `server/src/modules/admin/assignments/*`
  - `server/src/modules/admin/reports/*`
  - `server/src/modules/admin/month-locks/*`
  - `client/apps/admin/src/pages/*` (all admin pages)
  - `client/apps/admin/src/components/*` (admin components)
  - `shared/types/src/dtos/admin*.dto.ts` (admin DTOs)
- **Dependencies**:
  - Developer 1 (auth, users, infrastructure)
  - Developer 2 (time entries, workday data for reports)
  - Developer 3 (absence data for reports)
- **Blocks**: None (final feature layer)

## References

- Business rules: `project-features/projectsummery.md` (Section 4.4, 5)
- Database schema: `project-features/schemes.md` (clients, projects, tasks, task_assignments, month_locks)
- API endpoints: `project-features/endpoints.md` (Admin sections 8-12)
- DTOs: `project-features/dtos.md` (Admin sections 9-13)
- Task division: `project-features/task_division.md` (Developer 4 section)
- Developer rules: `server/CLAUDE.md`, `client/CLAUDE.md`

