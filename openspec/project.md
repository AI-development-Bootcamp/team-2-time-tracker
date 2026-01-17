# Project Context

## Purpose

The Time Tracking System is designed to provide a simple and efficient solution for managing and reporting work hours, creating a structured and unified mechanism that reduces errors and improves transparency between employees and administrators. The system is designed with a Mobile-first approach and fully supports Hebrew (RTL).

## Tech Stack

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication (2-hour token expiry, refresh tokens)
- Winston/Pino for logging
- Swagger/OpenAPI for documentation

### Frontend
- React with TypeScript
- Vite for build tooling
- Zustand for state management
- TanStack Query (React Query) for data fetching
- React Hook Form + Zod for form validation
- Radix UI for accessible components
- RTL (Right-to-Left) support for Hebrew

### Infrastructure
- pnpm workspaces (monorepo)
- Docker Compose for local development
- GitHub Actions for CI/CD
- ESLint + Prettier for code quality

### Shared
- `@shared/types` package for shared DTOs, enums, and Zod schemas

## Project Conventions

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- BEM CSS methodology for styling
- Kebab-case for file names
- PascalCase for React components
- camelCase for variables and functions

### Architecture Patterns
- Monorepo structure with pnpm workspaces
- Modular backend structure (`server/src/modules/`)
- Shared types package for DTOs and validation
- RESTful API design with `/api/v1` prefix
- Standard response wrapper: `{ success: boolean, data: T, message?: string }`
- Soft delete pattern (status-based, no physical deletion)
- Audit logging for all admin actions

### Testing Strategy
- Minimum 60% code coverage requirement
- Vitest for backend unit tests
- Vitest + React Testing Library for frontend tests
- Integration tests for API endpoints
- Test helpers for mocking Prisma and test database

### Git Workflow
- Pull Requests (PR) required for all changes
- Branch protection on main branch
- Mandatory code review before merge
- PR template for structured reviews

## Domain Context

### Business Rules
- **Standard Workday**: 9 hours (540 minutes)
- **Half Day Absence**: 4.5 hours (270 minutes)
- **Workweek**: Sunday-Thursday (Israeli calendar, Friday-Saturday excluded)
- **Month Lock**: Prevents all edits to workdays/time entries for payroll processing
- **Mandatory Allocation**: Cannot submit workday unless exactly 540 minutes allocated
- **Timer Restriction**: Only one active timer per user at a time
- **Manual Entry Restriction**: Cannot create manual entries while timer is running

### User Roles
- **EMPLOYEE**: Can track time, report absences, view own reports
- **ADMIN**: Full system access including user management, entity management, reports, month locks, audit logs

### Time Tracking Methods
- **Timer**: Server-side timer that creates time entry on stop
- **Manual Entry**: Direct time entry creation (only when timer is off)

### Absence Types
- **VACATION**: Vacation leave
- **SICK**: Sick leave (requires document)
- **RESERVES**: Military reserves (requires document)
- **OTHER**: Other absence types

### Project Report Types
- **TOTAL_HOURS**: Employee reports start/end time for each task (סכום שעות)
- **ENTRY_EXIT**: Employee reports entry/exit times for workday (כניסה/יציאה)

### Validation Rules
- Description: 10-500 characters (enforced at DB level)
- Password: Minimum 8 characters, must include uppercase, lowercase, number, special character
- File uploads: PDF, JPG, PNG up to 10MB
- Date format: `YYYY-MM-DD` (ISO 8601)
- Time format: `HH:MM` (24-hour)

## Important Constraints

### Security
- No self-service password recovery (admin-only password reset)
- Mandatory password change on first login
- JWT tokens expire after 2 hours
- Refresh tokens use blacklist for invalidation
- HTTP-only cookies supported for token storage
- Role-based access control (RBAC) middleware

### Data Integrity
- Soft delete pattern: Entities marked as INACTIVE, not physically deleted
- Month locks prevent edits after payroll processing
- Audit trail for all admin actions
- Validation at both API and database levels

### Localization
- Hebrew (RTL) support required
- Mobile-first responsive design
- Date/time formatting for Israeli locale

### Performance
- Pagination required for all list endpoints (default 20, max 100)
- Indexes on foreign keys and frequently queried fields
- Efficient aggregation queries for dashboard statistics

## External Dependencies

### Database
- PostgreSQL (via Docker Compose for local development)
- Prisma ORM for database access and migrations

### Authentication
- JWT (JSON Web Tokens) for authentication
- bcrypt for password hashing (12 rounds)

### File Storage
- Local file storage for absence documents (can be extended to S3/cloud storage)

### Development Tools
- Docker Compose for local PostgreSQL
- GitHub Actions for CI/CD pipeline
