# Admin Assignments - DTOs and Schemas Reference

## Overview
All DTOs and validation schemas for the Admin Assignments module are defined in the `@shared/types` package and are shared between frontend and backend.

## DTOs (Data Transfer Objects)

### 1. TaskAssignmentDto
**Purpose**: Response DTO for assignment operations  
**File**: `shared/types/src/dtos/admin-assignments.dto.ts`

```typescript
interface TaskAssignmentDto {
    id: string;
    userId: string;
    taskId: string;
    createdAt: string;
    // Expanded details
    userName: string;
    userEmail: string;
    taskName: string;
    projectId: string;
    projectName: string;
    clientId: string;
    clientName: string;
    // Optional nested objects
    user?: AdminUserDto;
    task?: TaskDto;
}
```

**Usage**: Returned by all assignment endpoints (list, create, bulk create)

---

### 2. CreateTaskAssignmentRequestDto
**Purpose**: Request DTO for creating a single assignment  
**File**: `shared/types/src/dtos/admin-assignments.dto.ts`

```typescript
interface CreateTaskAssignmentRequestDto {
    userId: string;
    taskId: string;
}
```

**Validation Schema**: `createTaskAssignmentSchema`

**Usage**:
```typescript
// Frontend
await createAssignment({
    userId: 'user-123',
    taskId: 'task-456',
});

// Backend
router.post('/', validate(createTaskAssignmentSchema), controller.create);
```

---

### 3. BulkCreateTaskAssignmentsRequestDto
**Purpose**: Request DTO for creating multiple assignments via cartesian product  
**File**: `shared/types/src/dtos/admin-assignments.dto.ts`

```typescript
interface BulkCreateTaskAssignmentsRequestDto {
    userIds: string[];
    taskIds: string[];
}
```

**Validation Schema**: `bulkCreateTaskAssignmentsSchema`

**Example**:
```typescript
// Input
{
    userIds: ['user-1', 'user-2'],
    taskIds: ['task-A', 'task-B']
}

// Creates 4 assignments:
// (user-1, task-A)
// (user-1, task-B)
// (user-2, task-A)
// (user-2, task-B)
```

---

### 4. ListAssignmentsQueryDto
**Purpose**: Query parameters for filtering assignments list  
**File**: `shared/types/src/dtos/admin-assignments.dto.ts`

```typescript
interface ListAssignmentsQueryDto {
    userId?: string;      // Filter by user
    taskId?: string;      // Filter by task
    projectId?: string;   // Filter by project
    userName?: string;    // Search by user name (partial, case-insensitive)
}
```

**Validation Schema**: `listAssignmentsQuerySchema`

**Usage**:
```typescript
// Frontend
const assignments = await getAssignments({
    userId: 'user-123',
    userName: 'john',
});

// Backend route
GET /admin/assignments?userId=user-123&userName=john
```

---

### 5. Response Wrappers

#### TaskAssignmentResponseDto
```typescript
interface TaskAssignmentResponseDto {
    success: boolean;
    data: TaskAssignmentDto;
}
```

#### ListTaskAssignmentsResponseDto
```typescript
interface ListTaskAssignmentsResponseDto {
    success: boolean;
    data: TaskAssignmentDto[];
}
```

#### BulkTaskAssignmentsResponseDto
```typescript
interface BulkTaskAssignmentsResponseDto {
    success: boolean;
    data: {
        created: TaskAssignmentDto[];  // Newly created assignments
        count: number;                  // Total count created
    };
}
```

---

## Validation Schemas (Zod)

### File: `shared/types/src/zod/admin-assignments.schema.ts`

### 1. createTaskAssignmentSchema
```typescript
const createTaskAssignmentSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    taskId: z.string().min(1, 'Task ID is required'),
});
```

**Validates**:
- Both userId and taskId are non-empty strings

---

### 2. bulkCreateTaskAssignmentsSchema
```typescript
const bulkCreateTaskAssignmentsSchema = z.object({
    userIds: z.array(z.string().min(1)).min(1, 'At least one user ID is required'),
    taskIds: z.array(z.string().min(1)).min(1, 'At least one task ID is required'),
});
```

**Validates**:
- Arrays are not empty (min 1 element)
- All array elements are non-empty strings

---

### 3. listAssignmentsQuerySchema
```typescript
const listAssignmentsQuerySchema = z.object({
    userId: z.string().optional(),
    taskId: z.string().optional(),
    projectId: z.string().optional(),
    userName: z.string().optional(),
});
```

**Validates**:
- All fields are optional
- If provided, must be strings

---

## Usage Examples

### Backend Route with Validation

```typescript
import { validate } from '../middleware/validate.middleware';
import { 
    createTaskAssignmentSchema,
    bulkCreateTaskAssignmentsSchema,
    listAssignmentsQuerySchema
} from '@shared/types';

// Create single assignment
router.post(
    '/assignments',
    authenticate,
    requireAdmin,
    validate(createTaskAssignmentSchema),
    controller.createAssignment
);

// Bulk create
router.post(
    '/assignments/bulk',
    authenticate,
    requireAdmin,
    validate(bulkCreateTaskAssignmentsSchema),
    controller.bulkCreateAssignments
);

// List with query validation
router.get(
    '/assignments',
    authenticate,
    requireAdmin,
    validate(listAssignmentsQuerySchema, 'query'),
    controller.listAssignments
);
```

### Frontend Type-Safe API Calls

```typescript
import type {
    TaskAssignmentDto,
    CreateTaskAssignmentRequestDto,
    BulkCreateTaskAssignmentsRequestDto,
    ListAssignmentsQueryDto
} from '@shared/types';

// Type-safe function signatures
async function createAssignment(
    data: CreateTaskAssignmentRequestDto
): Promise<TaskAssignmentDto> {
    // Implementation
}

async function bulkCreateAssignments(
    data: BulkCreateTaskAssignmentsRequestDto
): Promise<{ count: number; assignments: TaskAssignmentDto[] }> {
    // Implementation
}

async function getAssignments(
    filters?: ListAssignmentsQueryDto
): Promise<TaskAssignmentDto[]> {
    // Implementation
}
```

---

## Export Structure

All types are exported from `@shared/types`:

```typescript
// shared/types/src/index.ts
export * from './dtos/admin-assignments.dto';
export * from './zod/admin-assignments.schema';
```

**Import in any project**:
```typescript
import {
    // DTOs
    TaskAssignmentDto,
    CreateTaskAssignmentRequestDto,
    BulkCreateTaskAssignmentsRequestDto,
    ListAssignmentsQueryDto,
    TaskAssignmentResponseDto,
    ListTaskAssignmentsResponseDto,
    BulkTaskAssignmentsResponseDto,
    
    // Schemas
    createTaskAssignmentSchema,
    bulkCreateTaskAssignmentsSchema,
    listAssignmentsQuerySchema,
} from '@shared/types';
```

---

## Benefits

1. **Type Safety**: Compile-time type checking across frontend and backend
2. **Single Source of Truth**: DTOs defined once, used everywhere
3. **Validation**: Zod schemas ensure runtime validation
4. **Documentation**: TypeScript interfaces serve as documentation
5. **Refactoring**: Changes propagate automatically across the codebase

---

## Related Files

- DTOs: `shared/types/src/dtos/admin-assignments.dto.ts`
- Schemas: `shared/types/src/zod/admin-assignments.schema.ts`
- Exports: `shared/types/src/index.ts`
- Backend Routes: `server/src/modules/admin/assignments/assignments.routes.ts`
- Frontend API: `client/apps/admin/src/api/assignmentsApi.ts`
