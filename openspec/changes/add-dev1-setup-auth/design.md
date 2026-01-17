# Design: Developer 1 - Infrastructure Setup, Authentication & User Management

## Context

This is the foundation layer for a Time Tracking System designed for Israeli workplaces. The system requires:
- Mobile-first, RTL (Hebrew) support
- JWT-based authentication with mandatory password change on first login
- Role-based access (EMPLOYEE/ADMIN)
- PostgreSQL database with Prisma ORM
- Monorepo structure with shared types between frontend and backend

## Goals / Non-Goals

### Goals
- Establish a maintainable monorepo structure with pnpm workspaces
- Implement secure JWT authentication with refresh token rotation
- Create reusable shared types package for frontend/backend consistency
- Set up CI pipeline for automated testing and linting
- Provide base UI components with RTL support

### Non-Goals
- Self-service password recovery (admin-only by design)
- OAuth/social login integration
- Multi-tenant architecture
- Internationalization beyond Hebrew

## Decisions

### 1. Authentication Strategy: Stateless JWT with Blacklist

**Decision**: Use stateless JWTs for access tokens (2-hour expiry) with a refresh token blacklist stored in PostgreSQL.

**Rationale**:
- Stateless access tokens reduce database lookups on each request
- Blacklist only needed for refresh tokens (logout, token revocation)
- Simpler than Redis-based session storage for this scale

**Alternatives considered**:
- Session-based auth: Rejected due to horizontal scaling complexity
- Redis token store: Overkill for expected user count

### 2. Password Hashing: bcrypt with 12 Rounds

**Decision**: Use bcrypt with 12 rounds for password hashing.

**Rationale**:
- Industry standard, well-tested library
- 12 rounds provides good security/performance balance
- Native async support in Node.js

### 3. Monorepo Structure: pnpm Workspaces

**Decision**: Use pnpm workspaces with the following packages:
- `shared/types` - DTOs, enums, Zod schemas
- `server` - Express backend
- `client/packages/ui` - Shared React components
- `client/packages/api-client` - Axios configuration
- `client/packages/utils` - Date/format utilities
- `client/apps/employee` - Employee app
- `client/apps/admin` - Admin app

**Rationale**:
- pnpm is faster and more disk-efficient than npm/yarn
- Clear separation between shared and app-specific code
- Allows independent versioning of packages

### 4. Database ORM: Prisma

**Decision**: Use Prisma as the ORM with PostgreSQL.

**Rationale**:
- Type-safe database access
- Auto-generated migrations
- Excellent TypeScript integration
- Built-in connection pooling

### 5. Frontend State: Zustand + TanStack Query

**Decision**:
- Zustand for client-only state (auth, UI state)
- TanStack Query for server state (data fetching, caching)

**Rationale**:
- Clear separation between client and server state
- TanStack Query handles caching, background refetch, optimistic updates
- Zustand is lightweight and simple for auth state

### 6. UI Component Library: Radix UI Primitives

**Decision**: Build on Radix UI primitives with custom CSS (BEM convention).

**Rationale**:
- Accessible by default (ARIA, keyboard navigation)
- Unstyled primitives allow full design control
- RTL support built-in

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Shared types package sync issues | Use TypeScript strict mode, CI validation |
| JWT token theft | HTTP-only cookies, short expiry, refresh rotation |
| Prisma cold start latency | Connection pooling, keep-alive in production |
| RTL styling complexity | CSS logical properties, dedicated RTL testing |

## Migration Plan

N/A - This is a greenfield implementation.

## Open Questions

1. Should refresh tokens be stored in HTTP-only cookies or localStorage?
   - **Recommendation**: HTTP-only cookies for better security
2. What is the expected concurrent user count for rate limiting configuration?
   - **Recommendation**: Start with 100 requests/15min for auth endpoints
