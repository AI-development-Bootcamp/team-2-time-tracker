import { z } from 'zod';

// ===========================
// TASK ASSIGNMENT SCHEMAS
// ===========================

export const createTaskAssignmentSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    taskId: z.string().min(1, 'Task ID is required'),
});

export const bulkCreateTaskAssignmentsSchema = z.object({
    userIds: z.array(z.string().min(1)).min(1, 'At least one user ID is required'),
    taskIds: z.array(z.string().min(1)).min(1, 'At least one task ID is required'),
});
