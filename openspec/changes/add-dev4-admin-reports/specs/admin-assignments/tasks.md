# Tasks: Admin Assignments Module

**Spec**: `spec.md`

This module handles task-to-user assignments with single and bulk assignment capabilities.

## 1. Database Schema

**NOTE**: This module owns the TaskAssignment schema. **DEPENDENCY**: Requires Admin Entities module to complete Task and User models first.

### 1.1 Prisma Models
- [x] 1.1.1 Add TaskAssignment model to `prisma/schema.prisma` (id, userId, taskId, createdAt, updatedAt)
- [x] 1.1.2 Add relations: TaskAssignment.user, TaskAssignment.task, User.taskAssignments[], Task.userAssignments[]
- [x] 1.1.3 Add unique constraint on (userId, taskId) combination (@@unique([userId, taskId]))
- [x] 1.1.4 Create migration for task_assignments table
- [x] 1.1.5 Add indexes for userId and taskId queries

## 2. Backend - Assignments Module

### 2.1 Module Structure
- [x] 2.1.1 Create `server/src/modules/admin/assignments/assignments.routes.ts`
- [x] 2.1.2 Create `server/src/modules/admin/assignments/assignments.controller.ts`
- [x] 2.1.3 Create `server/src/modules/admin/assignments/assignments.service.ts`
- [x] 2.1.4 Create `server/src/modules/admin/assignments/assignments.repo.ts`

### 2.2 List Assignments
- [x] 2.2.1 Implement `GET /admin/assignments` endpoint
- [x] 2.2.2 Add filtering by userId query parameter
- [x] 2.2.3 Add filtering by taskId query parameter
- [x] 2.2.4 Include user and task details in response

### 2.3 Create Single Assignment
- [x] 2.3.1 Implement `POST /admin/assignments` endpoint
- [x] 2.3.2 Validate userId exists
- [x] 2.3.3 Validate taskId exists
- [x] 2.3.4 Handle duplicate assignments (idempotent operation or validation error)

### 2.4 Bulk Assignments
- [x] 2.4.1 Implement `POST /admin/assignments/bulk` endpoint
- [x] 2.4.2 Accept arrays of userIds and taskIds
- [x] 2.4.3 Create shared utility `calculateCartesianProduct(userIds, taskIds)` in `shared/utils/src/cartesian.ts`
- [x] 2.4.4 Generate cartesian product of all combinations using utility
- [x] 2.4.5 Create assignments for all combinations
- [x] 2.4.6 Skip duplicate assignments (idempotent)
- [x] 2.4.7 Return count of created assignments

### 2.5 Remove Assignment
- [x] 2.5.1 Implement `DELETE /admin/assignments/:id` endpoint
- [x] 2.5.2 Check if assignment has associated time entries
- [x] 2.5.3 Return validation error if time entries exist (or allow with warning)

## 3. Frontend - Assignments Management

### 3.1 Assignments Page
- [x] 3.1.1 Create `client/apps/admin/src/pages/AssignmentsPage.tsx`
- [x] 3.1.2 Implement assignments data table with TanStack Table
- [x] 3.1.3 Display user name and task name in table
- [x] 3.1.4 Add delete action for each row
- [x] 3.1.5 Add user filter dropdown
- [x] 3.1.6 Add task filter dropdown

### 3.2 Bulk Assignment Form
- [x] 3.2.1 Create `BulkAssignmentForm.tsx` component
- [x] 3.2.2 Add multi-select for users
- [x] 3.2.3 Add multi-select for tasks
- [x] 3.2.4 Import and use shared `calculateCartesianProduct` utility to display preview count
- [x] 3.2.5 Show confirmation dialog before bulk creation
- [x] 3.2.6 Display success message with count of created assignments

### 3.3 Single Assignment Form
- [x] 3.3.1 Create single assignment form dialog
- [x] 3.3.2 Add user selector dropdown
- [x] 3.3.3 Add task selector dropdown
- [x] 3.3.4 Filter tasks by project (optional)
- [x] 3.3.5 Handle duplicate assignment errors

### 3.4 State Management
- [x] 3.4.1 Create Zustand store for assignments state
- [x] 3.4.2 Implement fetch assignments action
- [x] 3.4.3 Implement create single assignment action
- [x] 3.4.4 Implement create bulk assignments action
- [x] 3.4.5 Implement remove assignment action

## 4. Shared Types & DTOs

### 4.1 DTOs
- [x] 4.1.1 Create `shared/types/src/dtos/admin-assignments.dto.ts`
- [x] 4.1.2 Define `ListAssignmentsQueryDto` (with filters)
- [x] 4.1.3 Define `CreateAssignmentDto` (userId, taskId)
- [x] 4.1.4 Define `BulkCreateAssignmentsDto` (userIds[], taskIds[])
- [x] 4.1.5 Define `AssignmentResponseDto`
- [x] 4.1.6 Define `BulkCreateResponseDto` (count of created)

### 4.2 Validation Schemas
- [x] 4.2.1 Create `shared/types/src/zod/admin-assignments.schema.ts`
- [x] 4.2.2 Add Zod schema for ListAssignmentsQueryDto
- [x] 4.2.3 Add Zod schema for CreateAssignmentDto
- [x] 4.2.4 Add Zod schema for BulkCreateAssignmentsDto
- [x] 4.2.5 Validate arrays are not empty in bulk creation

### 4.3 Exports
- [x] 4.3.1 Export admin-assignments DTOs from `shared/types/src/index.ts`

## 5. Testing

### 5.1 Backend Tests
- [x] 5.1.1 Write unit tests for assignments.service.ts
- [x] 5.1.2 Write unit tests for cartesian product utility
- [x] 5.1.3 Write integration tests for list assignments endpoint
- [x] 5.1.4 Write integration tests for create single assignment endpoint
- [x] 5.1.5 Write integration tests for bulk create endpoint
- [x] 5.1.6 Test cartesian product logic (verify all combinations created)
- [x] 5.1.7 Write integration tests for delete assignment endpoint
- [x] 5.1.8 Test duplicate assignment handling
- [x] 5.1.9 Test validation when removing assignment with time entries

### 5.2 Frontend Tests
- [ ] 5.2.1 Write tests for AssignmentsPage.tsx
- [ ] 5.2.2 Write tests for BulkAssignmentForm.tsx
- [ ] 5.2.3 Write tests for single assignment form
- [ ] 5.2.4 Write tests for assignments store
- [ ] 5.2.5 Test cartesian product preview calculation (using shared utility)

## 6. Documentation

### 6.1 API Documentation
- [x] 6.1.1 Document `GET /admin/assignments` in Swagger
- [x] 6.1.2 Document `POST /admin/assignments` in Swagger
- [x] 6.1.3 Document `POST /admin/assignments/bulk` in Swagger
- [x] 6.1.4 Document `DELETE /admin/assignments/:id` in Swagger
- [x] 6.1.5 Add examples showing cartesian product logic
- [x] 6.1.6 Add request/response examples for all endpoints

### 6.2 Code Documentation
- [x] 6.2.1 Add JSDoc comments to assignments.service.ts
- [x] 6.2.2 Document cartesian product implementation
- [x] 6.2.3 Document duplicate handling strategy
