# Change: Code Quality and Type Safety Improvements

## Why

This change addresses critical code quality issues identified in code review, including:
- Security vulnerabilities (hardcoded credentials)
- Type safety gaps (excessive use of `any` types)
- Missing validation (route parameters, date formats)
- Database schema issues (duplicate indexes, missing constraints)
- Inconsistent error handling and error codes
- Spec documentation gaps (TBD placeholders)
- Test quality issues (duplicate helpers, missing test cases)

These improvements will enhance maintainability, security, type safety, and developer experience.

## What Changes

### Security & Configuration
- **BREAKING**: Remove hardcoded database credentials from `prisma.config.ts`
- Align `DATABASE_URL` handling between spec and implementation (fail-fast vs fallback)
- Update Prisma schema to use `env("DATABASE_URL")` instead of hardcoded values

### Type Safety
- Replace `any` types with proper Prisma types in `projects.repo.ts`
- Change `ValidationError.details` from `any` to `unknown` for better type safety
- Fix type casts in tests to use proper enum types

### Database Schema
- Remove duplicate indexes (`@@index([userId, workDate])` in WorkdaySummary, `@@index([month])` in MonthLock)
- Add CHECK constraints for date ranges in projects and tasks tables

### Validation & Error Handling
- Add UUID validation for route parameters (`:id`) in admin entity routes
- Fix Zod schemas for date validation (replace deprecated `z.string().date()` with ISO date API)
- Standardize error codes in `tasks.service.ts` (replace generic codes with specific ones)
- Add required fields to Swagger DTO schemas

### Service Logic
- Fix duplicate project fetches in `tasks.service.ts`
- Add date validation (NaN checks) in `projects.service.ts`
- Standardize error types (use `NotFoundError` consistently)

### Spec Documentation
- Update Purpose sections in `authentication/spec.md`, `infrastructure/spec.md`, `user-management/spec.md`
- Fix markdown formatting issues (MD022 compliance)

### Testing
- Consolidate duplicate test helpers (move to shared mock helpers)
- Add missing test cases (401 for unauthenticated requests, validation tests)
- Fix test assertions to match intended behavior

## Impact

- **Affected specs**: `authentication`, `infrastructure`, `user-management`, `admin-entities`
- **Affected code**: 
  - `server/prisma.config.ts`
  - `server/prisma/schema.prisma`
  - `server/src/shared/errors.ts`
  - `server/src/config/env.ts`
  - `server/src/modules/admin/entities/*` (routes, controllers, services, repos)
  - `server/src/config/swagger.ts`
  - `shared/types/src/zod/*` (schemas)
  - `server/tests/**/*` (test files)
- **Breaking changes**: 
  - `DATABASE_URL` now required (no fallback) - affects local development setup
  - `ValidationError.details` type changed from `any` to `unknown` - may require type narrowing in consumers
