/**
 * @fileoverview Unit tests for tasks.service.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    resetPrismaMocks,
    createMockTask,
    createMockProject,
} from '../helpers/mockPrisma';

// Import after mocks
import * as tasksService from '../../src/modules/admin/entities/tasks.service';
import * as tasksRepo from '../../src/modules/admin/entities/tasks.repo';
import * as projectsRepo from '../../src/modules/admin/entities/projects.repo';
import { NotFoundError, ValidationError } from '../../src/shared/errors';
import { TaskStatus } from '@shared/types';

// Mock the tasks and projects repositories
vi.mock('../../src/modules/admin/entities/tasks.repo');
vi.mock('../../src/modules/admin/entities/projects.repo');

describe('tasks.service', () => {
    beforeEach(() => {
        resetPrismaMocks();
        vi.clearAllMocks();
    });

    describe('listTasks', () => {
        it('should return all tasks', async () => {
            const mockTasks = [
                createMockTask({ id: '1', name: 'Task 1' }),
                createMockTask({ id: '2', name: 'Task 2' }),
            ];

            vi.mocked(tasksRepo.findAllTasks).mockResolvedValue(mockTasks);

            const result = await tasksService.listTasks();

            expect(result).toHaveLength(2);
            expect(result).toEqual(mockTasks);
            expect(tasksRepo.findAllTasks).toHaveBeenCalledOnce();
        });

        it('should return tasks filtered by projectId', async () => {
            const mockTasks = [createMockTask({ projectId: 'project-1' })];
            vi.mocked(tasksRepo.findAllTasks).mockResolvedValue(mockTasks);

            const result = await tasksService.listTasks('project-1');

            expect(result).toEqual(mockTasks);
            expect(tasksRepo.findAllTasks).toHaveBeenCalledWith('project-1');
        });

        it('should return empty array when no tasks exist', async () => {
            vi.mocked(tasksRepo.findAllTasks).mockResolvedValue([]);

            const result = await tasksService.listTasks();

            expect(result).toHaveLength(0);
            expect(result).toEqual([]);
        });
    });

    describe('getTaskById', () => {
        it('should return task when found', async () => {
            const mockTask = createMockTask();
            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(mockTask);

            const result = await tasksService.getTaskById('test-id');

            expect(result).toEqual(mockTask);
            expect(tasksRepo.findTaskById).toHaveBeenCalledWith('test-id');
        });

        it('should throw NotFoundError when task does not exist', async () => {
            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(null);

            await expect(tasksService.getTaskById('non-existent-id')).rejects.toThrow(
                NotFoundError
            );
            await expect(tasksService.getTaskById('non-existent-id')).rejects.toThrow(
                'Task not found'
            );
        });
    });

    describe('createTask', () => {
        it('should create task with name and projectId', async () => {
            const mockProject = createMockProject();
            const mockTask = createMockTask({
                name: 'New Task',
                projectId: 'project-1',
            });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);
            vi.mocked(tasksRepo.createTask).mockResolvedValue(mockTask);

            const result = await tasksService.createTask({
                name: 'New Task',
                projectId: 'project-1',
            });

            expect(result).toEqual(mockTask);
            expect(projectsRepo.findProjectById).toHaveBeenCalledWith('project-1');
            expect(tasksRepo.createTask).toHaveBeenCalledWith({
                name: 'New Task',
                projectId: 'project-1',
                startDate: null,
                endDate: null,
            });
        });

        it('should create task with OPEN status by default', async () => {
            const mockProject = createMockProject();
            const mockTask = createMockTask({ status: TaskStatus.OPEN });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);
            vi.mocked(tasksRepo.createTask).mockResolvedValue(mockTask);

            const result = await tasksService.createTask({
                name: 'New Task',
                projectId: 'project-1',
            });

            expect(result.status).toBe(TaskStatus.OPEN);
        });

        it('should create task with dates', async () => {
            const mockProject = createMockProject({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            const startDate = new Date('2024-06-01');
            const endDate = new Date('2024-06-30');
            const mockTask = createMockTask({
                startDate,
                endDate,
            });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);
            vi.mocked(tasksRepo.createTask).mockResolvedValue(mockTask);

            const result = await tasksService.createTask({
                name: 'New Task',
                projectId: 'project-1',
                startDate: '2024-06-01',
                endDate: '2024-06-30',
            });

            expect(result.startDate).toEqual(startDate);
            expect(result.endDate).toEqual(endDate);
        });

        it('should throw ValidationError when project does not exist', async () => {
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(null);

            await expect(
                tasksService.createTask({
                    name: 'New Task',
                    projectId: 'non-existent-project',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                tasksService.createTask({
                    name: 'New Task',
                    projectId: 'non-existent-project',
                })
            ).rejects.toThrow('Project not found');
        });

        it('should throw ValidationError when endDate is before startDate', async () => {
            const mockProject = createMockProject();
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);

            await expect(
                tasksService.createTask({
                    name: 'New Task',
                    projectId: 'project-1',
                    startDate: '2024-12-31',
                    endDate: '2024-01-01',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                tasksService.createTask({
                    name: 'New Task',
                    projectId: 'project-1',
                    startDate: '2024-12-31',
                    endDate: '2024-01-01',
                })
            ).rejects.toThrow('End date must be greater than or equal to start date');
        });

        it('should validate task dates are within project dates', async () => {
            const mockProject = createMockProject({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);

            await expect(
                tasksService.createTask({
                    name: 'New Task',
                    projectId: 'project-1',
                    startDate: '2023-12-01',
                    endDate: '2023-12-31',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                tasksService.createTask({
                    name: 'New Task',
                    projectId: 'project-1',
                    startDate: '2023-12-01',
                    endDate: '2023-12-31',
                })
            ).rejects.toThrow('Task start date must be within project date range');
        });

        it('should validate task end date is within project dates', async () => {
            const mockProject = createMockProject({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);

            await expect(
                tasksService.createTask({
                    name: 'New Task',
                    projectId: 'project-1',
                    startDate: '2024-06-01',
                    endDate: '2025-01-31',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                tasksService.createTask({
                    name: 'New Task',
                    projectId: 'project-1',
                    startDate: '2024-06-01',
                    endDate: '2025-01-31',
                })
            ).rejects.toThrow('Task end date must be within project date range');
        });

        it('should allow any valid task dates if project has NULL dates', async () => {
            const mockProject = createMockProject({
                startDate: null,
                endDate: null,
            });
            const mockTask = createMockTask({
                startDate: new Date('2024-06-01'),
                endDate: new Date('2024-06-30'),
            });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);
            vi.mocked(tasksRepo.createTask).mockResolvedValue(mockTask);

            const result = await tasksService.createTask({
                name: 'New Task',
                projectId: 'project-1',
                startDate: '2024-06-01',
                endDate: '2024-06-30',
            });

            expect(result).toEqual(mockTask);
        });
    });

    describe('updateTask', () => {
        it('should update task successfully', async () => {
            const existingTask = createMockTask({ name: 'Old Name' });
            const mockProject = createMockProject();
            const updatedTask = createMockTask({
                name: 'Updated Name',
            });

            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(existingTask);
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);
            vi.mocked(tasksRepo.updateTask).mockResolvedValue(updatedTask);

            const result = await tasksService.updateTask('test-id', {
                name: 'Updated Name',
            });

            expect(result).toEqual(updatedTask);
            expect(tasksRepo.updateTask).toHaveBeenCalledWith('test-id', {
                name: 'Updated Name',
                projectId: undefined,
                startDate: undefined,
                endDate: undefined,
            });
        });

        it('should throw NotFoundError when task does not exist', async () => {
            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(null);

            await expect(
                tasksService.updateTask('non-existent-id', { name: 'Updated Name' })
            ).rejects.toThrow(NotFoundError);
            await expect(
                tasksService.updateTask('non-existent-id', { name: 'Updated Name' })
            ).rejects.toThrow('Task not found');
        });

        it('should validate new project exists when changing projectId', async () => {
            const existingTask = createMockTask({ projectId: 'project-1' });
            const newProject = createMockProject({ id: 'project-2' });
            const updatedTask = createMockTask({ projectId: 'project-2' });

            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(existingTask);
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(newProject);
            vi.mocked(tasksRepo.updateTask).mockResolvedValue(updatedTask);

            const result = await tasksService.updateTask('test-id', {
                projectId: 'project-2',
            });

            expect(result.projectId).toBe('project-2');
        });

        it('should throw NotFoundError when new project does not exist', async () => {
            const existingTask = createMockTask({ projectId: 'project-1' });
            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(existingTask);
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(null);

            await expect(
                tasksService.updateTask('test-id', { projectId: 'non-existent-project' })
            ).rejects.toThrow(NotFoundError);
            
            await expect(
                tasksService.updateTask('test-id', { projectId: 'non-existent-project' })
            ).rejects.toThrow('Project not found');
        });

        it('should validate date range', async () => {
            const existingTask = createMockTask({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            const mockProject = createMockProject();
            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(existingTask);
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);

            await expect(
                tasksService.updateTask('test-id', {
                    startDate: '2024-12-31',
                    endDate: '2024-01-01',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                tasksService.updateTask('test-id', {
                    startDate: '2024-12-31',
                    endDate: '2024-01-01',
                })
            ).rejects.toThrow('End date must be greater than or equal to start date');
        });

        it('should validate task dates are within project dates', async () => {
            const existingTask = createMockTask({
                startDate: new Date('2024-06-01'),
                endDate: new Date('2024-06-30'),
            });
            const mockProject = createMockProject({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });

            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(existingTask);
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);

            await expect(
                tasksService.updateTask('test-id', {
                    startDate: '2023-12-01',
                    endDate: '2023-12-31',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                tasksService.updateTask('test-id', {
                    startDate: '2023-12-01',
                    endDate: '2023-12-31',
                })
            ).rejects.toThrow('Task start date must be within project date range');
        });

        it('should allow updating dates when within project range', async () => {
            const existingTask = createMockTask({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            const mockProject = createMockProject({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            const updatedTask = createMockTask({
                startDate: new Date('2024-06-01'),
                endDate: new Date('2024-06-30'),
            });

            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(existingTask);
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);
            vi.mocked(tasksRepo.updateTask).mockResolvedValue(updatedTask);

            const result = await tasksService.updateTask('test-id', {
                startDate: '2024-06-01',
                endDate: '2024-06-30',
            });

            expect(result).toEqual(updatedTask);
        });

        it('should allow setting dates to null', async () => {
            const existingTask = createMockTask({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            const mockProject = createMockProject({
                startDate: null,
                endDate: null,
            });
            const updatedTask = createMockTask({
                startDate: null,
                endDate: null,
            });

            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(existingTask);
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);
            vi.mocked(tasksRepo.updateTask).mockResolvedValue(updatedTask);

            const result = await tasksService.updateTask('test-id', {
                startDate: null,
                endDate: null,
            });

            expect(result.startDate).toBeNull();
            expect(result.endDate).toBeNull();
        });
    });

    describe('updateTaskStatus', () => {
        it('should update task status to CLOSED', async () => {
            const mockTask = createMockTask({ status: TaskStatus.OPEN });
            const updatedTask = createMockTask({ status: TaskStatus.CLOSED });

            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(mockTask);
            vi.mocked(tasksRepo.hasTimeEntries).mockResolvedValue(false);
            vi.mocked(tasksRepo.updateTaskStatus).mockResolvedValue(updatedTask);

            const result = await tasksService.updateTaskStatus('test-id', TaskStatus.CLOSED);

            expect(result).toEqual(updatedTask);
            expect(result.status).toBe(TaskStatus.CLOSED);
            expect(tasksRepo.updateTaskStatus).toHaveBeenCalledWith('test-id', TaskStatus.CLOSED);
        });

        it('should update task status to OPEN', async () => {
            const mockTask = createMockTask({ status: TaskStatus.CLOSED });
            const updatedTask = createMockTask({ status: TaskStatus.OPEN });

            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(mockTask);
            vi.mocked(tasksRepo.updateTaskStatus).mockResolvedValue(updatedTask);

            const result = await tasksService.updateTaskStatus('test-id', TaskStatus.OPEN);

            expect(result.status).toBe(TaskStatus.OPEN);
        });

        it('should throw NotFoundError when task does not exist', async () => {
            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(null);

            await expect(
                tasksService.updateTaskStatus('non-existent-id', TaskStatus.CLOSED)
            ).rejects.toThrow(NotFoundError);
            await expect(
                tasksService.updateTaskStatus('non-existent-id', TaskStatus.CLOSED)
            ).rejects.toThrow('Task not found');
        });

        it('should throw ValidationError when trying to close task with time entries', async () => {
            const mockTask = createMockTask({ status: TaskStatus.OPEN });
            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(mockTask);
            vi.mocked(tasksRepo.hasTimeEntries).mockResolvedValue(true);

            await expect(
                tasksService.updateTaskStatus('test-id', TaskStatus.CLOSED)
            ).rejects.toThrow(ValidationError);
            await expect(
                tasksService.updateTaskStatus('test-id', TaskStatus.CLOSED)
            ).rejects.toThrow('Cannot close task that has logged time entries');
        });

        it('should allow closing task that already has CLOSED status', async () => {
            const mockTask = createMockTask({ status: TaskStatus.CLOSED });
            const updatedTask = createMockTask({ status: TaskStatus.CLOSED });

            vi.mocked(tasksRepo.findTaskById).mockResolvedValue(mockTask);
            vi.mocked(tasksRepo.updateTaskStatus).mockResolvedValue(updatedTask);

            const result = await tasksService.updateTaskStatus('test-id', TaskStatus.CLOSED);

            expect(result.status).toBe(TaskStatus.CLOSED);
            // Should not check for time entries when already closed
            expect(tasksRepo.hasTimeEntries).not.toHaveBeenCalled();
        });
    });
});
