# Change: Developer 1 - Infrastructure Setup, Authentication & User Management

## Why

This is the foundation layer that all other developers depend on. Developer 1 must establish the project infrastructure (monorepo, database, Docker, CI), implement authentication (JWT-based login/logout, password management), and create user management capabilities. Without this foundation, Developers 2, 3, and 4 cannot begin their work.

## What Changes

### Infrastructure Setup
- Monorepo structure with pnpm workspaces
- TypeScript configuration with shared base config
- PostgreSQL database with Prisma ORM
- Docker Compose for local development
- GitHub Actions CI pipeline
- ESLint + Prettier configuration
- Shared DTOs/types package (`@shared/types`)

### Authentication System
- JWT-based authentication with 2-hour token expiry
- Refresh token mechanism with blacklist for invalidation
- Mandatory password change on first login
- HTTP-only cookie support for token storage
- Role-based access control middleware (EMPLOYEE/ADMIN)

### User Management
- User model with roles, active status, password flags
- Profile endpoint for current user
- **BREAKING**: No self-service password recovery (admin-only)

## Impact

- **Affected specs**: `infrastructure`, `authentication`, `user-management`
- **Affected code**:
  - Root config files (`package.json`, `tsconfig.base.json`, `.eslintrc.js`)
  - `server/src/middlewares/auth.middleware.ts`
  - `server/src/modules/auth/*`
  - `server/src/modules/users/*`
  - `shared/types/src/*`
  - `client/packages/api-client/*`
  - `client/apps/employee/src/pages/LoginPage.tsx`
  - `client/apps/employee/src/pages/ChangePasswordPage.tsx`
  - `infra/compose.yml`
  - `.github/workflows/ci.yml`
- **Blocks**: All other developers (Dev 2, 3, 4)
- **Dependencies**: None (foundation layer)

## References

- Technical stack: `project-features/stack.md`
- Database schema: `project-features/schemes.md` (users table)
- API endpoints: `project-features/endpoints.md` (Authentication section)
- DTOs: `project-features/dtos.md` (Authentication section)
- Folder structure: `project-features/projectsummery.md`
- Developer rules: `server/CLAUDE.md`, `client/CLAUDE.md`
