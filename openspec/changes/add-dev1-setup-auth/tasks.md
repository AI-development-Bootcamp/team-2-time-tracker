# Tasks: Developer 1 - Infrastructure Setup, Authentication & User Management

## 1. Infrastructure Setup

### 1.1 Monorepo Structure
- [ ] 1.1.1 Initialize root `package.json` with pnpm workspaces
- [ ] 1.1.2 Create `pnpm-workspace.yaml` configuration
- [ ] 1.1.3 Create `tsconfig.base.json` with path aliases
- [ ] 1.1.4 Configure ESLint (`.eslintrc.js`) for TypeScript
- [ ] 1.1.5 Configure Prettier (`.prettierrc`)
- [ ] 1.1.6 Create comprehensive `.gitignore`
- [ ] 1.1.7 Create PR template (`.github/pull_request_template.md`)

### 1.2 Shared Types Package
- [ ] 1.2.1 Create `shared/types/package.json` with `@shared/types` name
- [ ] 1.2.2 Create `shared/types/tsconfig.json`
- [ ] 1.2.3 Create enums: `roles.enum.ts`, `entityStatus.enum.ts`, `absenceType.enum.ts`, `absenceStatus.enum.ts`, `locationType.enum.ts`, `auditAction.enum.ts`, `timeEntrySource.enum.ts`, `reportType.enum.ts`
- [ ] 1.2.4 Create constants: `workday.constants.ts` (WORKDAY_MINUTES=540, HALF_DAY_MINUTES=270)
- [ ] 1.2.5 Create auth DTOs: `auth.dto.ts`
- [ ] 1.2.6 Create users DTOs: `users.dto.ts`
- [ ] 1.2.7 Create shared Zod schemas: `auth.schema.ts`
- [ ] 1.2.8 Create barrel export `index.ts`
- [ ] 1.2.9 Configure build with tsup or tsc

### 1.3 Backend Setup
- [ ] 1.3.1 Create `server/package.json` with dependencies
- [ ] 1.3.2 Create `server/tsconfig.json` extending base
- [ ] 1.3.3 Create `server/src/app.ts` (Express bootstrap)
- [ ] 1.3.4 Create `server/src/routes.ts` (route aggregator)
- [ ] 1.3.5 Create `server/src/config/env.ts` (Zod-validated environment)
- [ ] 1.3.6 Create `server/src/config/jwt.ts`
- [ ] 1.3.7 Create `server/src/config/swagger.ts` (OpenAPI setup)
- [ ] 1.3.8 Create `server/src/config/upload.ts` (file size/types)
- [ ] 1.3.9 Configure Winston/Pino logger (`server/src/shared/logger.ts`)
- [ ] 1.3.10 Create custom error classes (`server/src/shared/errors.ts`)
- [ ] 1.3.11 Create pagination utilities (`server/src/shared/pagination.ts`)
- [ ] 1.3.12 Create time utilities (`server/src/shared/time.ts`)

### 1.4 Database Setup
- [ ] 1.4.1 Initialize Prisma (`npx prisma init`)
- [ ] 1.4.2 Create `prisma/schema.prisma` with User model
- [ ] 1.4.3 Create `server/src/db/index.ts` (Prisma client singleton)
- [ ] 1.4.4 Create initial migration for users table
- [ ] 1.4.5 Create `server/src/db/seed.ts` with admin user

### 1.5 Middleware Setup
- [ ] 1.5.1 Create `error.middleware.ts` (global error handler)
- [ ] 1.5.2 Create `requestId.middleware.ts`
- [ ] 1.5.3 Create `validate.middleware.ts` (Zod validation)
- [ ] 1.5.4 Configure helmet security middleware
- [ ] 1.5.5 Configure CORS middleware
- [ ] 1.5.6 Configure express-rate-limit
- [ ] 1.5.7 Configure cookie-parser

### 1.6 DevOps Setup
- [ ] 1.6.1 Create `infra/compose.yml` (PostgreSQL, app services)
- [ ] 1.6.2 Create `infra/docker/server.Dockerfile`
- [ ] 1.6.3 Create `.github/workflows/ci.yml` (lint, test, build)
- [ ] 1.6.4 Create root scripts (dev, build, test, migrate)
- [ ] 1.6.5 Create `.env.example` template

### 1.7 Frontend Base Setup
- [ ] 1.7.1 Create `client/package.json` with workspaces
- [ ] 1.7.2 Create `client/tsconfig.base.json`
- [ ] 1.7.3 Create `client/packages/api-client/` (axios instance, interceptors)
- [ ] 1.7.4 Create `client/packages/ui/` (shared components structure)
- [ ] 1.7.5 Create `client/packages/utils/` (date, format utilities)
- [ ] 1.7.6 Setup Vite for `client/apps/employee/`
- [ ] 1.7.7 Setup Vite for `client/apps/admin/`
- [ ] 1.7.8 Configure RTL CSS base (`rtl.css`)
- [ ] 1.7.9 Configure Vitest for frontend testing

## 2. Authentication Implementation

### 2.1 Backend Auth Module
- [ ] 2.1.1 Create `auth.routes.ts` with endpoints
- [ ] 2.1.2 Create `auth.controller.ts`
- [ ] 2.1.3 Create `auth.service.ts` (login, logout, refresh, change-password)
- [ ] 2.1.4 Create `auth.repo.ts` (user lookup, token blacklist)
- [ ] 2.1.5 Implement JWT token generation with 2-hour expiry
- [ ] 2.1.6 Implement refresh token with blacklist invalidation
- [ ] 2.1.7 Implement bcrypt password hashing (12 rounds)
- [ ] 2.1.8 Create `auth.middleware.ts` (JWT validation, role check, active check)

### 2.2 Auth Endpoints
- [ ] 2.2.1 Implement `POST /auth/login`
- [ ] 2.2.2 Implement `POST /auth/refresh`
- [ ] 2.2.3 Implement `POST /auth/change-password`
- [ ] 2.2.4 Implement `GET /auth/me`
- [ ] 2.2.5 Implement `POST /auth/logout`
- [ ] 2.2.6 Implement `GET /health` (health check)

### 2.3 Frontend Auth Implementation
- [ ] 2.3.1 Create `LoginPage.tsx` with form
- [ ] 2.3.2 Create `ChangePasswordPage.tsx`
- [ ] 2.3.3 Create auth Zustand store (`auth.store.ts`)
- [ ] 2.3.4 Implement axios interceptors for JWT refresh
- [ ] 2.3.5 Create `ProtectedRoute` wrapper component
- [ ] 2.3.6 Implement auth redirects (login -> dashboard, no-auth -> login)
- [ ] 2.3.7 Create Layout shell component with navigation

## 3. User Management

### 3.1 Backend Users Module
- [ ] 3.1.1 Create `users.routes.ts`
- [ ] 3.1.2 Create `users.controller.ts`
- [ ] 3.1.3 Create `users.service.ts`
- [ ] 3.1.4 Create `users.repo.ts`

### 3.2 Profile Endpoint
- [ ] 3.2.1 Implement `GET /profile` (current user profile)

## 4. Shared UI Components

### 4.1 Base Components
- [ ] 4.1.1 Create Button component (with Radix)
- [ ] 4.1.2 Create Input component (with RTL support)
- [ ] 4.1.3 Create Modal/Dialog component (Radix Dialog)
- [ ] 4.1.4 Create Toast/Notification component (Radix Toast)
- [ ] 4.1.5 Create Form components integration (react-hook-form + Zod)
- [ ] 4.1.6 Create CSS design tokens (colors, spacing, typography)

### 4.2 Auth Components
- [ ] 4.2.1 Create LoginForm component
- [ ] 4.2.2 Create PasswordChangeForm component

## 5. Testing

### 5.1 Backend Tests
- [ ] 5.1.1 Configure Vitest for backend
- [ ] 5.1.2 Create test helpers (mock Prisma, test database)
- [ ] 5.1.3 Write unit tests for auth.service.ts
- [ ] 5.1.4 Write integration tests for auth endpoints
- [ ] 5.1.5 Achieve minimum 60% coverage for auth module

### 5.2 Frontend Tests
- [ ] 5.2.1 Write tests for LoginPage
- [ ] 5.2.2 Write tests for auth store
- [ ] 5.2.3 Write tests for ProtectedRoute

## 6. Documentation

### 6.1 API Documentation
- [ ] 6.1.1 Document auth endpoints in Swagger
- [ ] 6.1.2 Create README.md with setup instructions
