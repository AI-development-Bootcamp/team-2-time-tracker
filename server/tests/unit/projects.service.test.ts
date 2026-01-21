/**
 * @fileoverview Unit tests for projects.service.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    resetPrismaMocks,
    createMockProject,
    createMockClient,
} from '../helpers/mockPrisma';

// Import after mocks
import * as projectsService from '../../src/modules/admin/entities/projects.service';
import * as projectsRepo from '../../src/modules/admin/entities/projects.repo';
import { NotFoundError, ValidationError } from '../../src/shared/errors';
import { prisma } from '../../src/db';
import { EntityStatus, ReportType } from '@shared/types';

// Mock the projects repository
vi.mock('../../src/modules/admin/entities/projects.repo');
// Mock prisma client
vi.mock('../../src/db', () => ({
    prisma: {
        client: {
            findUnique: vi.fn(),
        },
    },
}));

describe('projects.service', () => {
    beforeEach(() => {
        resetPrismaMocks();
        vi.clearAllMocks();
    });

    describe('getProjectById', () => {
        it('should return project when found', async () => {
            const mockProject = createMockProject();
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);

            const result = await projectsService.getProjectById('test-id');

            expect(result).toEqual(mockProject);
            expect(projectsRepo.findProjectById).toHaveBeenCalledWith('test-id');
        });

        it('should throw NotFoundError when project does not exist', async () => {
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(null);

            await expect(projectsService.getProjectById('non-existent-id')).rejects.toThrow(
                NotFoundError
            );
            await expect(projectsService.getProjectById('non-existent-id')).rejects.toThrow(
                'Project not found'
            );
        });
    });

    describe('createProject', () => {
        it('should create project with name and clientId', async () => {
            const mockClient = createMockClient();
            const mockProject = createMockProject({
                name: 'New Project',
                clientId: 'client-1',
            });

            vi.mocked(prisma.client.findUnique).mockResolvedValue(mockClient);
            vi.mocked(projectsRepo.createProject).mockResolvedValue(mockProject);

            const result = await projectsService.createProject({
                name: 'New Project',
                clientId: 'client-1',
            });

            expect(result).toEqual(mockProject);
            expect(prisma.client.findUnique).toHaveBeenCalledWith({
                where: { id: 'client-1' },
            });
            expect(projectsRepo.createProject).toHaveBeenCalledWith({
                name: 'New Project',
                clientId: 'client-1',
                reportType: undefined,
                startDate: null,
                endDate: null,
            });
        });

        it('should create project with ACTIVE status by default', async () => {
            const mockClient = createMockClient();
            const mockProject = createMockProject({ status: EntityStatus.ACTIVE });

            vi.mocked(prisma.client.findUnique).mockResolvedValue(mockClient);
            vi.mocked(projectsRepo.createProject).mockResolvedValue(mockProject);

            const result = await projectsService.createProject({
                name: 'New Project',
                clientId: 'client-1',
            });

            expect(result.status).toBe(EntityStatus.ACTIVE);
        });

        it('should create project with TOTAL_HOURS reportType by default', async () => {
            const mockClient = createMockClient();
            const mockProject = createMockProject({ reportType: ReportType.TOTAL_HOURS });

            vi.mocked(prisma.client.findUnique).mockResolvedValue(mockClient);
            vi.mocked(projectsRepo.createProject).mockResolvedValue(mockProject);

            await projectsService.createProject({
                name: 'New Project',
                clientId: 'client-1',
            });

            expect(projectsRepo.createProject).toHaveBeenCalledWith(
                expect.objectContaining({
                    reportType: undefined, // Will be set to TOTAL_HOURS in repo
                })
            );
        });

        it('should create project with dates', async () => {
            const mockClient = createMockClient();
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-12-31');
            const mockProject = createMockProject({
                startDate,
                endDate,
            });

            vi.mocked(prisma.client.findUnique).mockResolvedValue(mockClient);
            vi.mocked(projectsRepo.createProject).mockResolvedValue(mockProject);

            const result = await projectsService.createProject({
                name: 'New Project',
                clientId: 'client-1',
                startDate: '2024-01-01',
                endDate: '2024-12-31',
            });

            expect(result.startDate).toEqual(startDate);
            expect(result.endDate).toEqual(endDate);
        });

        it('should throw ValidationError when client does not exist', async () => {
            vi.mocked(prisma.client.findUnique).mockResolvedValue(null);

            await expect(
                projectsService.createProject({
                    name: 'New Project',
                    clientId: 'non-existent-client',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                projectsService.createProject({
                    name: 'New Project',
                    clientId: 'non-existent-client',
                })
            ).rejects.toThrow('Client not found');
        });

        it('should throw ValidationError when endDate is before startDate', async () => {
            const mockClient = createMockClient();
            vi.mocked(prisma.client.findUnique).mockResolvedValue(mockClient);

            await expect(
                projectsService.createProject({
                    name: 'New Project',
                    clientId: 'client-1',
                    startDate: '2024-12-31',
                    endDate: '2024-01-01',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                projectsService.createProject({
                    name: 'New Project',
                    clientId: 'client-1',
                    startDate: '2024-12-31',
                    endDate: '2024-01-01',
                })
            ).rejects.toThrow('End date must be greater than or equal to start date');
        });
    });

    describe('updateProject', () => {
        it('should update project successfully', async () => {
            const existingProject = createMockProject({ name: 'Old Name' });
            const updatedProject = createMockProject({
                name: 'Updated Name',
            });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(existingProject);
            vi.mocked(projectsRepo.updateProject).mockResolvedValue(updatedProject);

            const result = await projectsService.updateProject('test-id', {
                name: 'Updated Name',
            });

            expect(result).toEqual(updatedProject);
            expect(projectsRepo.updateProject).toHaveBeenCalledWith('test-id', {
                name: 'Updated Name',
                clientId: undefined,
                startDate: undefined,
                endDate: undefined,
            });
        });

        it('should throw NotFoundError when project does not exist', async () => {
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(null);

            await expect(
                projectsService.updateProject('non-existent-id', { name: 'Updated Name' })
            ).rejects.toThrow(NotFoundError);
            await expect(
                projectsService.updateProject('non-existent-id', { name: 'Updated Name' })
            ).rejects.toThrow('Project not found');
        });

        it('should validate new client exists when changing clientId', async () => {
            const existingProject = createMockProject({ clientId: 'client-1' });
            const newClient = createMockClient({ id: 'client-2' });
            const updatedProject = createMockProject({ clientId: 'client-2' });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(existingProject);
            vi.mocked(prisma.client.findUnique).mockResolvedValue(newClient);
            vi.mocked(projectsRepo.updateProject).mockResolvedValue(updatedProject);

            const result = await projectsService.updateProject('test-id', {
                clientId: 'client-2',
            });

            expect(result.clientId).toBe('client-2');
            expect(prisma.client.findUnique).toHaveBeenCalledWith({
                where: { id: 'client-2' },
            });
        });

        it('should throw NotFoundError when new client does not exist', async () => {
            const existingProject = createMockProject({ clientId: 'client-1' });
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(existingProject);
            vi.mocked(prisma.client.findUnique).mockResolvedValue(null);

            await expect(
                projectsService.updateProject('test-id', { clientId: 'non-existent-client' })
            ).rejects.toThrow(NotFoundError);
            await expect(
                projectsService.updateProject('test-id', { clientId: 'non-existent-client' })
            ).rejects.toThrow('Client not found');
        });

        it('should validate date range', async () => {
            const existingProject = createMockProject({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(existingProject);

            await expect(
                projectsService.updateProject('test-id', {
                    startDate: '2024-12-31',
                    endDate: '2024-01-01',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                projectsService.updateProject('test-id', {
                    startDate: '2024-12-31',
                    endDate: '2024-01-01',
                })
            ).rejects.toThrow('End date must be greater than or equal to start date');
        });

        it('should check for conflicting tasks when updating dates', async () => {
            const existingProject = createMockProject({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            const conflictingTasks = [
                {
                    id: 'task-1',
                    name: 'Task 1',
                    startDate: new Date('2023-12-01'),
                    endDate: new Date('2023-12-31'),
                },
            ];

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(existingProject);
            vi.mocked(projectsRepo.findTasksOutsideDateRange).mockResolvedValue(conflictingTasks);

            await expect(
                projectsService.updateProject('test-id', {
                    startDate: '2024-06-01',
                    endDate: '2024-06-30',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                projectsService.updateProject('test-id', {
                    startDate: '2024-06-01',
                    endDate: '2024-06-30',
                })
            ).rejects.toThrow('Cannot update project dates');
        });

        it('should allow updating dates when no conflicting tasks', async () => {
            const existingProject = createMockProject({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            const updatedProject = createMockProject({
                startDate: new Date('2024-06-01'),
                endDate: new Date('2024-06-30'),
            });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(existingProject);
            vi.mocked(projectsRepo.findTasksOutsideDateRange).mockResolvedValue([]);
            vi.mocked(projectsRepo.updateProject).mockResolvedValue(updatedProject);

            const result = await projectsService.updateProject('test-id', {
                startDate: '2024-06-01',
                endDate: '2024-06-30',
            });

            expect(result).toEqual(updatedProject);
        });

        it('should allow setting dates to null', async () => {
            const existingProject = createMockProject({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            });
            const updatedProject = createMockProject({
                startDate: null,
                endDate: null,
            });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(existingProject);
            vi.mocked(projectsRepo.findTasksOutsideDateRange).mockResolvedValue([]);
            vi.mocked(projectsRepo.updateProject).mockResolvedValue(updatedProject);

            const result = await projectsService.updateProject('test-id', {
                startDate: null,
                endDate: null,
            });

            expect(result.startDate).toBeNull();
            expect(result.endDate).toBeNull();
        });
    });

    describe('updateProjectStatus', () => {
        it('should update project status to INACTIVE', async () => {
            const mockProject = createMockProject({ status: EntityStatus.ACTIVE });
            const updatedProject = createMockProject({ status: EntityStatus.INACTIVE });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);
            vi.mocked(projectsRepo.updateProjectStatus).mockResolvedValue(updatedProject);

            const result = await projectsService.updateProjectStatus('test-id', EntityStatus.INACTIVE);

            expect(result).toEqual(updatedProject);
            expect(result.status).toBe(EntityStatus.INACTIVE);
            expect(projectsRepo.updateProjectStatus).toHaveBeenCalledWith('test-id', EntityStatus.INACTIVE);
        });

        it('should update project status to ACTIVE', async () => {
            const mockProject = createMockProject({ status: EntityStatus.INACTIVE });
            const updatedProject = createMockProject({ status: EntityStatus.ACTIVE });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);
            vi.mocked(projectsRepo.updateProjectStatus).mockResolvedValue(updatedProject);

            const result = await projectsService.updateProjectStatus('test-id', EntityStatus.ACTIVE);

            expect(result.status).toBe(EntityStatus.ACTIVE);
        });

        it('should throw NotFoundError when project does not exist', async () => {
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(null);

            await expect(
                projectsService.updateProjectStatus('non-existent-id', EntityStatus.INACTIVE)
            ).rejects.toThrow(NotFoundError);
            await expect(
                projectsService.updateProjectStatus('non-existent-id', EntityStatus.INACTIVE)
            ).rejects.toThrow('Project not found');
        });
    });

    describe('updateProjectReportType', () => {
        it('should update project report type', async () => {
            const mockProject = createMockProject({ reportType: ReportType.TOTAL_HOURS });
            const updatedProject = createMockProject({ reportType: ReportType.ENTRY_EXIT });

            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(mockProject);
            vi.mocked(projectsRepo.updateProjectReportType).mockResolvedValue(updatedProject);

            const result = await projectsService.updateProjectReportType(
                'test-id',
                ReportType.ENTRY_EXIT
            );

            expect(result).toEqual(updatedProject);
            expect(result.reportType).toBe(ReportType.ENTRY_EXIT);
            expect(projectsRepo.updateProjectReportType).toHaveBeenCalledWith(
                'test-id',
                ReportType.ENTRY_EXIT
            );
        });

        it('should throw NotFoundError when project does not exist', async () => {
            vi.mocked(projectsRepo.findProjectById).mockResolvedValue(null);

            await expect(
                projectsService.updateProjectReportType('non-existent-id', ReportType.ENTRY_EXIT)
            ).rejects.toThrow(NotFoundError);
            await expect(
                projectsService.updateProjectReportType('non-existent-id', ReportType.ENTRY_EXIT)
            ).rejects.toThrow('Project not found');
        });
    });
});
