# Tasks: Month Locks Module

**Spec**: `spec.md`

This module handles month locking/unlocking to prevent edits for payroll processing.

## 1. Database Schema

### 1.1 Prisma Models
- [x] 1.1.1 Add MonthLock model to `prisma/schema.prisma` (EXISTS - see line 117 in schema.prisma)
- [x] 1.1.2 Add fields: month, lockedByAdminId, lockedAt, unlockedByAdminId, unlockedAt (EXISTS - note: no 'reason' field, no 'isLocked' boolean - lock status is derived from unlockedAt being null or not)
- [x] 1.1.3 Add unique constraint on month field (EXISTS)
- [x] 1.1.4 Create migration for month_locks table (ASSUMED - table exists)
- [x] 1.1.5 Add index on month field for fast lookups (EXISTS)

## 2. Backend - Month Locks Module

### 2.1 Module Structure
- [ ] 2.1.1 Create `server/src/modules/admin/month-locks/month-locks.routes.ts`
- [ ] 2.1.2 Create `server/src/modules/admin/month-locks/month-locks.controller.ts`
- [ ] 2.1.3 Create `server/src/modules/admin/month-locks/month-locks.service.ts`
- [ ] 2.1.4 Create `server/src/modules/admin/month-locks/month-locks.repo.ts`

### 2.2 List and Check Lock Status
- [ ] 2.2.1 Implement `GET /admin/month-locks` endpoint
- [ ] 2.2.2 Return all month lock records with history
- [ ] 2.2.3 Implement `GET /admin/month-locks/status/:month` endpoint
- [ ] 2.2.4 Derive isLocked status (isLocked = unlockedAt === null)
- [ ] 2.2.5 Include lockedBy admin info if locked
- [ ] 2.2.6 Include unlockedBy admin info if unlocked

### 2.3 Lock Month
- [ ] 2.3.1 Implement `POST /admin/month-locks/lock` endpoint
- [ ] 2.3.2 Accept month parameter only
- [ ] 2.3.3 Create or update month lock record (set unlockedAt to null)
- [ ] 2.3.4 Set lockedByAdminId to current admin
- [ ] 2.3.5 Set lockedAt to current timestamp

### 2.4 Unlock Month
- [ ] 2.4.1 Implement `POST /admin/month-locks/unlock` endpoint
- [ ] 2.4.2 Accept month parameter only
- [ ] 2.4.3 Update month lock record (set unlockedAt to current timestamp)
- [ ] 2.4.4 Set unlockedByAdminId to current admin
- [ ] 2.4.5 Keep lockedByAdminId and lockedAt unchanged (preserve lock history)

### 2.5 Month Lock Validation Integration
- [ ] 2.5.1 Create shared `validateMonthLock()` helper function (checks if unlockedAt is null)
- [ ] 2.5.2 Add month lock check to workday service (submit/cancel)
- [ ] 2.5.3 Add month lock check to time-entry service (create/update/delete)
- [ ] 2.5.4 Add month lock check to timer service (start/stop/cancel)
- [ ] 2.5.5 Add month lock check to absence service (create/update/delete)
- [ ] 2.5.6 Return MONTH_LOCK_001 error if month is locked (was WORKDAY_001)
- [ ] 2.5.7 Allow admin operations to bypass month lock (in admin endpoints)

## 3. Frontend - Month Locks Management

### 3.1 Month Locks Page
- [ ] 3.1.1 Create `client/apps/admin/src/pages/MonthLocksPage.tsx`
- [ ] 3.1.2 Display table of all month locks with status (derived from unlockedAt)
- [ ] 3.1.3 Show lock/unlock history for each month
- [ ] 3.1.4 Display locked by admin name and timestamp
- [ ] 3.1.5 Display unlocked by admin name and timestamp (if unlocked)
- [ ] 3.1.6 Derive and display current lock status badge

### 3.2 Month Lock Toggle
- [ ] 3.2.1 Create `MonthLockToggle.tsx` component
- [ ] 3.2.2 Add month selector (month/year picker)
- [ ] 3.2.3 Show current lock status (derived from unlockedAt)
- [ ] 3.2.4 Add lock button (if unlocked)
- [ ] 3.2.5 Add unlock button (if locked)
- [ ] 3.2.6 Show confirmation dialog before lock/unlock
- [ ] 3.2.7 Display success/error messages

### 3.3 Lock Status Display
- [ ] 3.3.1 Add lock status indicator to calendar views (user app)
- [ ] 3.3.2 Show locked month icon/badge
- [ ] 3.3.3 Disable edit buttons when month is locked
- [ ] 3.3.4 Show tooltip explaining month is locked

### 3.4 State Management
- [ ] 3.4.1 Create Zustand store for month locks state
- [ ] 3.4.2 Implement fetch month locks action
- [ ] 3.4.3 Implement check lock status action
- [ ] 3.4.4 Implement lock month action
- [ ] 3.4.5 Implement unlock month action

## 4. Shared Types & DTOs

### 4.1 DTOs
- [ ] 4.1.1 Create `shared/types/src/dtos/month-locks.dto.ts`
- [ ] 4.1.2 Define `MonthLockDto` (month, lockedByAdminId, lockedBy, lockedAt, unlockedByAdminId?, unlockedBy?, unlockedAt?)
- [ ] 4.1.3 Add computed field helper `isLocked` getter (returns unlockedAt === null)
- [ ] 4.1.4 Define `LockMonthDto` (month only)
- [ ] 4.1.5 Define `UnlockMonthDto` (month only)
- [ ] 4.1.6 Define `MonthLockStatusDto` (month, isLocked, lockedBy?, lockedAt?, unlockedBy?, unlockedAt?)

### 4.2 Validation Schemas
- [ ] 4.2.1 Create `shared/types/src/zod/month-locks.schema.ts`
- [ ] 4.2.2 Add Zod schema for LockMonthDto
- [ ] 4.2.3 Add Zod schema for UnlockMonthDto
- [ ] 4.2.4 Add month format validation (YYYY-MM)

### 4.3 Exports
- [ ] 4.3.1 Export month-locks DTOs from `shared/types/src/index.ts`

## 5. Testing

### 5.1 Backend Tests
- [ ] 5.1.1 Write unit tests for month-locks.service.ts
- [ ] 5.1.2 Write integration tests for list month locks endpoint
- [ ] 5.1.3 Write integration tests for check lock status endpoint
- [ ] 5.1.4 Write integration tests for lock month endpoint
- [ ] 5.1.5 Write integration tests for unlock month endpoint
- [ ] 5.1.6 Test month lock prevents workday edits
- [ ] 5.1.7 Test month lock prevents time entry edits
- [ ] 5.1.8 Test month lock prevents timer start
- [ ] 5.1.9 Test month lock prevents absence edits
- [ ] 5.1.10 Test admin override allows edits in locked month

### 5.2 Frontend Tests
- [ ] 5.2.1 Write tests for MonthLocksPage.tsx
- [ ] 5.2.2 Write tests for MonthLockToggle.tsx
- [ ] 5.2.3 Write tests for lock status display components
- [ ] 5.2.4 Write tests for month locks store
- [ ] 5.2.5 Test disabled state when month is locked

## 6. Documentation

### 6.1 API Documentation
- [ ] 6.1.1 Document `GET /admin/month-locks` in Swagger
- [ ] 6.1.2 Document `GET /admin/month-locks/status/:month` in Swagger
- [ ] 6.1.3 Document `POST /admin/month-locks/lock` in Swagger
- [ ] 6.1.4 Document `POST /admin/month-locks/unlock` in Swagger
- [ ] 6.1.5 Document month lock validation behavior
- [ ] 6.1.6 Document admin override behavior
- [ ] 6.1.7 Add request/response examples for all endpoints

### 6.2 Code Documentation
- [ ] 6.2.1 Add JSDoc comments to month-locks.service.ts
- [ ] 6.2.2 Document month lock validation logic
- [ ] 6.2.3 Document integration with other modules
- [ ] 6.2.4 Document admin override pattern for other developers
