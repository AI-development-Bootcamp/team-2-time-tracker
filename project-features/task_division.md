# Specifications Structure - Time Tracking System

## Division of Labor - 4 Developers

This document outlines the feature distribution among 4 developers. Each developer has a dedicated spec file with their responsibilities, covering **Setup**, **Backend**, and **Frontend** implementation.

---

## Developer Assignments Overview

| Developer | Focus Area | Spec File |
|-----------|------------|-----------|
| **Developer 1** | Project Setup & Authentication & User Management | `spec-dev1-setup-auth-users.md` |
| **Developer 2** | Time Tracking Core (Timer, Entries, Workday) | `spec-dev2-time-tracking.md` |
| **Developer 3** | Absences & Document Management | `spec-dev3-absences.md` |
| **Developer 4** | Admin Panel & Reporting | `spec-dev4-admin-reports.md` |

---

## Dependencies Graph

```
                    ┌─────────────────────┐
                    │    Developer 1      │
                    │  Setup + Auth       │
                    │  (Foundation Layer) │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   Developer 2    │ │   Developer 3    │ │   Developer 4    │
│  Time Tracking   │ │    Absences      │ │  Admin & Reports │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Integration     │
                    │   (All devs)      │
                    └───────────────────┘
```

---

## Dependency Details

### Developer 1 (Setup + Auth & Users) - **START FIRST**
- **Depends on:** Nothing (Foundation layer)
- **Blocks:** All other developers
- **Must complete before others can start:** Project scaffolding, DB connection, JWT middleware, User model, Role system

### Developer 2 (Time Tracking)
- **Depends on:** Developer 1 (Project setup, Auth, User model)
- **Blocks:** Developer 4 (Reports need time entries data)
- **Shared with:** Developer 3 (Workday summary calculation)

### Developer 3 (Absences)
- **Depends on:** Developer 1 (Project setup, Auth, User model)
- **Blocks:** Developer 4 (Reports include absence data)
- **Shared with:** Developer 2 (Workday summary calculation)

### Developer 4 (Admin & Reports)
- **Depends on:** All other developers (needs all entities to manage/report on)
- **Blocks:** None
- **Can start:** Admin entity CRUD (Clients, Projects, Tasks) in parallel with Dev 1 (after setup complete)

---

## Setup Responsibilities (Developer 1)

### Infrastructure Setup

| Category | Tasks |
|----------|-------|
| **Monorepo Setup** | |
| - Structure | Create monorepo folder structure as per `projectsummery.md` |
| - Package Manager | pnpm workspace configuration |
| - TypeScript | Shared tsconfig, path aliases |
| - Linting | ESLint + Prettier configuration |
| - Git | .gitignore, branch protection rules, PR template |
| **Backend Setup** | |
| - Express | Express.js server with TypeScript |
| - Database | PostgreSQL + Prisma ORM setup |
| - Prisma | Schema file, migrations workflow |
| - Environment | .env configuration, config service |
| - Security | Helmet, CORS, rate limiting setup |
| - Logging | Winston/Pino logger setup |
| - Error Handling | Global error handler, custom error classes |
| - API Docs | Swagger/OpenAPI setup |
| - Testing | Vitest configuration |
| **Frontend Setup** | |
| - Vite | Vite + React + TypeScript for both Employee & Admin apps |
| - Styling | BEM CSS structure, RTL support, Hebrew fonts |
| - Routing | React Router setup |
| - State | Zustand store boilerplate |
| - API Client | Axios instance with interceptors |
| - Forms | react-hook-form + Zod integration |
| - UI Library | Radix UI primitives setup |
| - Testing | Vitest + React Testing Library setup |
| **Shared Package** | |
| - DTOs | Shared types and Zod schemas package |
| - Build | Shared package build configuration |
| **DevOps** | |
| - Docker | Docker Compose for local development (PostgreSQL, app) |
| - CI | GitHub Actions workflow (lint, test, build) |
| - Scripts | Development scripts (dev, build, test, migrate) |

---

## Backend / Frontend Division Per Developer

### Developer 1 - Setup + Auth & Users

| Layer | Responsibilities |
|-------|-----------------|
| **Setup (see above)** | Full project infrastructure |
| **Backend** | |
| - Database | `users` table, password hashing setup |
| - API | `/auth/*` endpoints (login, logout, refresh, change-password) |
| - API | `/profile` endpoint |
| - Middleware | JWT validation, role-based access control |
| - Services | AuthService, UserService, Token management |
| - Validation | Zod schemas for auth DTOs |
| **Frontend** | |
| - Pages | Login page, Change password page |
| - Components | LoginForm, PasswordChangeForm, Layout shell |
| - State | Auth store (Zustand), token refresh logic |
| - Routing | Protected route wrapper, auth redirects |
| - API Layer | Auth API client, axios interceptors for JWT |
| - Shared Components | Button, Input, Modal, Toast (base components) |

---

### Developer 2 - Time Tracking

| Layer | Responsibilities |
|-------|-----------------|
| **Backend** | |
| - Database | `timers`, `time_entries`, `workday_summaries` tables |
| - API | `/workday/*`, `/time-entries/*`, `/timer/*` endpoints |
| - API | `/selectors/*` endpoints (clients, projects, tasks dropdowns) |
| - Services | TimerService, TimeEntryService, WorkdayService, SelectorService |
| - Business Logic | Workday calculation, time validation, timer state management |
| - Business Logic | Auto-select logic for dropdowns |
| **Frontend** | |
| - Pages | Dashboard (Employee), Time entry history |
| - Components | Timer widget, TimeEntryForm, TimeEntryList, WorkdayProgress bar |
| - Components | Selector dropdowns (Client → Project → Task cascade) |
| - State | Timer store, workday store, time entries query cache |
| - Features | Real-time timer display, animated timer banner, manual entry modal |
| - UI | Progress indicators (red/green/orange), daily summary card |

---

### Developer 3 - Absences & Documents

| Layer | Responsibilities |
|-------|-----------------|
| **Backend** | |
| - Database | `absence_requests`, `absence_days`, `absence_documents` tables |
| - API | `/absences/*` endpoints, document upload/download |
| - Services | AbsenceService, DocumentService, file storage |
| - Business Logic | Weekend exclusion (Israeli workweek Sun-Thu), half/full day calculation |
| - Business Logic | Absence days expansion algorithm |
| **Frontend** | |
| - Pages | Absence request page, Absence history |
| - Components | AbsenceForm, AbsenceCalendar, DocumentUploader, DocumentList |
| - State | Absences store, upload progress state |
| - Features | Date range picker (Hebrew locale), file drag & drop, document preview |
| - Validation | 10MB file limit, PDF/JPG/PNG types |

---

### Developer 4 - Admin Panel & Reporting

| Layer | Responsibilities |
|-------|-----------------|
| **Backend** | |
| - Database | `clients`, `projects`, `tasks`, `task_assignments`, `month_locks`, `audit_logs` tables |
| - API | `/admin/users/*` endpoints |
| - API | `/admin/clients/*`, `/admin/projects/*`, `/admin/tasks/*` endpoints |
| - API | `/admin/assignments/*` endpoints |
| - API | `/admin/reports/*` endpoints |
| - API | `/admin/month-locks/*` endpoints |
| - API | `/admin/audit-logs/*` endpoints |
| - Services | AdminService, ReportService, AuditLogService, MonthLockService |
| - Business Logic | CSV export, dashboard aggregation, soft delete, audit trail |
| **Frontend (Admin App)** | |
| - Pages | Admin Dashboard, User Management, Entity Management (Clients/Projects/Tasks), Reports, Audit Log viewer |
| - Components | DataTable (TanStack Table), UserForm, EntityForms, ReportFilters, MonthLockToggle |
| - State | Admin stores, report filters, pagination state |
| - Features | Bulk operations, CSV download, month lock/unlock, audit log search |
| - UI | Admin layout, sidebar navigation, data tables with sorting/filtering |

---

## Spec Files Structure

Each spec file will contain:

1. **Overview** - Feature scope and responsibilities
2. **Setup Tasks** (Dev 1 only) - Infrastructure and configuration
3. **Database Tables** - Tables owned by this feature (Prisma schema)
4. **API Endpoints** - Endpoints to implement (with request/response DTOs)
5. **Backend Implementation**
   - Services and business logic
   - Validation rules (Zod schemas)
   - Error handling
6. **Frontend Implementation**
   - Pages and routes
   - Components breakdown
   - State management (Zustand stores)
   - API integration (TanStack Query)
7. **Dependencies** - What this feature needs from others
8. **Provides** - What this feature provides to others
9. **Testing Requirements**
   - Backend: Unit tests, integration tests
   - Frontend: Component tests, E2E tests
10. **Acceptance Criteria** - Definition of done

---

## Parallel Work Strategy

### Phase 0 (Developer 1 Only - Setup)

| Developer | Tasks |
|-----------|-------|
| Dev 1 | Monorepo setup, Docker, CI, all infrastructure |
| Dev 2, 3, 4 | Review specs, plan implementation |

### Phase 1 (After Setup Complete)

| Developer | Backend | Frontend |
|-----------|---------|----------|
| Dev 1 | User model, Auth endpoints, JWT middleware | Login page, Auth flow |
| Dev 4 | Client/Project/Task models & CRUD | Admin layout, Entity forms (mocked API) |

### Phase 2 (After Auth Complete)

| Developer | Backend | Frontend |
|-----------|---------|----------|
| Dev 2 | Timer, Time Entries, Workday endpoints | Dashboard, Timer widget |
| Dev 3 | Absence requests, Document upload | Absence forms, Calendar |

### Phase 3 (Integration)

| Developer | Backend | Frontend |
|-----------|---------|----------|
| Dev 4 | Reports, Dashboard aggregation, Month locks | Reports page, Audit log viewer |
| All | Integration testing | Full E2E flows |

---

## Shared Components

### Backend Shared

| Component | Owner | Used By |
|-----------|-------|---------|
| Project Structure & Config | Dev 1 | All |
| Prisma Client & Migrations | Dev 1 | All |
| JWT Middleware | Dev 1 | All |
| User Model & Types | Dev 1 | All |
| Standard Response Wrapper | Dev 1 | All |
| Pagination Utils | Dev 1 | Dev 2, 3, 4 |
| Error Classes | Dev 1 | All |
| Logger | Dev 1 | All |
| Audit Log Service | Dev 4 | Dev 1, 2, 3 |
| Workday Calculation Logic | Dev 2 + Dev 3 | Dev 4 |
| Zod Validation Schemas (base) | Dev 1 | All |

### Frontend Shared

| Component | Owner | Used By |
|-----------|-------|---------|
| Vite Config & Build Setup | Dev 1 | All |
| Auth Context / Store | Dev 1 | All |
| Axios Instance (with interceptors) | Dev 1 | All |
| Protected Route Wrapper | Dev 1 | All |
| Common UI Components (Button, Input, Modal) | Dev 1 | All |
| Toast/Notification System | Dev 1 | All |
| Form Validation (react-hook-form + Zod) | Dev 1 (setup) | All |
| Date Picker (Hebrew locale) | Dev 3 | Dev 2, 4 |
| DataTable Component | Dev 4 | Dev 2, 3 |

---

## Folder Ownership

### Root Level

```
/
├── docker-compose.yml                  # Dev 1
├── .github/workflows/                  # Dev 1
├── package.json (workspace root)       # Dev 1
├── pnpm-workspace.yaml                 # Dev 1
├── tsconfig.base.json                  # Dev 1
├── .eslintrc.js                        # Dev 1
├── .prettierrc                         # Dev 1
└── README.md                           # Dev 1
```

### Backend (`/backend`)

```
/backend
├── prisma/
│   └── schema.prisma                   # Dev 1 (structure), All (their tables)
├── /src
│   ├── /config                         # Dev 1
│   ├── /middleware
│   │   ├── auth.middleware.ts          # Dev 1
│   │   ├── error.middleware.ts         # Dev 1
│   │   └── validation.middleware.ts    # Dev 1
│   ├── /modules
│   │   ├── /auth                       # Dev 1
│   │   ├── /users                      # Dev 1
│   │   ├── /timer                      # Dev 2
│   │   ├── /time-entries               # Dev 2
│   │   ├── /workday                    # Dev 2
│   │   ├── /selectors                  # Dev 2
│   │   ├── /absences                   # Dev 3
│   │   ├── /documents                  # Dev 3
│   │   └── /admin                      # Dev 4
│   │       ├── /users                  # Dev 4
│   │       ├── /entities               # Dev 4
│   │       ├── /assignments            # Dev 4
│   │       ├── /reports                # Dev 4
│   │       ├── /audit                  # Dev 4
│   │       └── /month-locks            # Dev 4
│   ├── /shared                         # Dev 1 (maintained by all)
│   │   ├── /errors                     # Dev 1
│   │   ├── /utils                      # Dev 1
│   │   └── /types                      # Dev 1
│   └── app.ts                          # Dev 1
```

### Frontend Employee App (`/frontend/employee`)

```
/frontend/employee
├── vite.config.ts                      # Dev 1
├── /src
│   ├── /pages
│   │   ├── /login                      # Dev 1
│   │   ├── /change-password            # Dev 1
│   │   ├── /dashboard                  # Dev 2
│   │   ├── /time-entries               # Dev 2
│   │   └── /absences                   # Dev 3
│   ├── /components
│   │   ├── /auth                       # Dev 1
│   │   ├── /layout                     # Dev 1
│   │   ├── /timer                      # Dev 2
│   │   ├── /time-entry                 # Dev 2
│   │   ├── /workday                    # Dev 2
│   │   ├── /selectors                  # Dev 2
│   │   ├── /absence                    # Dev 3
│   │   └── /shared                     # Dev 1 (maintained by all)
│   ├── /stores
│   │   ├── auth.store.ts               # Dev 1
│   │   ├── timer.store.ts              # Dev 2
│   │   ├── workday.store.ts            # Dev 2
│   │   └── absence.store.ts            # Dev 3
│   ├── /api                            # Dev 1 (base), All (their modules)
│   ├── /hooks                          # Owner per feature
│   └── /styles                         # Dev 1 (base), All (their modules)
```

### Frontend Admin App (`/frontend/admin`)

```
/frontend/admin
├── vite.config.ts                      # Dev 1 (setup), Dev 4 (owns)
├── /src
│   ├── /pages                          # Dev 4
│   ├── /components                     # Dev 4
│   ├── /stores                         # Dev 4
│   ├── /api                            # Dev 4
│   └── /styles                         # Dev 4
```

### Shared Package (`/shared`)

```
/shared
├── package.json                        # Dev 1
├── tsconfig.json                       # Dev 1
├── /src
│   ├── /dtos                           # Dev 1 (structure), All (their DTOs)
│   ├── /schemas                        # Dev 1 (structure), All (their schemas)
│   ├── /types                          # Dev 1 (structure), All (their types)
│   └── /enums                          # Dev 1
```
