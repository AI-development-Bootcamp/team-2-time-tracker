You are an expert in TypeScript, Node.js, Express.js, PostgreSQL, Prisma, and RESTful API development.

Tech Stack
- Runtime: Node.js with TypeScript
- Framework: Express.js
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT (jsonwebtoken) + bcrypt
- Validation: Zod
- HTTP Client: axios
- Logging: Winston or Pino
- Testing: Jest or Vitest
- Security: helmet, express-rate-limit, cors
- File Upload: multer
- Cookies: cookie-parser
- Environment: dotenv
- API Docs: Swagger/OpenAPI

Code Style and Structure
- Write concise, technical TypeScript code with accurate examples.
- Use functional programming patterns; avoid classes except for error types.
- Follow DRY (Don't Repeat Yourself) principle; extract reusable logic into shared utilities.
- Use descriptive variable names with auxiliary verbs (e.g., isLocked, hasPermission).
- Structure: routes, controllers, services, repositories, middleware, utils, types.
- Use ES Modules (import/export) instead of CommonJS (require).
- Extract magic numbers and strings to named constants.

Project Structure
```
time-tracking/
├─ client/
│  ├─ apps/
│  │  ├─ employee/              # Employee FE (React)
│  │  └─ admin/                 # Admin FE (React)
│  ├─ packages/
│  │  ├─ ui/                    # רכיבי UI משותפים (RTL-ready)
│  │  ├─ api-client/            # שכבת API (fetch/axios, auth headers)
│  │  ├─ shared-types/          # טיפוסים משותפים (DTOs, enums)
│  │  └─ utils/                 # helpers משותפים (date, validators)
│  ├─ package.json
│  └─ tsconfig.base.json
│
├─ server/
│  ├─ src/
│  │  ├─ app.ts                 # bootstrap + middlewares + routes
│  │  ├─ config/                # env, jwt, upload limits, swagger
│  │  ├─ db/
│  │  │  ├─ prisma/ OR migrations/  # (לבחירתך: Prisma או SQL migrations)
│  │  │  ├─ index.ts            # db client init
│  │  │  └─ seed.ts
│  │  ├─ middlewares/
│  │  │  ├─ auth.middleware.ts  # verify JWT, roles, active status
│  │  │  ├─ validate.middleware.ts
│  │  │  ├─ error.middleware.ts
│  │  │  └─ rateLimit.middleware.ts (אופציונלי)
│  │  ├─ modules/
│  │  │  ├─ auth/
│  │  │  │  ├─ auth.controller.ts
│  │  │  │  ├─ auth.service.ts
│  │  │  │  ├─ auth.routes.ts
│  │  │  │  └─ auth.dto.ts
│  │  │  ├─ users/
│  │  │  ├─ clients/
│  │  │  ├─ projects/
│  │  │  ├─ tasks/
│  │  │  ├─ time-reports/       # דיווחים + יום עבודה
│  │  │  ├─ timer/              # שרת טיימר (runs on server)
│  │  │  ├─ absences/
│  │  │  ├─ month-closure/      # סגירת חודש + נעילה
│  │  │  ├─ audit-log/
│  │  │  └─ notifications/      # התראות (מסמך חסר וכו')
│  │  ├─ shared/
│  │  │  ├─ constants.ts
│  │  │  ├─ errors.ts
│  │  │  ├─ logger.ts
│  │  │  ├─ time.ts             # חישובי שעות, overlap, rounding
│  │  │  └─ pagination.ts
│  │  └─ swagger/
│  │     └─ openapi.ts
│  ├─ tests/                    # unit tests (60%+)
│  ├─ package.json
│  └─ tsconfig.json
│
├─ infra/
│  ├─ docker/
│  │  ├─ client.Dockerfile
│  │  └─ server.Dockerfile
│  ├─ compose.yml
│  └─ nginx/ (אופציונלי)
│
├─ .github/workflows/
│  ├─ ci.yml
│  └─ deploy.yml
│
├─ package.json                 # root: workspaces
└─ README.md

```

Naming Conventions
- Use lowercase with dashes for directories (e.g., time-entries).
- Use camelCase for variables and functions.
- Use PascalCase for types and interfaces.
- Use SCREAMING_SNAKE_CASE for constants.

TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use const objects with as const instead.
- Use strict mode for better type safety.
- Define explicit return types for all functions.
- Use generics for reusable utility functions.

API Design
- Follow RESTful conventions for endpoint naming.
- Use proper HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE.
- Use plural nouns for resources (e.g., /api/users, /api/time-entries).
- Return consistent response structures with status, data, and error fields.
- Use appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- Version API endpoints (e.g., /api/v1/).
- Implement /health endpoint for container orchestration and monitoring.
- Use axios for HTTP requests to external services.

Request/Response Structure
- Use Zod for request validation in middleware.
- Return standardized JSON responses:
  ```typescript
  { success: true, data: {...} }
  { success: false, error: { code: string, message: string } }
  ```

Shared DTOs
- Define DTOs (Data Transfer Objects) in a shared folder accessible by client, backend, and admin.
- Use DTOs for all API request and response types.
- Keep DTOs in sync across all three projects (monorepo shared package or npm package).
- DTOs should match Zod schemas for validation consistency.
- Separate DTOs by domain (e.g., user.dto.ts, time-entry.dto.ts, absence.dto.ts).

Authentication and Authorization
- Implement JWT-based authentication.
- Use HTTP-only cookies for token storage.
- Implement refresh token rotation.
- Create middleware for role-based access control (admin/regular user).
- Hash passwords with bcrypt (minimum 12 rounds).
- Validate all tokens and handle expiry gracefully.

Authorization Rules
- Users can only access their own time entries and absences.
- Users can only edit entries for unlocked months.
- Admins can access and edit all user data.
- Admins can lock/unlock months.
- Log all admin actions on user data.

Database (PostgreSQL with Prisma)
- Use Prisma as the ORM for database access.
- Use Prisma Migrate for database migrations.
- Define models in schema.prisma with proper relations and constraints.
- Implement soft deletes with is_active or deleted_at fields.
- Use @relation for foreign key constraints and referential integrity.
- Add @@index for frequently queried columns.
- Use Prisma transactions ($transaction) for multi-table operations.
- Store timestamps in UTC; use @default(now()) and @updatedAt.

Query Optimization
- Use Prisma's select and include to fetch only required fields.
- Use Prisma's findMany with skip and take for pagination.
- Leverage Prisma's relation queries instead of manual JOINs.
- Use raw queries (prisma.$queryRaw) only when necessary for complex operations.

Business Logic
- Daily work standard: 9 hours (constant).
- Absence types: vacation, sick, military, other (constants).
- Work locations: office, client, home (constants).
- Exclude Friday-Saturday from absence calculations (Israeli weekend).
- Validate: end_time > start_time for time entries.
- Prevent edits to locked months (except by admin unlock).

File Upload
- Handle document uploads for absences (medical/military certificates).
- Validate file types (PDF, images) and size limits.
- Store files securely (local storage or cloud service).
- Generate unique filenames to prevent collisions.

Error Handling
- Create custom error classes (ValidationError, AuthError, NotFoundError).
- Use centralized error handling middleware.
- Log errors with appropriate context (user, action, timestamp).
- Return user-friendly error messages; hide internal details in production.
- Handle database connection errors gracefully.

Validation
- Validate all inputs at controller level using Zod schemas.
- Sanitize user inputs to prevent injection attacks.
- Validate business rules in service layer.
- Return clear validation error messages.

Logging
- Use structured logging (e.g., Winston or Pino).
- Log all requests with method, path, status, and duration.
- Log authentication events (login, logout, failed attempts).
- Log admin actions on user data for audit trail.
- Use different log levels (debug, info, warn, error).

Testing
- Write unit tests using Jest or Vitest.
- Aim for minimum 60% code coverage.
- Test all API endpoints with integration tests.
- Mock database for unit tests; use test database for integration.
- Test authentication and authorization flows.
- Test business logic edge cases (month locking, date validations).

Security
- Sanitize all user inputs.
- Prisma handles parameterized queries automatically; avoid raw SQL concatenation.
- Implement rate limiting on authentication endpoints.
- Use HTTPS in production.
- Set secure headers (helmet middleware).
- Validate and sanitize file uploads.
- Never expose sensitive data in responses (passwords, internal IDs).

Environment Configuration
- Use environment variables for all configuration.
- Separate configs for development, test, and production.
- Never commit secrets to version control.
- Use .env.example as template.
- Use Zod for environment variable validation with hierarchical config and defaults.

API Documentation
- Document all endpoints with Swagger/OpenAPI.
- Include request/response examples.
- Document authentication requirements.
- Document error responses.

Function Documentation
- Add JSDoc comments above every function with:
  - @description - Brief explanation of what the function does
  - @param - Each parameter with type and description
  - @returns - Return type and description
  - @throws - Any errors the function may throw
  - @example - Usage example when helpful
- For each new function, create a detailed documentation file in /docs folder:
  - File naming: /docs/[module]/[function-name].md
  - Include: purpose, parameters table, return value, error scenarios, usage examples, edge cases, related functions.

Performance
- Use connection pooling for database.
- Implement response caching where appropriate.
- Use async/await properly; avoid blocking operations.
- Optimize database queries with proper indexing.

Key Conventions
1. All dates/times stored in UTC; convert on response if needed.
2. Use transactions for operations affecting multiple tables.
3. Implement audit logging for sensitive operations.
4. Follow 12-factor app principles.
5. Keep controllers thin; business logic in services.
6. Repository pattern for database access.

Refer to Express.js, Prisma, and PostgreSQL documentation for best practices.
