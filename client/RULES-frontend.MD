You are an expert in TypeScript, React, Radix UI, and modern web development.

Tech Stack
- Language: TypeScript
- Framework: React
- Build Tool: Vite
- UI Components: Radix UI
- Icons: lucide-react
- Routing: React Router
- Global State: Zustand
- Server State: TanStack Query (react-query)
- Forms: react-hook-form + @hookform/resolvers
- Validation: Zod
- Data Tables: TanStack Table
- Date Handling: date-fns
- File Upload: react-dropzone
- HTTP Client: axios
- Testing: Jest + React Testing Library
- Styling: Native CSS (BEM convention)

Code Style and Structure
- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Follow DRY (Don't Repeat Yourself) principle; extract reusable logic into shared utilities or hooks.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.
- Keep components under ~200 lines; split large components using compound component pattern.
- Extract magic numbers and strings to named constants.

Project Structure
```
time-tracking/
├─ package.json                      # root: workspaces + scripts
├─ tsconfig.base.json                # בסיס TS לכל הפרויקטים (path aliases וכו')
├─ README.md
├─ .gitignore
├─ .github/
│  └─ workflows/
│     ├─ ci.yml
│     └─ deploy.yml
│
├─ infra/
│  ├─ compose.yml
│  ├─ docker/
│  │  ├─ server.Dockerfile
│  │  ├─ employee.Dockerfile
│  │  └─ admin.Dockerfile
│  └─ nginx/                         # אופציונלי
│     └─ default.conf
│
├─ shared/
│  └─ types/                         # משותף ל-Backend + Frontend
│     ├─ package.json                # name: @shared/types
│     ├─ tsconfig.json
│     └─ src/
│        ├─ dtos/
│        │  ├─ auth.dto.ts
│        │  ├─ users.dto.ts
│        │  ├─ clients.dto.ts
│        │  ├─ projects.dto.ts
│        │  ├─ tasks.dto.ts
│        │  ├─ timeReports.dto.ts
│        │  ├─ timer.dto.ts
│        │  ├─ absences.dto.ts
│        │  ├─ monthClosure.dto.ts
│        │  └─ auditLog.dto.ts
│        ├─ enums/
│        │  ├─ roles.enum.ts
│        │  ├─ entityStatus.enum.ts
│        │  ├─ absenceType.enum.ts
│        │  ├─ absenceStatus.enum.ts
│        │  ├─ locationType.enum.ts
│        │  └─ auditAction.enum.ts
│        ├─ constants/
│        │  └─ workday.constants.ts   # e.g. WORKDAY_MINUTES=540
│        ├─ index.ts                  # export * from './dtos/...', './enums/...'
│        └─ zod/                      # אופציונלי: schemas לוולידציה משותפת
│           ├─ auth.schema.ts
│           ├─ timeReports.schema.ts
│           └─ absences.schema.ts
│
├─ server/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ src/
│  │  ├─ app.ts                       # bootstrap express
│  │  ├─ routes.ts                    # מאגד את כל המודולים
│  │  ├─ config/
│  │  │  ├─ env.ts
│  │  │  ├─ jwt.ts
│  │  │  ├─ swagger.ts
│  │  │  └─ upload.ts                 # file size/types
│  │  ├─ db/
│  │  │  ├─ index.ts                  # db client init
│  │  │  ├─ migrations/               # SQL migrations (או prisma/)
│  │  │  └─ seed.ts
│  │  ├─ middlewares/
│  │  │  ├─ auth.middleware.ts        # JWT + role + active
│  │  │  ├─ validate.middleware.ts    # zod/joi + shared schemas
│  │  │  ├─ error.middleware.ts
│  │  │  └─ requestId.middleware.ts
│  │  ├─ shared/
│  │  │  ├─ errors.ts
│  │  │  ├─ logger.ts
│  │  │  ├─ pagination.ts
│  │  │  └─ time.ts                   # חישובי זמן, rounding
│  │  └─ modules/
│  │     ├─ auth/
│  │     │  ├─ auth.routes.ts
│  │     │  ├─ auth.controller.ts
│  │     │  ├─ auth.service.ts
│  │     │  └─ auth.repo.ts
│  │     ├─ users/
│  │     │  ├─ users.routes.ts
│  │     │  ├─ users.controller.ts
│  │     │  ├─ users.service.ts
│  │     │  └─ users.repo.ts
│  │     ├─ clients/
│  │     │  ├─ clients.routes.ts
│  │     │  ├─ clients.controller.ts
│  │     │  ├─ clients.service.ts
│  │     │  └─ clients.repo.ts
│  │     ├─ projects/
│  │     │  ├─ projects.routes.ts
│  │     │  ├─ projects.controller.ts
│  │     │  ├─ projects.service.ts
│  │     │  └─ projects.repo.ts
│  │     ├─ tasks/
│  │     │  ├─ tasks.routes.ts
│  │     │  ├─ tasks.controller.ts
│  │     │  ├─ tasks.service.ts
│  │     │  └─ tasks.repo.ts
│  │     ├─ task-assignments/
│  │     │  ├─ taskAssignments.routes.ts
│  │     │  ├─ taskAssignments.controller.ts
│  │     │  ├─ taskAssignments.service.ts
│  │     │  └─ taskAssignments.repo.ts
│  │     ├─ time-reports/
│  │     │  ├─ timeReports.routes.ts
│  │     │  ├─ timeReports.controller.ts
│  │     │  ├─ timeReports.service.ts
│  │     │  ├─ timeReports.repo.ts
│  │     │  └─ workday.service.ts     # recalcWorkday + business rules
│  │     ├─ timer/
│  │     │  ├─ timer.routes.ts
│  │     │  ├─ timer.controller.ts
│  │     │  ├─ timer.service.ts
│  │     │  └─ timer.repo.ts
│  │     ├─ absences/
│  │     │  ├─ absences.routes.ts
│  │     │  ├─ absences.controller.ts
│  │     │  ├─ absences.service.ts
│  │     │  ├─ absences.repo.ts
│  │     │  └─ absences.documents.ts  # upload/attach
│  │     ├─ month-closure/
│  │     │  ├─ monthClosure.routes.ts
│  │     │  ├─ monthClosure.controller.ts
│  │     │  ├─ monthClosure.service.ts
│  │     │  └─ monthClosure.repo.ts
│  │     ├─ audit-log/
│  │     │  ├─ auditLog.routes.ts
│  │     │  ├─ auditLog.controller.ts
│  │     │  ├─ auditLog.service.ts
│  │     │  └─ auditLog.repo.ts
│  │     └─ notifications/
│  │        ├─ notifications.routes.ts
│  │        ├─ notifications.controller.ts
│  │        ├─ notifications.service.ts
│  │        └─ notifications.repo.ts
│  └─ tests/
│     ├─ unit/
│     └─ helpers/
│
├─ client/
│  ├─ package.json
│  ├─ tsconfig.base.json
│  ├─ packages/
│  │  ├─ ui/                          # רכיבים משותפים (RTL, Mobile-first)
│  │  │  ├─ package.json
│  │  │  └─ src/
│  │  │     ├─ components/
│  │  │     └─ index.ts
│  │  ├─ api-client/                  # לקוח API משותף (auth headers, refresh future)
│  │  │  ├─ package.json
│  │  │  └─ src/
│  │  │     ├─ http.ts
│  │  │     ├─ auth.ts
│  │  │     └─ index.ts
│  │  └─ utils/
│  │     ├─ package.json
│  │     └─ src/
│  │        ├─ date.ts
│  │        ├─ format.ts
│  │        └─ index.ts
│  │
│  └─ apps/
│     ├─ employee/                    # React Employee App (רץ בנפרד)
│     │  ├─ package.json              # name: @client/employee
│     │  ├─ vite.config.ts (או next.config.js)
│     │  └─ src/
│     │     ├─ app/                   # routing
│     │     ├─ pages/
│     │     │  ├─ LoginPage.tsx
│     │     │  ├─ ChangePasswordPage.tsx
│     │     │  ├─ DailyReportPage.tsx
│     │     │  └─ AbsencePage.tsx
│     │     ├─ components/
│     │     │  ├─ TimerCard.tsx
│     │     │  ├─ WorkdayProgress.tsx
│     │     │  ├─ TimeEntryForm.tsx
│     │     │  └─ FrequentSelectors.tsx
│     │     ├─ api/                   # wrappers ייעודיים לאפליקציה
│     │     │  └─ employeeApi.ts
│     │     ├─ styles/
│     │     │  └─ rtl.css
│     │     └─ main.tsx
│     │
│     └─ admin/                       # React Admin App (רץ בנפרד)
│        ├─ package.json              # name: @client/admin
│        ├─ vite.config.ts (או next.config.js)
│        └─ src/
│           ├─ app/
│           ├─ pages/
│           │  ├─ Users.tsx
│           │  ├─ Clients.tsx
│           │  ├─ Projects.tsx
│           │  ├─ Tasks.tsx
│           │  ├─ Assignments.tsx
│           │  ├─ MonthClosure.tsx
│           │  └─ AuditLogs.tsx
│           ├─ components/
│           │  ├─ CrudTable.tsx
│           │  └─ EntityFormDrawer.tsx
│           ├─ api/
│           │  └─ adminApi.ts
│           └─ main.tsx


```

Naming Conventions
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.
- Use strict mode in TypeScript for better type safety.
- Never use `any` type or `// @ts-ignore`; always define proper types.
- Never disable ESLint rules; fix the underlying issue instead.

Syntax and Formatting
- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.
- Use Prettier for consistent code formatting.

UI and Styling
- Prefer Radix UI primitives for interactive components (Dialog, Dropdown, Select, etc.); if not possible, build with native CSS.
- Use native CSS for styling; organize styles per component.
- Implement responsive design with mobile-first approach using CSS media queries.
- Use CSS custom properties (variables) for theming and consistent design tokens.
- Follow BEM naming convention for CSS classes.

Component Library (Radix UI)
- Use Radix primitives: Dialog, DropdownMenu, Select, Checkbox, RadioGroup, Tabs, Toast, etc.
- Compose Radix primitives with custom styles; don't override internal Radix styles.
- Use Radix's built-in accessibility features; don't disable them.
- Implement consistent component API patterns across the app.

Design Tokens
- Define CSS variables for colors, spacing, typography, and shadows.
- Create a theme file with all design tokens.
- Support light/dark mode using CSS custom properties.
- Use semantic color names (e.g., --color-primary, --color-error).

RTL and Hebrew Support
- All layouts must support RTL (right-to-left) direction.
- Use dir="rtl" on root elements.
- Use CSS logical properties (inset-inline-start/end, margin-inline, padding-inline) instead of left/right.
- Ensure all text, icons, and UI elements are properly mirrored for RTL.
- Use Hebrew for all user-facing text; maintain consistent terminology.

Navigation
- Use React Router for routing and navigation.
- Implement protected routes for authenticated users.
- Use role-based navigation (admin vs regular user).
- Handle 404 and error pages gracefully.

State Management
- Use Zustand for managing global state.
- Leverage react-query (TanStack Query) for data fetching and caching; avoid excessive API calls.
- Keep server state separate from client state.

Forms and Validation
- Use react-hook-form for form management.
- Use Zod for schema validation integrated with react-hook-form.
- Implement inline validation with clear Hebrew error messages.
- Handle form submission states (loading, success, error) with appropriate UI feedback.
- Use Radix Form primitives where applicable.

Date and Time Handling
- Use date-fns for date manipulation and formatting.
- Display dates in Hebrew locale format.
- Handle timezone considerations for time entries.
- Use accessible date pickers and time inputs.

Authentication and Authorization
- Implement JWT-based authentication with secure token storage.
- Use HTTP-only cookies for token storage when possible.
- Implement role-based access control (admin/regular user).
- Protect routes and API calls based on user permissions.
- Handle session expiry gracefully with user feedback.

Data Tables
- Use TanStack Table for complex data tables (admin views).
- Implement sorting, filtering, and pagination.
- Ensure tables are responsive and accessible.
- Style tables consistently with the design system.

File Upload
- Handle document uploads (medical certificates, military service docs).
- Validate file types and sizes on client side.
- Show upload progress and handle errors gracefully.

Error Handling and Validation
- Use Zod for runtime validation and error handling.
- Implement proper error logging.
- Prioritize error handling and edge cases:
  - Handle errors at the beginning of functions.
  - Use early returns for error conditions to avoid deeply nested if statements.
  - Avoid unnecessary else statements; use if-return pattern instead.
  - Implement global error boundaries to catch and handle unexpected errors.
- Use Radix Toast for error notifications.

Testing
- Write unit tests using Jest and React Testing Library.
- Aim for minimum 60% code coverage.
- Test critical user flows (time reporting, authentication).
- Consider snapshot testing for components to ensure UI consistency.

Security
- Sanitize user inputs to prevent XSS attacks.
- Ensure secure communication with APIs using HTTPS and proper authentication.
- Never expose sensitive data in client-side code.

Accessibility
- Follow WCAG 2.1 guidelines for accessibility.
- Leverage Radix UI's built-in accessibility (focus management, ARIA attributes).
- Ensure all interactive elements are keyboard navigable.
- Use proper ARIA labels, especially for Hebrew screen readers.
- Test with screen readers.

Performance Optimization
- Use React.lazy and Suspense for code splitting.
- Use dynamic imports for non-critical components.
- Optimize images (WebP format, lazy loading).
- Implement proper loading states and skeleton screens.
- Memoize expensive computations with useMemo and useCallback.

Build and Bundling
- Use Vite for development and production builds.
- Configure proper production optimizations.
- Set up path aliases for clean imports.

Key Conventions
1. Prioritize Web Vitals (LCP, CLS, FID).
2. Use environment variables for configuration.
3. Ensure compatibility across modern browsers (Chrome, Edge, Safari).
4. Use consistent error handling patterns across the app.

API Integration
- Create typed API service functions.
- Use TypeScript interfaces for API response types.
- Handle loading, error, and success states consistently.
- Use axios or fetch with proper error handling.

Shared DTOs
- Import DTOs from the shared folder (shared between client, backend, and admin).
- Use shared DTOs for all API request and response types.
- DTOs ensure type consistency between frontend and backend.
- Never duplicate DTO definitions; always import from shared.

Function Documentation
- Add JSDoc comments above every function and hook with:
  - @description - Brief explanation of what the function does
  - @param - Each parameter with type and description
  - @returns - Return type and description
  - @example - Usage example when helpful
- For each new function/hook, create a detailed documentation file in /docs folder:
  - File naming: /docs/[module]/[function-name].md
  - Include: purpose, parameters table, return value, usage examples, edge cases, related functions.

Refer to React and Radix UI documentation for best practices.
