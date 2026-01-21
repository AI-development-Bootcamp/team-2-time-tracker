# Time Tracking System - Project Overview

> **Auto-generated Reference** | Last Updated: 2026-01-21
> 
> This file consolidates key information to serve as a quick context guide for agents and developers.

---

## 1. Project Overview

**Purpose**: Unified platform for managing employee work hours and absences with strict validation and transparency.

**Key Characteristics**:
- Mobile-first design with RTL support (Hebrew)
- Standard workday: **9 hours (540 minutes)**
- Server-side timer for continuity
- Month locking for payroll processing
- Comprehensive audit trail

---

## 2. Technical Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT (AccessToken 2h + RefreshToken in DB)
- **Validation**: Zod schemas
- **Testing**: Vitest (60%+ coverage target)
- **Security**: helmet, express-rate-limit, cors, bcrypt (12 rounds)

### Frontend
- **Framework**: React + TypeScript + Vite
- **State**: Zustand (global) + TanStack Query (server state)
- **UI**: Radix UI primitives + Native CSS (BEM method)
- **Forms**: react-hook-form + Zod resolvers
- **Icons**: lucide-react
- **Routing**: React Router

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions → Render deployment

---

## 3. Core Entities & Database Schema

| Entity Category | Tables | Description |
|-----------------|--------|-------------|
| **Users & Auth** | `users`, `refresh_tokens` | Employee/Admin roles, JWT auth |
| **Organization** | `clients`, `projects`, `tasks` | 3-level hierarchy |
| **Assignments** | `task_assignments` | User-task mapping (unique constraint) |
| **Time Tracking** | `timers`, `time_entries` | Server-side timer + permanent records |
| **Workday** | `workday_summaries`, `month_locks` | Daily aggregation + payroll locking |
| **Absences** | `absence_requests`, `absence_days`, `absence_documents` | Separate from workday, contributes to totals |
| **Audit** | `audit_logs` | Admin action tracking |

### Key Enums
```typescript
UserRole: EMPLOYEE | ADMIN
EntityStatus: ACTIVE | INACTIVE
TaskStatus: OPEN | CLOSED
WorkLocation: OFFICE | CLIENT | HOME
AbsenceType: VACATION | SICK | RESERVES | OTHER
AbsenceStatus: PENDING_DOCUMENT | SUBMITTED
TimeEntrySource: MANUAL | TIMER
ReportType: TOTAL_HOURS | ENTRY_EXIT
```

### Critical Constraints
- `task_assignments`: Unique `(userId, taskId)`
- `workday_summaries`: Unique `(userId, workDate)`
- `time_entries`: Description 10-500 chars, `endTime > startTime`
- `projects` & `tasks`: Optional date ranges with `endDate >= startDate`

---

## 4. API Endpoints Summary

**Base URL**: `/api/v1` | **Auth**: JWT Bearer Token

### Authentication (🔓 Public)
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/change-password` 👤 - Change password
- `GET /auth/me` 👤 - Get current user profile
- `POST /auth/logout` 👤 - Invalidate refresh token

### Workday (👤 Authenticated)
- `GET /workday/:date` - Get workday summary with entries
- `POST /workday/:date/submit` - Submit day (requires 540 min allocation)
- `POST /workday/:date/cancel` - Cancel submission
- `GET /workday/calendar/:month` - Monthly calendar view

### Time Entries (👤)
- `POST /time-entries` - Create entry (timer must be OFF)
- `GET /time-entries/:id` - Get single entry
- `PUT /time-entries/:id` - Update entry
- `DELETE /time-entries/:id` - Soft delete entry
- `GET /time-entries/history` - Paginated history with filters
- `POST /time-entries/batch` - Create multiple entries

### Timer (👤)
- `POST /timer/start` - Start server-side timer
- `POST /timer/stop` - Stop timer & create entry
- `GET /timer/status` - Get current timer status
- `DELETE /timer/cancel` - Cancel timer without saving

### Absences (👤)
- `POST /absences` - Create absence request
- `GET /absences` - List user's absences
- `GET /absences/:id` - Get single absence
- `PUT /absences/:id` - Update absence
- `DELETE /absences/:id` - Delete absence
- `POST /absences/:id/documents` - Upload document (multipart)
- `GET /absences/:id/documents` - List documents
- `GET /absences/:id/documents/:docId/download` - Download file
- `DELETE /absences/:id/documents/:docId` - Delete document

### Selectors (👤)
- `GET /selectors/clients` - Client dropdown (alpha/frequency sort)
- `GET /selectors/projects?clientId` - Project dropdown
- `GET /selectors/tasks?projectId` - Task dropdown
- `GET /my/assignments` - User's assigned tasks
- `GET /my/statistics/:month` - Monthly stats

### Admin - Users (🛡️ Admin Only)
- `GET /admin/users` - List all users (pagination, filters)
- `POST /admin/users` - Create user
- `GET /admin/users/:id` - Get user
- `PUT /admin/users/:id` - Update user
- `PUT /admin/users/:id/status` - Activate/deactivate
- `POST /admin/users/:id/reset-password` - Reset password

### Admin - Entities (🛡️)
**Clients**:
- `GET /admin/clients`, `POST /admin/clients`, `GET /admin/clients/:id`
- `PUT /admin/clients/:id`, `PUT /admin/clients/:id/status`

**Projects**:
- `GET /admin/projects?clientId&userId`, `POST /admin/projects`
- `GET /admin/projects/:id`, `PUT /admin/projects/:id`
- `PUT /admin/projects/:id/status`, `GET /admin/projects/:id/users`

**Tasks**:
- `GET /admin/tasks?projectId`, `POST /admin/tasks`
- `GET /admin/tasks/:id`, `PUT /admin/tasks/:id`
- `PUT /admin/tasks/:id/status`

### Admin - Assignments (🛡️)
- `GET /admin/assignments?userId&taskId&projectId&userName` - List with filters
- `POST /admin/assignments` - Create single assignment
- `POST /admin/assignments/bulk` - Bulk create (cartesian product)
- `GET /admin/assignments/:id` - Get assignment
- `DELETE /admin/assignments/:id` - Remove assignment

### Admin - Reports (🛡️)
- `GET /admin/reports/dashboard` - Overview statistics
- `GET /admin/reports/users/:userId/month/:month` - User monthly report
- `GET /admin/reports/users/:userId/month/:month/export` - CSV export

### Admin - Month Locks (🛡️)
- `GET /admin/month-locks` - List all locks
- `POST /admin/month-locks` - Lock month
- `PUT /admin/month-locks/:id/unlock` - Unlock month

### Admin - Audit Logs (🛡️)
- `GET /admin/audit-logs` - List audit trail (pagination, filters)

---

## 5. Key DTOs

### Authentication
```typescript
LoginRequestDto { email, password, rememberMe? }
LoginResponseDto { token, refreshToken, expiresIn, user, mustChangePassword }
UserDto { id, fullName, email, role }
```

### Workday
```typescript
WorkdaySummaryDto {
  targetMinutes: 540,
  workMinutes, absenceMinutes, totalMinutes,
  balanceMinutes, completionPercentage,
  isLocked, isSubmitted, submittedAt
}
```

### Time Entries
```typescript
TimeEntryDto {
  id, workDate, startTime, endTime, durationMinutes,
  location, description, source,
  task: { id, name, project, client }
}
CreateTimeEntryRequestDto {
  workDate, startTime, endTime, location, taskId, description
}
```

### Timer
```typescript
TimerDto { id, userId, workDate, startedAt, stoppedAt, durationMinutes, isRunning }
TimerStatusResponseDto { isRunning, elapsedMinutes, timer }
```

### Absences
```typescript
AbsenceRequestDto {
  id, userId, type, startDate, endDate, isHalfDay,
  status, note, documents[], absenceDays[]
}
AbsenceDayDto { id, absenceRequestId, userId, workDate, minutes }
```

### Admin - Assignments
```typescript
TaskAssignmentDto {
  id, userId, taskId, createdAt,
  userName, userEmail, taskName,
  projectId, projectName, clientId, clientName
}
CreateTaskAssignmentRequestDto { userId, taskId }
BulkCreateTaskAssignmentsRequestDto { userIds[], taskIds[] }
```

### Admin - Entities
```typescript
ClientDto { id, name, description, status, createdAt, updatedAt }
ProjectDto { id, name, clientId, status, reportType, startDate?, endDate? }
TaskDto { id, name, projectId, status, startDate?, endDate? }
```

---

## 6. Business Rules & Validations

### Time Tracking
- **Standard Day**: 540 minutes (9 hours)
- **Timer**: Only one running timer per user (server-side)
- **Manual Entry**: Allowed only when timer is OFF
- **Validation**:
  - No negative duration
  - Description 10-500 chars
  - No future dates
  - Task must be assigned to user
  - `endTime > startTime`

### Report Types (Project Level)
- **TOTAL_HOURS**: Standard accumulation
- **ENTRY_EXIT**: Strict check-in/out (max 1 entry/project/day, 540±5 mins)

### Workday Management
- **Status**: `FULL` (9h), `MISSING` (<9h), `EXCEPTION` (>9h)
- **Locking**: Month lock prevents all edits (Status 400)
- **Submission**: Requires exactly 540 minutes allocated (blocking validation)

### Absences
- **Document Validation**: Mandatory for SICK/RESERVES (status: `PENDING_DOCUMENT`)
- **9-Hour Rule**: `workMinutes + absenceMinutes = 540`
- **Weekends**: Exclude Friday-Saturday (Israeli workweek)

### Admin Actions
- **Soft Delete**: Entities become INACTIVE (no physical deletion)
- **Task Assignment**: Unique constraint prevents duplicates
- **Audit Trail**: All admin actions logged

---

## 7. Project Structure

```
time-tracking/
├─ shared/types/              # Shared DTOs, enums, Zod schemas
│  ├─ src/dtos/               # All DTO definitions
│  ├─ src/zod/                # Zod validation schemas
│  └─ src/index.ts            # Exports
│
├─ server/
│  ├─ src/
│  │  ├─ app.ts               # Express bootstrap
│  │  ├─ config/              # env, jwt, swagger, upload
│  │  ├─ db/                  # Prisma client, migrations, seed
│  │  ├─ middlewares/         # auth, validate, error, requestId
│  │  ├─ shared/              # errors, logger, pagination, time utils
│  │  └─ modules/             # Feature modules (routes, controller, service, repo)
│  │     ├─ auth/
│  │     ├─ users/
│  │     ├─ clients/, projects/, tasks/
│  │     ├─ admin/
│  │     │  ├─ users/
│  │     │  ├─ entities/      # clients, projects, tasks
│  │     │  ├─ assignments/
│  │     │  ├─ reports/
│  │     │  └─ month-locks/
│  │     ├─ time-entries/
│  │     ├─ timer/
│  │     ├─ absences/
│  │     ├─ workday/
│  │     └─ audit-log/
│  └─ tests/unit/
│
├─ client/
│  ├─ packages/
│  │  ├─ ui/                  # Shared components (RTL-ready)
│  │  ├─ api-client/          # HTTP client with auth
│  │  └─ utils/               # Date, format helpers
│  └─ apps/
│     ├─ employee/            # React employee app
│     └─ admin/               # React admin app
│
└─ infra/
   ├─ compose.yml
   └─ docker/
```

---

## 8. Development Requirements

### Quality
- **Testing**: Unit tests with 60%+ coverage (Vitest)
- **Documentation**: All endpoints in Swagger/OpenAPI
- **Git Workflow**: PRs with code review, protected main branch

### Frontend Requirements
- **Auto-Select**: Single-option dropdowns auto-select
- **Timer Banner**: Fixed top banner when timer running (visible on all pages)
- **Progress Indicator**: Visual feedback for workday status (red/green/orange)

### Service Layer Validations
**Workday Submission**:
1. Month not locked (`WORKDAY_001`)
2. Total = 540 minutes (`WORKDAY_002`) - **BLOCKING**
3. Not already submitted (`WORKDAY_003`)

**Time Entry Creation**:
1. Timer NOT running (`TIMER_001`)
2. Month not locked (`WORKDAY_001`)
3. Task assigned to user (`VALIDATION_001`)
4. Description 10-500 chars (`VALIDATION_001`)

---

## 9. Constants

```typescript
WORKDAY_MINUTES = 540        // 9 hours
HALF_DAY_MINUTES = 270       // 4.5 hours
FULL_DAY_MINUTES = 540       // 9 hours
JWT_EXPIRES_IN = 7200        // 2 hours
REFRESH_TOKEN_EXPIRES = 30d  // if rememberMe
```

---

## 10. Reference Files

For detailed information, refer to:
- **API Endpoints**: `project-features/endpoints.md`
- **DTOs**: `project-features/dtos.md`
- **Database Schema**: `project-features/schemes.md`
- **Tech Stack**: `project-features/stack.md`
- **Project Summary**: `project-features/projectsummery.md`
- **Backend Rules**: `RULES-backend.MD`
- **Frontend Rules**: `RULES-frontend.MD`
