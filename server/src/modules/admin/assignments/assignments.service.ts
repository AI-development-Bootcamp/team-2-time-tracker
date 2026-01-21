/**
 * @fileoverview Assignments service for admin task assignment management
 * @module admin/assignments/assignments.service
 */

import { NotFoundError, ValidationError } from '../../../shared/errors';
import * as assignmentsRepo from './assignments.repo';

/**
 * @description Retrieves all task assignments with optional filtering
 * @param {Object} [filters] - Optional filters
 * @param {string} [filters.userId] - Filter by user ID
 * @param {string} [filters.taskId] - Filter by task ID
 * @param {string} [filters.projectId] - Filter by project ID
 * @param {string} [filters.userName] - Search by user full name (case-insensitive, partial match)
 * @returns {Promise<Array>} List of task assignments with user, task, project, and client details
 * @example
 * const assignments = await listTaskAssignments();
 * const userAssignments = await listTaskAssignments({ userId: 'user-uuid' });
 */
export async function listTaskAssignments(filters?: {
    userId?: string;
    taskId?: string;
    projectId?: string;
    userName?: string;
}) {
    const assignments = await assignmentsRepo.findAllTaskAssignments(filters);

    // Transform to match DTO structure
    return assignments.map((assignment) => ({
        id: assignment.id,
        userId: assignment.userId,
        taskId: assignment.taskId,
        createdAt: assignment.createdAt.toISOString(),
        userName: assignment.user.fullName,
        userEmail: assignment.user.email,
        taskName: assignment.task.name,
        projectId: assignment.task.projectId,
        projectName: assignment.task.project.name,
        clientId: assignment.task.project.clientId,
        clientName: assignment.task.project.client.name,
    }));
}

/**
 * @description Retrieves a single task assignment by ID
 * @param {string} id - Assignment ID
 * @returns {Promise<Object>} Task assignment with expanded details
 * @throws {NotFoundError} When assignment with given ID doesn't exist
 * @example
 * const assignment = await getTaskAssignmentById('assignment-uuid');
 */
export async function getTaskAssignmentById(id: string) {
    const assignment = await assignmentsRepo.findTaskAssignmentById(id);
    if (!assignment) {
        throw new NotFoundError('Task assignment not found');
    }

    // Transform to match DTO structure
    return {
        id: assignment.id,
        userId: assignment.userId,
        taskId: assignment.taskId,
        createdAt: assignment.createdAt.toISOString(),
        userName: assignment.user.fullName,
        userEmail: assignment.user.email,
        taskName: assignment.task.name,
        projectId: assignment.task.projectId,
        projectName: assignment.task.project.name,
        clientId: assignment.task.project.clientId,
        clientName: assignment.task.project.client.name,
    };
}

/**
 * Creates a new task assignment
 * 
 * @description
 * Assigns a single user to a single task. This operation validates that both the user and task exist
 * before creating the assignment.
 * 
 * **Duplicate Handling Strategy:**
 * The function implements an idempotent behavior through database-level unique constraints.
 * If an assignment with the same (userId, taskId) combination already exists, a ValidationError
 * is thrown with code 'VALIDATION_DUPLICATE_ASSIGNMENT'. This prevents duplicate assignments
 * at the database level.
 * 
 * **Validation Flow:**
 * 1. Check if user exists (throws VALIDATION_USER_NOT_FOUND if not)
 * 2. Check if task exists (throws VALIDATION_TASK_NOT_FOUND if not)
 * 3. Attempt to create assignment
 * 4. Handle unique constraint violation (Prisma error P2002) if duplicate
 * 
 * @param {Object} data - Assignment creation data
 * @param {string} data.userId - User ID to assign to the task
 * @param {string} data.taskId - Task ID to assign the user to
 * @param {string} data.assignedByAdminId - Admin user ID creating the assignment (for audit purposes)
 * @returns {Promise<Object>} Created task assignment with enriched user and task details
 * @throws {ValidationError} CODE: VALIDATION_USER_NOT_FOUND - When user doesn't exist
 * @throws {ValidationError} CODE: VALIDATION_TASK_NOT_FOUND - When task doesn't exist
 * @throws {ValidationError} CODE: VALIDATION_DUPLICATE_ASSIGNMENT - When assignment already exists
 * 
 * @example
 * // Create a single assignment
 * const assignment = await createTaskAssignment({
 *   userId: 'e5f6a7b8-c9d0-1234-ef01-34567890abcd',
 *   taskId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
 *   assignedByAdminId: 'admin-uuid'
 * });
 * // Returns:
 * // {
 * //   id: 'd4e5f6a7-b8c9-0123-defg-234567890123',
 * //   userId: 'e5f6a7b8-c9d0-1234-ef01-34567890abcd',
 * //   taskId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
 * //   createdAt: '2026-01-20T10:00:00.000Z',
 * //   userName: 'John Doe',
 * //   userEmail: 'john.doe@example.com',
 * //   taskName: 'Design Homepage',
 * //   projectId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
 * //   projectName: 'Website Redesign',
 * //   clientId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 * //   clientName: 'Acme Corporation'
 * // }
 */
export async function createTaskAssignment(data: {
    userId: string;
    taskId: string;
    assignedByAdminId: string;
}) {
    // Validate user exists
    const userExistsResult = await assignmentsRepo.userExists(data.userId);
    if (!userExistsResult) {
        throw new ValidationError('User not found', 'VALIDATION_USER_NOT_FOUND');
    }

    // Validate task exists
    const taskExistsResult = await assignmentsRepo.taskExists(data.taskId);
    if (!taskExistsResult) {
        throw new ValidationError('Task not found', 'VALIDATION_TASK_NOT_FOUND');
    }

    try {
        const assignment = await assignmentsRepo.createTaskAssignment(data);

        // Transform to match DTO structure
        return {
            id: assignment.id,
            userId: assignment.userId,
            taskId: assignment.taskId,
            createdAt: assignment.createdAt.toISOString(),
            userName: assignment.user.fullName,
            userEmail: assignment.user.email,
            taskName: assignment.task.name,
            projectId: assignment.task.projectId,
            projectName: assignment.task.project.name,
            clientId: assignment.task.project.clientId,
            clientName: assignment.task.project.client.name,
        };
    } catch (error: unknown) {
        // Handle unique constraint violation (duplicate assignment)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            throw new ValidationError(
                'Task assignment already exists for this user and task',
                'VALIDATION_DUPLICATE_ASSIGNMENT'
            );
        }
        throw error;
    }
}

/**
 * Deletes a task assignment with safety checks
 * 
 * @description
 * Removes a task assignment from the system. This operation includes safety checks to prevent
 * data integrity issues.
 * 
 * **Safety Mechanism:**
 * Before deletion, the function checks if the assignment has any associated time entries.
 * If time entries exist, deletion is prevented to maintain referential integrity and historical
 * accuracy of time tracking data.
 * 
 * **Use Case:**
 * This is typically used when:
 * - An employee is reassigned from a task before any work has been logged
 * - A task assignment was created in error
 * - Administrative cleanup of unused assignments
 * 
 * @param {string} id - Assignment ID (UUID)
 * @returns {Promise<void>} Resolves when assignment is successfully deleted
 * @throws {NotFoundError} When assignment with given ID doesn't exist
 * @throws {ValidationError} CODE: VALIDATION_ASSIGNMENT_HAS_TIME_ENTRIES - When assignment has time entries
 * 
 * @example
 * // Delete an assignment (only works if no time entries exist)
 * await deleteTaskAssignment('d4e5f6a7-b8c9-0123-defg-234567890123');
 */
export async function deleteTaskAssignment(id: string) {
    // Check if assignment exists
    const assignment = await assignmentsRepo.findTaskAssignmentById(id);
    if (!assignment) {
        throw new NotFoundError('Task assignment not found');
    }

    // Check if assignment has time entries
    const hasTimeEntries = await assignmentsRepo.assignmentHasTimeEntries(id);
    if (hasTimeEntries) {
        throw new ValidationError(
            'Cannot delete assignment with existing time entries',
            'VALIDATION_ASSIGNMENT_HAS_TIME_ENTRIES'
        );
    }

    await assignmentsRepo.deleteTaskAssignment(id);
}


/**
 * Creates multiple task assignments using cartesian product logic
 * 
 * @description
 * Performs bulk assignment creation by generating all possible combinations (cartesian product)
 * of the provided user IDs and task IDs.
 * 
 * **Cartesian Product Implementation:**
 * The cartesian product creates every possible pairing between users and tasks.
 * Mathematical formula: |users| × |tasks| = total assignments
 * 
 * Example:
 * ```
 * userIds: [U1, U2]
 * taskIds: [T1, T2, T3]
 * 
 * Cartesian Product generates:
 * U1 → T1
 * U1 → T2
 * U1 → T3
 * U2 → T1
 * U2 → T2
 * U2 → T3
 * 
 * Total: 2 users × 3 tasks = 6 assignments
 * ```
 * 
 * **Duplicate Handling Strategy:**
 * The function uses `skipDuplicates: true` in Prisma's createMany operation.
 * This means:
 * - Existing assignments (matching userId + taskId) are silently skipped
 * - Only new assignments are created
 * - The operation is fully idempotent
 * - No errors are thrown for duplicates
 * - The response only includes newly created assignments
 * 
 * **Performance Considerations:**
 * - Uses Prisma's bulk insert for efficiency
 * - Single database transaction for all inserts
 * - Skips duplicates at database level (no application-level filtering)
 * 
 * **Use Cases:**
 * - Assigning a team of users to multiple related tasks
 * - Setting up a new project with predefined user-task mappings
 * - Administrative bulk operations
 * 
 * @param {Object} data - Bulk creation data
 * @param {string[]} data.userIds - Array of user IDs (must not be empty)
 * @param {string[]} data.taskIds - Array of task IDs (must not be empty)
 * @param {string} data.assignedByAdminId - Admin user ID performing the bulk operation
 * @returns {Promise<Object>} Object containing created assignments array and count
 * @returns {Array} returns.created - Array of successfully created assignments with full details
 * @returns {number} returns.count - Total number of assignments created (excludes skipped duplicates)
 * @throws {ValidationError} When userIds or taskIds arrays are empty (validated by Zod schema)
 * 
 * @example
 * // Assign 2 users to 3 tasks = 6 total assignments
 * const result = await bulkCreateTaskAssignments({
 *   userIds: [
 *     'e5f6a7b8-c9d0-1234-ef01-34567890abcd',
 *     'f6a7b8c9-d0e1-2345-f012-45678901bcde'
 *   ],
 *   taskIds: [
 *     'c3d4e5f6-a7b8-9012-cdef-123456789012',
 *     'd4e5f6a7-b8c9-0123-defg-234567890123',
 *     'e5f6a7b8-c9d0-1234-ef01-34567890def0'
 *   ],
 *   assignedByAdminId: 'admin-uuid'
 * });
 * // Returns:
 * // {
 * //   created: [
 * //     { id: '...', userId: 'e5f6...', taskId: 'c3d4...', userName: 'John Doe', ... },
 * //     { id: '...', userId: 'e5f6...', taskId: 'd4e5...', userName: 'John Doe', ... },
 * //     ... (4 more assignments)
 * //   ],
 * //   count: 6  // Could be less if some assignments already existed
 * // }
 */
export async function bulkCreateTaskAssignments(data: {
    userIds: string[];
    taskIds: string[];
    assignedByAdminId: string;
}) {
    // Import here to avoid circular dependency issues
    const { calculateCartesianProduct } = await import('@shared/types');

    // Generate all combinations
    const combinations = calculateCartesianProduct(data.userIds, data.taskIds);

    // Map to assignment objects
    const assignmentsToCreate = combinations.map(combo => ({
        userId: combo.userId,
        taskId: combo.taskId,
        assignedByAdminId: data.assignedByAdminId,
    }));

    // Bulk create (skips duplicates)
    const createdAssignments = await assignmentsRepo.bulkCreateTaskAssignments(
        assignmentsToCreate
    );

    // Transform to DTO structure
    const transformed = createdAssignments.map((assignment) => ({
        id: assignment.id,
        userId: assignment.userId,
        taskId: assignment.taskId,
        createdAt: assignment.createdAt.toISOString(),
        userName: assignment.user.fullName,
        userEmail: assignment.user.email,
        taskName: assignment.task.name,
        projectId: assignment.task.projectId,
        projectName: assignment.task.project.name,
        clientId: assignment.task.project.clientId,
        clientName: assignment.task.project.client.name,
    }));

    return {
        created: transformed,
        count: transformed.length,
    };
}
