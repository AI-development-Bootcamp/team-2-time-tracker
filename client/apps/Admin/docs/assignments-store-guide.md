# Assignments Store Integration Guide

## Overview
The `assignmentsStore` is a Zustand store that manages all assignments state and operations.

## Store Structure

```typescript
interface AssignmentsState {
    assignments: TaskAssignmentDto[];      // List of assignments
    isLoading: boolean;                    // Loading state
    error: string | null;                  // Error message
    filters: {                             // Current filters
        userId?: string;
        taskId?: string;
        projectId?: string;
        userName?: string;
    };
}
```

## Available Actions

### 1. Fetch Assignments
```typescript
const { fetchAssignments, assignments, isLoading, error } = useAssignmentsStore();

// Fetch all assignments with current filters
await fetchAssignments();
```

### 2. Create Single Assignment
```typescript
const { createSingleAssignment } = useAssignmentsStore();

const newAssignment = await createSingleAssignment({
    userId: 'user-123',
    taskId: 'task-456',
});
```

### 3. Create Bulk Assignments
```typescript
const { createBulkAssignments } = useAssignmentsStore();

const result = await createBulkAssignments({
    userIds: ['user-1', 'user-2'],
    taskIds: ['task-a', 'task-b'],
});

console.log(`Created ${result.count} assignments`);
```

### 4. Remove Assignment
```typescript
const { removeAssignment } = useAssignmentsStore();

await removeAssignment('assignment-id');
```

### 5. Set Filters
```typescript
const { setFilters } = useAssignmentsStore();

// Automatically refetches with new filters
setFilters({ userId: 'user-123' });
```

## Integration Example: AssignmentsPage

### Option 1: Using the Store (Recommended)

```typescript
import { useEffect } from 'react';
import { useAssignmentsStore } from '../stores/assignmentsStore';

function AssignmentsPage() {
    const { 
        assignments, 
        isLoading, 
        error,
        fetchAssignments,
        removeAssignment,
        setFilters 
    } = useAssignmentsStore();

    // Fetch on mount
    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    // Handle filter change
    function handleUserFilterChange(userId: string) {
        setFilters({ userId: userId || undefined });
    }

    // Handle delete
    async function handleDelete(id: string) {
        if (confirm('Delete this assignment?')) {
            try {
                await removeAssignment(id);
                alert('Assignment deleted successfully');
            } catch (error) {
                alert('Failed to delete assignment');
            }
        }
    }

    return (
        <div>
            {/* Filters */}
            <select onChange={(e) => handleUserFilterChange(e.target.value)}>
                <option value="">All Users</option>
                {/* ... */}
            </select>

            {/* Table */}
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}
            {!isLoading && !error && (
                <table>
                    {/* Render assignments */}
                </table>
            )}
        </div>
    );
}
```

### Option 2: Using TanStack Query (Current Implementation)

The current `AssignmentsPage.tsx` uses TanStack Query directly. This is also valid and provides:
- Automatic caching
- Background refetching
- Optimistic updates

Both approaches are acceptable. The store provides:
- Centralized state management
- Easier testing
- Consistent state across components

## Form Integration

### BulkAssignmentForm with Store

```typescript
import { useAssignmentsStore } from '../stores/assignmentsStore';

function BulkAssignmentForm({ onClose, onSuccess }: Props) {
    const { createBulkAssignments } = useAssignmentsStore();

    async function handleSubmit() {
        try {
            const result = await createBulkAssignments({
                userIds: selectedUserIds,
                taskIds: selectedTaskIds,
            });
            alert(`Created ${result.count} assignments!`);
            onSuccess?.();
            onClose();
        } catch (error) {
            // Handle error
        }
    }

    // ... rest of component
}
```

### SingleAssignmentForm with Store

```typescript
import { useAssignmentsStore } from '../stores/assignmentsStore';

function SingleAssignmentForm({ onClose, onSuccess }: Props) {
    const { createSingleAssignment } = useAssignmentsStore();

    async function handleSubmit() {
        try {
            await createSingleAssignment({
                userId: selectedUserId,
                taskId: selectedTaskId,
            });
            alert('Assignment created successfully!');
            onSuccess?.();
            onClose();
        } catch (error) {
            // Handle error
        }
    }

    // ... rest of component
}
```

## Benefits of Using the Store

1. **Centralized State**: All assignment data in one place
2. **Automatic Updates**: Store updates automatically after CRUD operations
3. **Filter Management**: Built-in filter state and automatic refetching
4. **Error Handling**: Consistent error handling across all operations
5. **Type Safety**: Full TypeScript support with proper types

## Migration Path

If you want to migrate from TanStack Query to the store:

1. Replace `useQuery` with `useAssignmentsStore()`
2. Replace `useMutation` with store actions
3. Remove `queryClient.invalidateQueries()` calls (store handles updates)
4. Use `setFilters()` instead of updating query keys

Both approaches work well - choose based on your preference!
