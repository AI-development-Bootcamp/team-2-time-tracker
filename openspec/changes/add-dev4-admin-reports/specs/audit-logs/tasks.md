# Tasks: Audit Logs Module

**Spec**: `spec.md`

This module provides audit logging service and audit log viewer for tracking all admin actions.

## 1. Database Schema

### 1.1 Prisma Models
- [ ] 1.1.1 Add AuditLog model to `prisma/schema.prisma`
- [ ] 1.1.2 Add fields: entity, entityId, action, adminId, adminName, oldValue, newValue, createdAt
- [ ] 1.1.3 Add enum for AuditAction (CREATE, UPDATE, STATUS_CHANGE, RESET_PASSWORD, LOCK_MONTH, UNLOCK_MONTH)
- [ ] 1.1.4 Add enum for AuditEntity (USER, CLIENT, PROJECT, TASK, ASSIGNMENT, TIME_ENTRY, ABSENCE, MONTH_LOCK)
- [ ] 1.1.5 Create migration for audit_logs table
- [ ] 1.1.6 Add indexes on entity, entityId, adminId, and createdAt for filtering

## 2. Backend - Audit Logs Module

### 2.1 Module Structure
- [ ] 2.1.1 Create `server/src/modules/admin/audit-logs/audit-logs.routes.ts`
- [ ] 2.1.2 Create `server/src/modules/admin/audit-logs/audit-logs.controller.ts`
- [ ] 2.1.3 Create `server/src/modules/admin/audit-logs/audit-logs.service.ts`
- [ ] 2.1.4 Create `server/src/modules/admin/audit-logs/audit-logs.repo.ts`

### 2.2 Shared Audit Logger Service
- [ ] 2.2.1 Create `server/src/shared/audit-logger.ts` utility
- [ ] 2.2.2 Implement `logAuditAction()` function
- [ ] 2.2.3 Accept entity, entityId, action, adminId, adminName, oldValue?, newValue?
- [ ] 2.2.4 Store oldValue and newValue as JSON
- [ ] 2.2.5 Sanitize sensitive fields (e.g., passwords) before storing
- [ ] 2.2.6 Handle null/undefined values gracefully

### 2.3 List Audit Logs
- [ ] 2.3.1 Implement `GET /admin/audit-logs` endpoint
- [ ] 2.3.2 Add pagination support
- [ ] 2.3.3 Add filtering by entity query parameter
- [ ] 2.3.4 Add filtering by entityId query parameter
- [ ] 2.3.5 Add filtering by adminId query parameter
- [ ] 2.3.6 Add filtering by action query parameter
- [ ] 2.3.7 Add filtering by date range (fromDate, toDate)
- [ ] 2.3.8 Return audit logs sorted by createdAt DESC (newest first)

### 2.4 Get Audit Log
- [ ] 2.4.1 Implement `GET /admin/audit-logs/:id` endpoint
- [ ] 2.4.2 Return full audit log entry with all fields
- [ ] 2.4.3 Include oldValue and newValue JSON

### 2.5 Audit Logging Integration
- [ ] 2.5.1 Integrate audit logging in admin users module (create, update, status change, reset password)
- [ ] 2.5.2 Integrate audit logging in admin entities module (clients, projects, tasks - create, update, status change)
- [ ] 2.5.3 Integrate audit logging in admin assignments module (create, bulk create, delete)
- [ ] 2.5.4 Integrate audit logging in admin reports module (time entry edits, absence edits)
- [ ] 2.5.5 Integrate audit logging in month locks module (lock, unlock)
- [ ] 2.5.6 Ensure all admin actions are logged

## 3. Frontend - Audit Logs Viewer

**NOTE**: This module is responsible for creating shared admin components that will be reused by all other admin modules.

### 3.0 Shared Admin Components (Foundation)
- [ ] 3.0.1 Create `client/apps/admin/src/components/DataTable.tsx` (TanStack Table wrapper with pagination, sorting)
- [ ] 3.0.2 Create `client/apps/admin/src/components/StatusBadge.tsx` (reusable status badge component)
- [ ] 3.0.3 Create `client/apps/admin/src/components/PaginationControls.tsx` (reusable pagination controls)
- [ ] 3.0.4 Create `client/apps/admin/src/components/FilterPanel.tsx` (reusable filter panel layout)
- [ ] 3.0.5 Create `AdminLayout.tsx` with sidebar navigation structure
- [ ] 3.0.6 Set up admin app routing in admin app
- [ ] 3.0.7 Create shared Zustand store utilities for admin modules

### 3.1 Audit Logs Page
- [ ] 3.1.1 Create `client/apps/admin/src/pages/AuditLogsPage.tsx`
- [ ] 3.1.2 Implement audit logs data table with TanStack Table
- [ ] 3.1.3 Display columns: timestamp, admin name, entity, action, entityId
- [ ] 3.1.4 Add expandable rows to show old/new value diffs
- [ ] 3.1.5 Add pagination controls

### 3.2 Audit Log Filters
- [ ] 3.2.1 Create `AuditLogFilters.tsx` component
- [ ] 3.2.2 Add entity filter dropdown (USER, CLIENT, PROJECT, etc.)
- [ ] 3.2.3 Add action filter dropdown (CREATE, UPDATE, etc.)
- [ ] 3.2.4 Add admin filter dropdown (searchable)
- [ ] 3.2.5 Add date range picker (fromDate, toDate)
- [ ] 3.2.6 Add entityId search input
- [ ] 3.2.7 Add apply filters button

### 3.3 Value Diff Display
- [ ] 3.3.1 Create `ValueDiff.tsx` component
- [ ] 3.3.2 Display oldValue and newValue side by side
- [ ] 3.3.3 Highlight changed fields
- [ ] 3.3.4 Format JSON values for readability
- [ ] 3.3.5 Handle null/undefined values
- [ ] 3.3.6 Hide sensitive fields (passwords)

### 3.4 State Management
- [ ] 3.4.1 Create Zustand store for audit logs state
- [ ] 3.4.2 Implement fetch audit logs action
- [ ] 3.4.3 Implement fetch single audit log action
- [ ] 3.4.4 Implement filter actions
- [ ] 3.4.5 Store current filters in state

## 4. Shared Types & DTOs

### 4.1 Enums
- [ ] 4.1.1 Create `shared/types/src/enums/audit.enums.ts`
- [ ] 4.1.2 Define `AuditAction` enum (CREATE, UPDATE, STATUS_CHANGE, RESET_PASSWORD, LOCK_MONTH, UNLOCK_MONTH)
- [ ] 4.1.3 Define `AuditEntity` enum (USER, CLIENT, PROJECT, TASK, ASSIGNMENT, TIME_ENTRY, ABSENCE, MONTH_LOCK)

### 4.2 DTOs
- [ ] 4.2.1 Create `shared/types/src/dtos/audit-logs.dto.ts`
- [ ] 4.2.2 Define `AuditLogDto` (id, entity, entityId, action, adminId, adminName, oldValue, newValue, createdAt)
- [ ] 4.2.3 Define `ListAuditLogsQueryDto` (filters: entity, entityId, adminId, action, fromDate, toDate, pagination)
- [ ] 4.2.4 Define `AuditLogsListResponseDto` (with pagination)

### 4.3 Validation Schemas
- [ ] 4.3.1 Create `shared/types/src/zod/audit-logs.schema.ts`
- [ ] 4.3.2 Add Zod schema for ListAuditLogsQueryDto
- [ ] 4.3.3 Add date format validation for fromDate/toDate

### 4.4 Exports
- [ ] 4.4.1 Export audit enums from `shared/types/src/index.ts`
- [ ] 4.4.2 Export audit-logs DTOs from `shared/types/src/index.ts`

## 5. Testing

### 5.1 Backend Tests
- [ ] 5.1.1 Write unit tests for audit-logger utility
- [ ] 5.1.2 Write unit tests for audit-logs.service.ts
- [ ] 5.1.3 Write integration tests for list audit logs endpoint
- [ ] 5.1.4 Write integration tests for get audit log endpoint
- [ ] 5.1.5 Test all filtering options (entity, entityId, adminId, action, date range)
- [ ] 5.1.6 Test pagination
- [ ] 5.1.7 Test JSON storage of oldValue/newValue
- [ ] 5.1.8 Test sensitive field sanitization
- [ ] 5.1.9 Test audit logging integration in all admin modules

### 5.2 Frontend Tests
- [ ] 5.2.1 Write tests for AuditLogsPage.tsx
- [ ] 5.2.2 Write tests for AuditLogFilters.tsx
- [ ] 5.2.3 Write tests for ValueDiff.tsx
- [ ] 5.2.4 Write tests for audit logs store
- [ ] 5.2.5 Test filter application and clearing

## 6. Documentation

### 6.1 API Documentation
- [ ] 6.1.1 Document `GET /admin/audit-logs` in Swagger
- [ ] 6.1.2 Document `GET /admin/audit-logs/:id` in Swagger
- [ ] 6.1.3 Document all filter parameters
- [ ] 6.1.4 Document AuditAction enum values
- [ ] 6.1.5 Document AuditEntity enum values
- [ ] 6.1.6 Add request/response examples for all endpoints

### 6.2 Code Documentation
- [ ] 6.2.1 Add JSDoc comments to audit-logger utility
- [ ] 6.2.2 Add JSDoc comments to audit-logs.service.ts
- [ ] 6.2.3 Document audit logging patterns for other developers
- [ ] 6.2.4 Create usage examples for audit logger
- [ ] 6.2.5 Document how to integrate audit logging in new modules

### 6.3 Developer Guide
- [ ] 6.3.1 Create guide for using audit logger in other modules
- [ ] 6.3.2 Document when to use each AuditAction type
- [ ] 6.3.3 Document sensitive field handling

### 6.4 Shared Error Codes Documentation
- [ ] 6.4.1 Create `shared/types/src/errors/error-codes.md` documentation file
- [ ] 6.4.2 Document VALIDATION_001: Invalid date range (endDate must be >= startDate)
- [ ] 6.4.3 Document VALIDATION_002: Project date change conflicts with child task dates (includes conflicting task details)
- [ ] 6.4.4 Document MONTH_LOCK_001: Month is locked for editing
- [ ] 6.4.5 Document ASSIGNMENT_001: Cannot remove assignment with existing time entries
- [ ] 6.4.6 Document TASK_001: Cannot close task with existing time entries
- [ ] 6.4.7 Document error code conventions for other developers to follow
- [ ] 6.4.8 Export error code constants from `shared/types/src/errors/error-codes.ts`
