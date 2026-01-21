/**
 * @fileoverview Unit tests for assignments.service.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    mockPrisma,
    mockPrismaTaskAssignment,
    mockPrismaUser,
    mockPrismaTask,
    resetPrismaMocks,
    createMockTaskAssignment,
    createMockUser,
    createMockTask,
} from '../helpers/mockPrisma';
import * as assignmentsService from '../../src/modules/admin/assignments/assignments.service';
import { NotFoundError, ValidationError } from '../../src/shared/errors';

// Mock assignments repository
vi.mock('../../src/modules/admin/assignments/assignments.repo', () => ({
    findAllTaskAssignments: vi.fn(),
    createTaskAssignment: vi.fn(),
    bulkCreateTaskAssignments: vi.fn(),
    findTaskAssignmentById: vi.fn(),
    deleteTaskAssignment: vi.fn(),
    userExists: vi.fn(),
    taskExists: vi.fn(),
    assignmentHasTimeEntries: vi.fn(),
}));

import * as assignmentsRepo from '../../src/modules/admin/assignments/assignments.repo';

describe('assignments.service', () => {
    beforeEach(() => {
        resetPrismaMocks();
        vi.clearAllMocks();
    });

    describe('listTaskAssignments', () => {
        it('should return list of assignments', async () => {
            const mockAssignment = createMockTaskAssignment();
            (assignmentsRepo.findAllTaskAssignments as any).mockResolvedValue([mockAssignment]);

            const result = await assignmentsService.listTaskAssignments({});

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(mockAssignment.id);
            expect(assignmentsRepo.findAllTaskAssignments).toHaveBeenCalledWith({});
        });

        it('should pass filters to repository', async () => {
            const filters = { userId: 'user-1', taskId: 'task-1' };
            (assignmentsRepo.findAllTaskAssignments as any).mockResolvedValue([]);

            await assignmentsService.listTaskAssignments(filters);

            expect(assignmentsRepo.findAllTaskAssignments).toHaveBeenCalledWith(filters);
        });
    });

    describe('createTaskAssignment', () => {
        const dto = { userId: 'user-1', taskId: 'task-1', assignedByAdminId: 'admin-1' };

        it('should create assignment when valid', async () => {
            const mockAssignment = createMockTaskAssignment({ userId: dto.userId, taskId: dto.taskId });

            (assignmentsRepo.userExists as any).mockResolvedValue(true);
            (assignmentsRepo.taskExists as any).mockResolvedValue(true);
            (assignmentsRepo.createTaskAssignment as any).mockResolvedValue(mockAssignment);

            const result = await assignmentsService.createTaskAssignment(dto);

            expect(result.id).toBe(mockAssignment.id);
            expect(assignmentsRepo.createTaskAssignment).toHaveBeenCalledWith(dto);
        });

        it('should throw ValidationError if user does not exist', async () => {
            (assignmentsRepo.userExists as any).mockResolvedValue(false);

            await expect(assignmentsService.createTaskAssignment(dto)).rejects.toThrow(ValidationError);
            expect(assignmentsRepo.createTaskAssignment).not.toHaveBeenCalled();
        });

        it('should throw ValidationError if task does not exist', async () => {
            (assignmentsRepo.userExists as any).mockResolvedValue(true);
            (assignmentsRepo.taskExists as any).mockResolvedValue(false);

            await expect(assignmentsService.createTaskAssignment(dto)).rejects.toThrow(ValidationError);
            expect(assignmentsRepo.createTaskAssignment).not.toHaveBeenCalled();
        });
    });

    describe('bulkCreateTaskAssignments', () => {
        const dto = { userIds: ['user-1', 'user-2'], taskIds: ['task-1'], assignedByAdminId: 'admin-1' };

        it('should create valid assignments and skip existing ones', async () => {
            const mockAssignments = [
                createMockTaskAssignment({ userId: 'user-1', taskId: 'task-1' }),
                createMockTaskAssignment({ userId: 'user-2', taskId: 'task-1' }),
            ];

            (assignmentsRepo.bulkCreateTaskAssignments as any).mockResolvedValue(mockAssignments);

            const result = await assignmentsService.bulkCreateTaskAssignments(dto);

            expect(result.count).toBe(2);
            expect(result.created).toHaveLength(2);
            expect(assignmentsRepo.bulkCreateTaskAssignments).toHaveBeenCalled();
        });
    });

    describe('deleteTaskAssignment', () => {
        const assignmentId = 'assignment-1';

        it('should delete assignment if no time entries exist', async () => {
            const mockAssignment = createMockTaskAssignment({ id: assignmentId });
            (assignmentsRepo.findTaskAssignmentById as any).mockResolvedValue(mockAssignment);
            (assignmentsRepo.assignmentHasTimeEntries as any).mockResolvedValue(false);

            await assignmentsService.deleteTaskAssignment(assignmentId);

            expect(assignmentsRepo.deleteTaskAssignment).toHaveBeenCalledWith(assignmentId);
        });

        it('should throw NotFoundError if assignment does not exist', async () => {
            (assignmentsRepo.findTaskAssignmentById as any).mockResolvedValue(null);

            await expect(assignmentsService.deleteTaskAssignment(assignmentId)).rejects.toThrow(NotFoundError);
            expect(assignmentsRepo.deleteTaskAssignment).not.toHaveBeenCalled();
        });

        it('should throw ValidationError if time entries exist', async () => {
            const mockAssignment = createMockTaskAssignment({ id: assignmentId });
            (assignmentsRepo.findTaskAssignmentById as any).mockResolvedValue(mockAssignment);
            (assignmentsRepo.assignmentHasTimeEntries as any).mockResolvedValue(true);

            await expect(assignmentsService.deleteTaskAssignment(assignmentId)).rejects.toThrow(ValidationError);
            expect(assignmentsRepo.deleteTaskAssignment).not.toHaveBeenCalled();
        });
    });
});
