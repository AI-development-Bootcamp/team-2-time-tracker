# Project Context Summary

> **Auto-generated Reference**
> This file consolidates key information from the `project-features` directory to serve as a quick context guide for agents and developers.

## 1. Project Overview
The **Time Tracking System** is a unified platform for managing employee work hours and absences.
- **Target Audience**: Employees (reporting time) and Admins (managing entities and reports).
- **Key Characteristics**: Mobile-first design, RTL support (Hebrew), strict data validation.
- **Core Workflow**: Users log time via **Timer** or **Manual Entries** to reach a daily target of **9 hours (540 minutes)**.

## 2. Technical Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT (AccessToken + RefreshToken in DB)
- **Validation**: Zod
- **Testing**: Vitest

### Frontend
- **Framework**: React + TypeScript + Vite
- **State Management**: Zustand (Global), TanStack Query (Server State)
- **UI**: Radix UI (Primitives), Native CSS (BEM method), lucide-react (Icons)
- **Forms**: react-hook-form + Zod resolvers
- **Routing**: React Router

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions, Render

## 3. Core Entities & Database

| Entity category | Tables | Description |
|-----------------|--------|-------------|
| **Users & Auth** | `users`, `refresh_tokens` | Employee/Admin roles, secure auth. |
| **Organization** | `clients`, `projects`, `tasks` | 3-level hierarchy. Tasks are assigned to users via `task_assignments`. |
| **Time Tracking** | `timers`, `time_entries` | `timers` allow server-side tracking. `time_entries` are the permanent records. |
| **Workday** | `workday_summaries`, `month_locks` | Aggregates daily minutes. `month_locks` freeze periods for payroll. |
| **Absences** | `absence_requests`, `absence_days`, `absence_documents` | Managed separately but contribute to workday totals. |
| **Audit** | `audit_logs` | Tracks admin actions on critical entities. |

## 4. Key Business Rules

### Time Tracking
- **Standard Day**: 540 minutes (9 hours).
- **Timer**: Only one running timer per user. Server-side calculation.
- **Manual Entry**: Allowed only if timer is NOT running.
- **Validation**:
  - No negative duration.
  - Description length 10-500 chars.
  - No future dates.
  - Task must be assigned to user.

### Report Types (Project Level)
- **TOTAL_HOURS**: Standard accumulation of hours.
- **ENTRY_EXIT**: Strict "Check-in / Check-out" style. Max 1 entry per project per day. Duration must be 540 ± 5 mins.

### Workday Management
- **Status**: FULL (9h reached), MISSING (<9h), EXCEPTION (>9h).
- **Locking**: Once a month is locked by Admin, no changes allowed (Status 400).
- **Submissions**: Users must "submit" their day to finalize it.

## 5. Developer Responsibilities

| Developer | Scope |
|-----------|-------|
| **Dev 1** | **Foundation**: Setup, Auth, User Management, Helper Utils. |
| **Dev 2** | **Time Core**: Timer, Manual Entries, Workday Summary, Selectors. |
| **Dev 3** | **Absences**: Request flows, Document uploads, Calendar integration. |
| **Dev 4** | **Admin**: Entity CRUD, Reports, Month Locking, Audit Logs. |

## 6. Directory Structure Reference
- `/server/src/modules/*`: Feature-based modules (controller, service, repo, routes).
- `/client/apps/employee`: Main employee application.
- `/client/apps/admin`: Admin management portal.
- `/shared/types`: DTOs and shared interfaces.

## 7. Detailed Reference Files
For deep-dive details, refer to these original files:
- **API Endpoints**: `project-features/endpoints.md`
- **Data Transfer Objects**: `project-features/dtos.md`
- **Database SQL**: `project-features/schemes.md`
- **Tech Stack**: `project-features/stack.md`
