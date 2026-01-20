# Infrastructure Capability

## ADDED Requirements

### Requirement: Monorepo Project Structure
The system SHALL be organized as a pnpm monorepo with the following workspaces: `shared/types`, `server`, `client/packages/*`, `client/apps/employee`, `client/apps/admin`.

#### Scenario: Workspace resolution
- **WHEN** a package imports from `@shared/types`
- **THEN** pnpm resolves the import to `shared/types/src/index.ts`

#### Scenario: Independent builds
- **WHEN** running `pnpm build` from root
- **THEN** all workspaces build in dependency order

### Requirement: TypeScript Configuration
The system SHALL use a shared `tsconfig.base.json` with strict mode enabled, and each workspace SHALL extend this base configuration.

#### Scenario: Strict type checking
- **WHEN** code contains implicit `any` types
- **THEN** TypeScript compilation fails with an error

#### Scenario: Path alias resolution
- **WHEN** code imports using `@shared/types`
- **THEN** TypeScript resolves the path correctly

### Requirement: Database Connection
The system SHALL connect to PostgreSQL using Prisma ORM with a singleton client instance.

#### Scenario: Connection initialization
- **WHEN** the server starts
- **THEN** Prisma client connects to the database specified in `DATABASE_URL`

#### Scenario: Connection pooling
- **WHEN** multiple concurrent requests arrive
- **THEN** requests share the connection pool without creating new connections

### Requirement: Environment Configuration
The system SHALL validate all environment variables at startup using Zod schemas and fail fast if required variables are missing.

#### Scenario: Missing required variable
- **WHEN** `DATABASE_URL` environment variable is not set
- **THEN** the server fails to start with a clear error message

#### Scenario: Invalid variable format
- **WHEN** `JWT_EXPIRY` is set to a non-numeric value
- **THEN** the server fails to start with a validation error

### Requirement: Health Check Endpoint
The system SHALL provide a `GET /health` endpoint that returns server status without authentication.

#### Scenario: Health check success
- **WHEN** a request is made to `GET /health`
- **THEN** the response status is 200 with `{ "status": "ok", "timestamp": "...", "version": "..." }`

### Requirement: Request Logging
The system SHALL log all HTTP requests with method, path, status code, and duration using structured JSON logging.

#### Scenario: Request logged
- **WHEN** a request completes
- **THEN** a log entry is created with `{ "method": "GET", "path": "/api/v1/auth/me", "status": 200, "duration": 45 }`

### Requirement: Global Error Handling
The system SHALL catch all unhandled errors and return a standardized error response without exposing internal details in production.

#### Scenario: Unhandled exception
- **WHEN** an unhandled error occurs in a route handler
- **THEN** the response is `{ "success": false, "error": { "code": "SERVER_ERROR", "message": "Internal server error" } }` with status 500

#### Scenario: Validation error
- **WHEN** request body fails Zod validation
- **THEN** the response is `{ "success": false, "error": { "code": "VALIDATION_001", "message": "...", "fields": [...] } }` with status 400

### Requirement: Docker Development Environment
The system SHALL provide a Docker Compose configuration for local development with PostgreSQL.

#### Scenario: Start development environment
- **WHEN** running `docker compose up`
- **THEN** PostgreSQL starts on port 5432 and the server connects successfully

### Requirement: CI Pipeline
The system SHALL run lint, type-check, and tests on every pull request via GitHub Actions.

#### Scenario: PR validation
- **WHEN** a pull request is opened
- **THEN** CI runs ESLint, TypeScript compilation, and Vitest tests

#### Scenario: Failed lint blocks merge
- **WHEN** ESLint reports errors
- **THEN** the CI check fails and the PR cannot be merged

### Requirement: Shared Types Package
The system SHALL provide a `@shared/types` package containing DTOs, enums, constants, and Zod schemas shared between frontend and backend.

#### Scenario: DTO import in backend
- **WHEN** backend code imports `LoginRequestDto` from `@shared/types`
- **THEN** the type is available with full TypeScript support

#### Scenario: Enum consistency
- **WHEN** frontend uses `UserRole.ADMIN`
- **THEN** the value matches the backend enum definition
