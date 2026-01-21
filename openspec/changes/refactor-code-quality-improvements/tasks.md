## 1. Spec Documentation Updates
- [x] 1.1 Update Purpose section in `openspec/specs/authentication/spec.md` with concrete statement
- [x] 1.2 Update Purpose section in `openspec/specs/infrastructure/spec.md` with concrete statement and align DATABASE_URL requirement
- [x] 1.3 Update Purpose section in `openspec/specs/user-management/spec.md` with concrete statement
- [x] 1.4 Fix markdown formatting (MD022) in `openspec/specs/user-management/spec.md` - add blank lines around headers

## 2. Security & Configuration
- [x] 2.1 Remove hardcoded credentials from `server/prisma.config.ts` - use `env("DATABASE_URL")` only
- [x] 2.2 Update `server/prisma/schema.prisma` datasource to use `env("DATABASE_URL")` instead of hardcoded value
- [x] 2.3 Align `server/src/config/env.ts` - make `DATABASE_URL` required (remove optional) to match spec fail-fast requirement
- [x] 2.4 Update `prisma.config.ts` to fail-fast if `DATABASE_URL` missing (except test environment)

## 3. Database Schema Improvements
- [x] 3.1 Remove duplicate `@@index([userId, workDate])` from `WorkdaySummary` model (keep `@@unique`)
- [x] 3.2 Remove duplicate `@@index([month])` from `MonthLock` model (keep `@unique`)
- [x] 3.3 Add CHECK constraint for date ranges in `projects` table migration
- [x] 3.4 Add CHECK constraint for date ranges in `tasks` table migration
- [x] 3.5 Run Prisma migration to apply schema changes

## 4. Type Safety Improvements
- [x] 4.1 Replace `any` type in `projects.repo.ts` `whereConditions` with `Prisma.TaskWhereInput`
- [x] 4.2 Change `ValidationError.details` type from `any` to `unknown` in `server/src/shared/errors.ts`
- [x] 4.3 Update all `ValidationError` consumers to properly narrow `details` type
- [x] 4.4 Fix type casts in `clients.service.test.ts` - use `EntityStatus` enum instead of `as any`
- [x] 4.5 Fix type casts in `projects.service.test.ts` - use `EntityStatus` enum instead of `as any`
- [x] 4.6 Fix type casts in `tasks.service.test.ts` - use `TaskStatus` enum instead of `as any`

## 5. Route Parameter Validation
- [ ] 5.1 Create `paramIdSchema` in `clients.schemas.ts` for UUID validation
- [ ] 5.2 Add validation middleware to `clients.routes.ts` for `:id` parameter in GET, PUT routes
- [ ] 5.3 Create `projectIdParamSchema` in `projects.schemas.ts` for UUID validation
- [ ] 5.4 Add validation middleware to `projects.routes.ts` for `:id` parameter in GET route
- [ ] 5.5 Create `taskIdParamSchema` and `listTasksQuerySchema` in `tasks.schemas.ts`
- [ ] 5.6 Add validation middleware to `tasks.routes.ts` for `:id` parameter and query validation

## 6. Zod Schema Fixes
- [ ] 6.1 Fix `createTaskSchema` and `updateTaskSchema` - replace `z.string().date()` with ISO date API (`z.string().isoDate()` or `z.coerce.date()`)
- [ ] 6.2 Update `createClientSchema` and `updateClientSchema` - add optional `description` field, make `name` optional in update
- [ ] 6.3 Fix `admin-reports.schema.ts` - replace `z.string().min(1)` with proper date validation for `date` field
- [ ] 6.4 Fix `admin-reports.schema.ts` - replace string checks for `startDate`/`endDate` with proper date validation
- [ ] 6.5 Fix `admin-reports.schema.ts` - update refine logic to handle overnight shifts (cross midnight)
- [ ] 6.6 Update `calculateMinutes` in `server/src/shared/time.ts` to handle overnight shifts
- [ ] 6.7 Fix `admin-assignments.schema.ts` - replace `z.string().min(1)` with `z.string().uuid()` for `userId`/`taskId`
- [ ] 6.8 Fix `admin-entities.schema.ts` - enforce ISO date format for `startDate`/`endDate` in all project/task schemas
- [ ] 6.9 Fix `month-locks.schema.ts` - update regex to reject invalid months (00, 13)

## 7. Service Logic Improvements
- [x] 7.1 Fix duplicate project fetch in `tasks.service.ts` `updateTask` - reuse `newProject` variable
- [x] 7.2 Add date validation (NaN checks) in `projects.service.ts` for `startDate`/`endDate` in `createProject` and `updateProject`
- [x] 7.3 Standardize error type in `projects.service.ts` - change `createProject` to throw `NotFoundError` instead of `ValidationError` for client-not-found
- [x] 7.4 Replace generic error codes in `tasks.service.ts` with specific codes: `VALIDATION_DATE_RANGE`, `VALIDATION_DATE_OUT_OF_PROJECT`, `VALIDATION_TASK_HAS_ENTRIES`
- [x] 7.5 Update `tasks.controller.ts` - add typed input for `createTask` instead of inline destructuring
- [x] 7.6 Add query validation in `tasks.controller.ts` for `projectId` parameter

## 8. Swagger/OpenAPI Improvements
- [ ] 8.1 Add `required` array to `ClientDto` schema in `swagger.ts`
- [ ] 8.2 Add `required` array to `ProjectDto` schema in `swagger.ts`
- [ ] 8.3 Add `required` array to `TaskDto` schema in `swagger.ts`
- [ ] 8.4 Add response definitions (200, 401, 403) to GET `/admin/projects` route Swagger doc
- [ ] 8.5 Create `ProjectDateValidationErrorResponseDto` wrapper in `admin-entities.dto.ts`

## 9. DTO Type Improvements
- [x] 9.1 Update `AdminTimeEntryDto` - replace loose string types with enum unions for `source`, `absenceType`, `status`
- [x] 9.2 Ensure all DTOs use proper enum types instead of generic strings

## 10. Test Improvements
- [ ] 10.1 Fix `mockPrisma.ts` - update `$transaction` mock to pass full client object to callback
- [ ] 10.2 Move `createMockProject` from `projects.endpoints.test.ts` to shared mock helpers
- [ ] 10.3 Replace duplicate `createMockTask` and `createMockProject` in `tasks.endpoints.test.ts` with shared helpers
- [ ] 10.4 Fix test assertion in `tasks.endpoints.test.ts` - align test name with expected status code (404 vs 400)
- [ ] 10.5 Add missing 401 test cases for PUT endpoints in `projects.endpoints.test.ts`
- [ ] 10.6 Add test for name length validation in `clients.endpoints.test.ts` (max 100 characters)
- [ ] 10.7 Add test for 403 (non-admin) access in `clients.endpoints.test.ts`
- [ ] 10.8 Fix duplicate service call in `projects.service.test.ts` - reuse promise for assertions
- [ ] 10.9 Update all test files to use proper enum types instead of `as any` casts

## 11. Validation
- [ ] 11.1 Run `openspec validate refactor-code-quality-improvements --strict` and fix any issues
- [ ] 11.2 Run Prisma validation and migration checks
- [ ] 11.3 Run TypeScript compilation to verify type fixes
- [ ] 11.4 Run test suite to ensure all tests pass
- [ ] 11.5 Run linter to verify code quality
