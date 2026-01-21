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
 * @description Creates a new task assignment
 * @param {Object} data - Assignment creation data
 * @param {string} data.userId - User ID to assign
 * @param {string} data.taskId - Task ID to assign
 * @param {string} data.assignedByAdminId - Admin user ID creating the assignment
 * @returns {Promise<Object>} Created task assignment
 * @throws {ValidationError} When user or task doesn't exist
 * @throws {ValidationError} When assignment already exists (duplicate)
 * @example
 * const assignment = await createTaskAssignment({
 *   userId: 'user-uuid',
 *   taskId: 'task-uuid',
 *   assignedByAdminId: 'admin-uuid'
 * });
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
 * @description Deletes a task assignment
 * @param {string} id - Assignment ID
 * @returns {Promise<void>}
 * @throws {NotFoundError} When assignment doesn't exist
 * @example
 * await deleteTaskAssignment('assignment-uuid');
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
 * @description Creates multiple task assignments using cartesian product
 * @param {Object} data - Bulk creation data
 * @param {string[]} data.userIds - Array of user IDs
 * @param {string[]} data.taskIds - Array of task IDs
 * @param {string} data.assignedByAdminId - Admin user ID
 * @returns {Promise<Object>} Created assignments and count
 * @throws {ValidationError} When arrays are empty
 * @example
 * const result = await bulkCreateTaskAssignments({
 *   userIds: ['user1', 'user2'],
 *   taskIds: ['task1', 'task2'],
 *   assignedByAdminId: 'admin-uuid'
 * });
 * // Returns: { created: [...], count: 4 }
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
