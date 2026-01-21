import { z } from 'zod';
import { EntityStatus } from '../enums/entityStatus.enum';
import { ReportType } from '../enums/reportType.enum';
import { TaskStatus } from '../enums/taskStatus.enum';

// ===========================
// CLIENT SCHEMAS
// ===========================

export const createClientSchema = z.object({
    name: z.string().min(1, 'Client name is required'),
});

export const updateClientSchema = z.object({
    name: z.string().min(1, 'Client name is required'),
});

export const updateClientStatusSchema = z.object({
    status: z.nativeEnum(EntityStatus),
});

// ===========================
// PROJECT SCHEMAS
// ===========================

export const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    clientId: z.string().min(1, 'Client ID is required'),
    description: z.string().max(250, 'Description cannot exceed 250 characters').nullable().optional(),
    reportType: z.nativeEnum(ReportType).optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.endDate) >= new Date(data.startDate);
        }
        return true;
    },
    {
        message: 'End date must be greater than or equal to start date',
        path: ['endDate'],
    }
);

export const updateProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').optional(),
    clientId: z.string().min(1, 'Client ID is required').optional(),
    description: z.string().max(250, 'Description cannot exceed 250 characters').nullable().optional(),
    reportType: z.nativeEnum(ReportType).optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.endDate) >= new Date(data.startDate);
        }
        return true;
    },
    {
        message: 'End date must be greater than or equal to start date',
        path: ['endDate'],
    }
);

export const updateProjectStatusSchema = z.object({
    status: z.nativeEnum(EntityStatus),
});

export const updateProjectReportTypeSchema = z.object({
    reportType: z.nativeEnum(ReportType),
});

// ===========================
// TASK SCHEMAS
// ===========================

export const createTaskSchema = z.object({
    name: z.string().min(1, 'Task name is required'),
    projectId: z.string().min(1, 'Project ID is required'),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.endDate) >= new Date(data.startDate);
        }
        return true;
    },
    {
        message: 'End date must be greater than or equal to start date',
        path: ['endDate'],
    }
);

export const updateTaskSchema = z.object({
    name: z.string().min(1, 'Task name is required').optional(),
    projectId: z.string().min(1, 'Project ID is required').optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.endDate) >= new Date(data.startDate);
        }
        return true;
    },
    {
        message: 'End date must be greater than or equal to start date',
        path: ['endDate'],
    }
);

export const updateTaskStatusSchema = z.object({
    status: z.nativeEnum(TaskStatus),
});

export const listTasksQuerySchema = z.object({
    projectId: z.string().uuid('Project ID must be a valid UUID').optional(),
});
