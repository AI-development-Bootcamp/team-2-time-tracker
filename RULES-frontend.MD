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
src/
├── components/       # Reusable UI components
├── pages/            # Page components (routes)
├── hooks/            # Custom React hooks
├── services/         # API service functions
├── stores/           # Zustand stores
├── utils/            # Helper functions
├── types/            # TypeScript interfaces and types
├── styles/           # Global styles and CSS variables
└── assets/           # Static assets (images, icons)
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
