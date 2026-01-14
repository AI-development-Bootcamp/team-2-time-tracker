# Project Summary

## 1. Overview

The system is designed to provide a simple and efficient solution for managing and reporting work hours, creating a structured and unified mechanism that reduces errors and improves transparency between employees and administrators. The system is designed with a Mobile-first approach and fully supports Hebrew (RTL).

## 2. Architecture & Technologies

| Layer | Technology |
|-------|------------|
| Frontend | React (Mobile-first design) |
| Backend | Node.js (Express/Fastify) |
| Database | PostgreSQL (Relational) |
| Infrastructure | Docker & Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Vercel (Frontend), Render/Railway (Backend/DB) |
| API Documentation | Swagger / OpenAPI |

## 3. Data Entities

- **Users**: Full name, email, password (encrypted), type (employee/admin), status (active/inactive).
- **Clients**: Client name, contact details, activity status.
- **Projects**: Client association, project name, status.
- **Tasks**: Project association, task description, status.
- **Time Reports**: Date, hours (start/end), GPS location (optional), task association, text description.
- **Absences**: Type (vacation, sick, reserves, other), date range, document upload, approval status.
- **Audit Log**: Documentation of admin changes (who changed, when, old value, new value).

## 4. Feature Specification

### 4.1. Security & User Management

- **System Login**: Email and initial password authentication (created by admin).
- **Password Change**: Mandatory password change on first login. No self-service password recovery mechanism.
- **Sessions**: JWT authentication valid for 2 hours. (Refresh Token will be implemented in future versions).

### 4.2. Time Reporting & Timer

- **Daily Dashboard**: Progress display against standard hours (9 hours).
- **Timer Mechanism**: Start/Stop buttons. Measurement is done server-side to ensure continuity even if browser is closed.
- **Editing & Sync**:
  - Manual reporting only allowed when timer is off.
  - Smart sorting of clients/tasks by user's usage frequency.

### 4.3. Absence Reporting

- **Document Validation**: Mandatory file attachment for sick leave/reserves. Without a file, the report will be marked as "pending document" and an alert will be sent to admin.
- **9-Hour Rule**: In case of partial absence, the system ensures that total work hours + absence equals exactly 9 hours.

### 4.4. Admin Panel

- **Entity Management**: Full CRUD for all entities (users, projects, etc.).
- **Task Assignment**: Admin assigns specific tasks to specific users.
- **Month Closure**: Global action that locks all employee reports for editing.
- **Soft Delete**: No physical deletion of data; entities become "inactive".

## 5. Business Rules & Validations

- **Mandatory Allocation**: Cannot save a workday if there are hours not assigned to a specific task.
- **Time Validations**:
  - **Block**: End time must be after start time.
  - **Warning**: Visual indicator if less or more than 9 hours reported (but saving is not blocked).
- **Files**: Support for PDF and Image formats (JPG/PNG) with size limits.

## 6. Quality & Development Requirements

- **Testing**: Write Unit Tests with minimum 60% coverage.
- **Documentation**: All endpoints documented in Swagger.
- **Git Workflow**:
  - Work with Pull Requests (PR).
  - Protection on main branch.
  - Mandatory Code Review before merge.

---

## Folder Structure

```
time-tracking/
├─ package.json                      # root: workspaces + scripts
├─ tsconfig.base.json                # Base TS for all projects (path aliases etc.)
├─ README.md
├─ .gitignore
├─ .github/
│  └─ workflows/
│     ├─ ci.yml
│     └─ deploy.yml
│
├─ infra/
│  ├─ compose.yml
│  ├─ docker/
│  │  ├─ server.Dockerfile
│  │  ├─ employee.Dockerfile
│  │  └─ admin.Dockerfile
│  └─ nginx/                         # Optional
│     └─ default.conf
│
├─ shared/
│  └─ types/                         # Shared for Backend + Frontend
│     ├─ package.json                # name: @shared/types
│     ├─ tsconfig.json
│     └─ src/
│        ├─ dtos/
│        │  ├─ auth.dto.ts
│        │  ├─ users.dto.ts
│        │  ├─ clients.dto.ts
│        │  ├─ projects.dto.ts
│        │  ├─ tasks.dto.ts
│        │  ├─ timeReports.dto.ts
│        │  ├─ timer.dto.ts
│        │  ├─ absences.dto.ts
│        │  ├─ monthClosure.dto.ts
│        │  └─ auditLog.dto.ts
│        ├─ enums/
│        │  ├─ roles.enum.ts
│        │  ├─ entityStatus.enum.ts
│        │  ├─ absenceType.enum.ts
│        │  ├─ absenceStatus.enum.ts
│        │  ├─ locationType.enum.ts
│        │  └─ auditAction.enum.ts
│        ├─ constants/
│        │  └─ workday.constants.ts   # e.g. WORKDAY_MINUTES=540
│        ├─ index.ts                  # export * from './dtos/...', './enums/...'
│        └─ zod/                      # Optional: shared validation schemas
│           ├─ auth.schema.ts
│           ├─ timeReports.schema.ts
│           └─ absences.schema.ts
│
├─ server/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ src/
│  │  ├─ app.ts                       # bootstrap express
│  │  ├─ routes.ts                    # aggregates all modules
│  │  ├─ config/
│  │  │  ├─ env.ts
│  │  │  ├─ jwt.ts
│  │  │  ├─ swagger.ts
│  │  │  └─ upload.ts                 # file size/types
│  │  ├─ db/
│  │  │  ├─ index.ts                  # db client init
│  │  │  ├─ migrations/               # SQL migrations (or prisma/)
│  │  │  └─ seed.ts
│  │  ├─ middlewares/
│  │  │  ├─ auth.middleware.ts        # JWT + role + active
│  │  │  ├─ validate.middleware.ts    # zod/joi + shared schemas
│  │  │  ├─ error.middleware.ts
│  │  │  └─ requestId.middleware.ts
│  │  ├─ shared/
│  │  │  ├─ errors.ts
│  │  │  ├─ logger.ts
│  │  │  ├─ pagination.ts
│  │  │  └─ time.ts                   # time calculations, rounding
│  │  └─ modules/
│  │     ├─ auth/
│  │     │  ├─ auth.routes.ts
│  │     │  ├─ auth.controller.ts
│  │     │  ├─ auth.service.ts
│  │     │  └─ auth.repo.ts
│  │     ├─ users/
│  │     │  ├─ users.routes.ts
│  │     │  ├─ users.controller.ts
│  │     │  ├─ users.service.ts
│  │     │  └─ users.repo.ts
│  │     ├─ clients/
│  │     │  ├─ clients.routes.ts
│  │     │  ├─ clients.controller.ts
│  │     │  ├─ clients.service.ts
│  │     │  └─ clients.repo.ts
│  │     ├─ projects/
│  │     │  ├─ projects.routes.ts
│  │     │  ├─ projects.controller.ts
│  │     │  ├─ projects.service.ts
│  │     │  └─ projects.repo.ts
│  │     ├─ tasks/
│  │     │  ├─ tasks.routes.ts
│  │     │  ├─ tasks.controller.ts
│  │     │  ├─ tasks.service.ts
│  │     │  └─ tasks.repo.ts
│  │     ├─ task-assignments/
│  │     │  ├─ taskAssignments.routes.ts
│  │     │  ├─ taskAssignments.controller.ts
│  │     │  ├─ taskAssignments.service.ts
│  │     │  └─ taskAssignments.repo.ts
│  │     ├─ time-reports/
│  │     │  ├─ timeReports.routes.ts
│  │     │  ├─ timeReports.controller.ts
│  │     │  ├─ timeReports.service.ts
│  │     │  ├─ timeReports.repo.ts
│  │     │  └─ workday.service.ts     # recalcWorkday + business rules
│  │     ├─ timer/
│  │     │  ├─ timer.routes.ts
│  │     │  ├─ timer.controller.ts
│  │     │  ├─ timer.service.ts
│  │     │  └─ timer.repo.ts
│  │     ├─ absences/
│  │     │  ├─ absences.routes.ts
│  │     │  ├─ absences.controller.ts
│  │     │  ├─ absences.service.ts
│  │     │  ├─ absences.repo.ts
│  │     │  └─ absences.documents.ts  # upload/attach
│  │     ├─ month-closure/
│  │     │  ├─ monthClosure.routes.ts
│  │     │  ├─ monthClosure.controller.ts
│  │     │  ├─ monthClosure.service.ts
│  │     │  └─ monthClosure.repo.ts
│  │     ├─ audit-log/
│  │     │  ├─ auditLog.routes.ts
│  │     │  ├─ auditLog.controller.ts
│  │     │  ├─ auditLog.service.ts
│  │     │  └─ auditLog.repo.ts
│  │     └─ notifications/
│  │        ├─ notifications.routes.ts
│  │        ├─ notifications.controller.ts
│  │        ├─ notifications.service.ts
│  │        └─ notifications.repo.ts
│  └─ tests/
│     ├─ unit/
│     └─ helpers/
│
├─ client/
│  ├─ package.json
│  ├─ tsconfig.base.json
│  ├─ packages/
│  │  ├─ ui/                          # Shared components (RTL, Mobile-first)
│  │  │  ├─ package.json
│  │  │  └─ src/
│  │  │     ├─ components/
│  │  │     └─ index.ts
│  │  ├─ api-client/                  # Shared API client (auth headers, future refresh)
│  │  │  ├─ package.json
│  │  │  └─ src/
│  │  │     ├─ http.ts
│  │  │     ├─ auth.ts
│  │  │     └─ index.ts
│  │  └─ utils/
│  │     ├─ package.json
│  │     └─ src/
│  │        ├─ date.ts
│  │        ├─ format.ts
│  │        └─ index.ts
│  │
│  └─ apps/
│     ├─ employee/                    # React Employee App (runs separately)
│     │  ├─ package.json              # name: @client/employee
│     │  ├─ vite.config.ts (or next.config.js)
│     │  └─ src/
│     │     ├─ app/                   # routing
│     │     ├─ pages/
│     │     │  ├─ LoginPage.tsx
│     │     │  ├─ ChangePasswordPage.tsx
│     │     │  ├─ DailyReportPage.tsx
│     │     │  └─ AbsencePage.tsx
│     │     ├─ components/
│     │     │  ├─ TimerCard.tsx
│     │     │  ├─ WorkdayProgress.tsx
│     │     │  ├─ TimeEntryForm.tsx
│     │     │  └─ FrequentSelectors.tsx
│     │     ├─ api/                   # app-specific wrappers
│     │     │  └─ employeeApi.ts
│     │     ├─ styles/
│     │     │  └─ rtl.css
│     │     └─ main.tsx
│     │
│     └─ admin/                       # React Admin App (runs separately)
│        ├─ package.json              # name: @client/admin
│        ├─ vite.config.ts (or next.config.js)
│        └─ src/
│           ├─ app/
│           ├─ pages/
│           │  ├─ Users.tsx
│           │  ├─ Clients.tsx
│           │  ├─ Projects.tsx
│           │  ├─ Tasks.tsx
│           │  ├─ Assignments.tsx
│           │  ├─ MonthClosure.tsx
│           │  └─ AuditLogs.tsx
│           ├─ components/
│           │  ├─ CrudTable.tsx
│           │  └─ EntityFormDrawer.tsx
│           ├─ api/
│           │  └─ adminApi.ts
│           └─ main.tsx
```