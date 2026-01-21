import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Time Tracker API',
            version: '1.0.0',
            description: 'API documentation for Time Tracking System',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}/api`,
                description: 'Local development server',
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Admin - Users', description: 'Admin user management endpoints' },
            { name: 'Admin - Clients', description: 'Admin client management endpoints' },
            { name: 'Admin - Projects', description: 'Admin project management endpoints' },
            { name: 'Admin - Tasks', description: 'Admin task management endpoints' },
            { name: 'Admin - Assignments', description: 'Admin task assignment management endpoints' },
            { name: 'Health', description: 'Health check endpoints' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token obtained from /auth/login',
                },
            },
            schemas: {
                // Auth Schemas
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        password: { type: 'string', minLength: 8, example: 'Password123!' },
                        rememberMe: { type: 'boolean', default: false },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                refreshToken: { type: 'string', example: 'dGhpcyBpcyBhIHJlZnJlc2g...' },
                                expiresIn: { type: 'number', example: 7200 },
                                user: { $ref: '#/components/schemas/UserDto' },
                                mustChangePassword: { type: 'boolean', example: false },
                            },
                        },
                    },
                },
                RefreshTokenRequest: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: { type: 'string', example: 'dGhpcyBpcyBhIHJlZnJlc2g...' },
                    },
                },
                RefreshTokenResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                expiresIn: { type: 'number', example: 7200 },
                            },
                        },
                    },
                },
                ChangePasswordRequest: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword'],
                    properties: {
                        currentPassword: { type: 'string', example: 'OldPassword123!' },
                        newPassword: { type: 'string', minLength: 8, example: 'NewPassword123!' },
                    },
                },
                LogoutRequest: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: { type: 'string', example: 'dGhpcyBpcyBhIHJlZnJlc2g...' },
                    },
                },
                UserDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        fullName: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['EMPLOYEE', 'ADMIN'] },
                        isActive: { type: 'boolean' },
                    },
                },
                MeResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/UserDto' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Invalid credentials' },
                    },
                },
                OkResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation completed successfully' },
                    },
                },
                HealthResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'ok' },
                        timestamp: { type: 'string', format: 'date-time' },
                        version: { type: 'string', example: '1.0.0' },
                    },
                },
                // Entity Status Enum
                EntityStatus: {
                    type: 'string',
                    enum: ['ACTIVE', 'INACTIVE'],
                    description: 'Status for clients and projects',
                },
                // Task Status Enum
                TaskStatus: {
                    type: 'string',
                    enum: ['OPEN', 'CLOSED'],
                    description: 'Status for tasks',
                },
                // Report Type Enum
                ReportType: {
                    type: 'string',
                    enum: ['TOTAL_HOURS', 'ENTRY_EXIT'],
                    description: 'Project report type',
                },
                // Client Schemas
                ClientDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                        name: { type: 'string', example: 'Acme Corporation' },
                        status: { $ref: '#/components/schemas/EntityStatus' },
                        createdAt: { type: 'string', format: 'date-time', example: '2026-01-20T10:00:00.000Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2026-01-20T10:00:00.000Z' },
                    },
                },
                CreateClientRequest: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', minLength: 1, maxLength: 255, example: 'Acme Corporation' },
                    },
                },
                UpdateClientRequest: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', minLength: 1, maxLength: 255, example: 'Acme Corporation' },
                    },
                },
                UpdateClientStatusRequest: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: { $ref: '#/components/schemas/EntityStatus' },
                    },
                },
                ClientResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/ClientDto' },
                    },
                },
                ListClientsResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/ClientDto' },
                        },
                    },
                },
                // Project Schemas
                ProjectDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
                        name: { type: 'string', example: 'Website Redesign' },
                        clientId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                        reportType: { $ref: '#/components/schemas/ReportType' },
                        status: { $ref: '#/components/schemas/EntityStatus' },
                        startDate: { type: 'string', format: 'date', nullable: true, example: '2026-01-01' },
                        endDate: { type: 'string', format: 'date', nullable: true, example: '2026-12-31' },
                        createdAt: { type: 'string', format: 'date-time', example: '2026-01-20T10:00:00.000Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2026-01-20T10:00:00.000Z' },
                        client: { $ref: '#/components/schemas/ClientDto' },
                    },
                },
                CreateProjectRequest: {
                    type: 'object',
                    required: ['name', 'clientId'],
                    properties: {
                        name: { type: 'string', minLength: 1, maxLength: 255, example: 'Website Redesign' },
                        clientId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                        reportType: { $ref: '#/components/schemas/ReportType', example: 'TOTAL_HOURS' },
                        startDate: { type: 'string', format: 'date', nullable: true, example: '2026-01-01', description: 'Project start date (YYYY-MM-DD). Optional.' },
                        endDate: { type: 'string', format: 'date', nullable: true, example: '2026-12-31', description: 'Project end date (YYYY-MM-DD). Must be >= startDate if both provided. Optional.' },
                    },
                },
                UpdateProjectRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', minLength: 1, maxLength: 255, example: 'Website Redesign' },
                        clientId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                        reportType: { $ref: '#/components/schemas/ReportType' },
                        startDate: { type: 'string', format: 'date', nullable: true, example: '2026-01-01', description: 'Project start date (YYYY-MM-DD). Optional.' },
                        endDate: { type: 'string', format: 'date', nullable: true, example: '2026-12-31', description: 'Project end date (YYYY-MM-DD). Must be >= startDate if both provided. Optional.' },
                    },
                },
                UpdateProjectStatusRequest: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: { $ref: '#/components/schemas/EntityStatus' },
                    },
                },
                UpdateProjectReportTypeRequest: {
                    type: 'object',
                    required: ['reportType'],
                    properties: {
                        reportType: { $ref: '#/components/schemas/ReportType' },
                    },
                },
                ProjectResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/ProjectDto' },
                    },
                },
                ListProjectsResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/ProjectDto' },
                        },
                    },
                },
                ConflictingTaskDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
                        name: { type: 'string', example: 'Task Outside Range' },
                        startDate: { type: 'string', format: 'date', nullable: true, example: '2025-12-01' },
                        endDate: { type: 'string', format: 'date', nullable: true, example: '2025-12-31' },
                    },
                },
                ProjectDateValidationError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string', example: 'VALIDATION_002' },
                                message: { type: 'string', example: 'Project date range update would invalidate child tasks' },
                                conflictingTasks: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/ConflictingTaskDto' },
                                },
                            },
                        },
                    },
                },
                // Task Schemas
                TaskDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
                        name: { type: 'string', example: 'Design Homepage' },
                        projectId: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
                        status: { $ref: '#/components/schemas/TaskStatus' },
                        startDate: { type: 'string', format: 'date', nullable: true, example: '2026-02-01' },
                        endDate: { type: 'string', format: 'date', nullable: true, example: '2026-02-15' },
                        createdAt: { type: 'string', format: 'date-time', example: '2026-01-20T10:00:00.000Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2026-01-20T10:00:00.000Z' },
                        project: { $ref: '#/components/schemas/ProjectDto' },
                    },
                },
                CreateTaskRequest: {
                    type: 'object',
                    required: ['name', 'projectId'],
                    properties: {
                        name: { type: 'string', minLength: 1, maxLength: 255, example: 'Design Homepage' },
                        projectId: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
                        startDate: { type: 'string', format: 'date', nullable: true, example: '2026-02-01', description: 'Task start date (YYYY-MM-DD). Must be within parent project date range if project dates are set. Optional.' },
                        endDate: { type: 'string', format: 'date', nullable: true, example: '2026-02-15', description: 'Task end date (YYYY-MM-DD). Must be >= startDate and within parent project date range if project dates are set. Optional.' },
                    },
                },
                UpdateTaskRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', minLength: 1, maxLength: 255, example: 'Design Homepage' },
                        projectId: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
                        startDate: { type: 'string', format: 'date', nullable: true, example: '2026-02-01', description: 'Task start date (YYYY-MM-DD). Must be within parent project date range if project dates are set. Optional.' },
                        endDate: { type: 'string', format: 'date', nullable: true, example: '2026-02-15', description: 'Task end date (YYYY-MM-DD). Must be >= startDate and within parent project date range if project dates are set. Optional.' },
                    },
                },
                UpdateTaskStatusRequest: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: { $ref: '#/components/schemas/TaskStatus' },
                    },
                },
                TaskResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/TaskDto' },
                    },
                },
                ListTasksResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/TaskDto' },
                        },
                    },
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string', example: 'VALIDATION_001', description: 'Error code for validation failures' },
                                message: { type: 'string', example: 'Invalid date range: endDate must be >= startDate' },
                            },
                        },
                    },
                },
                // Assignment Schemas
                TaskAssignmentDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', example: 'd4e5f6a7-b8c9-0123-defg-234567890123' },
                        userId: { type: 'string', format: 'uuid', example: 'e5f6a7b8-c9d0-1234-ef01-34567890abcd' },
                        taskId: { type: 'string', format: 'uuid', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
                        createdAt: { type: 'string', format: 'date-time', example: '2026-01-20T10:00:00.000Z' },
                        userName: { type: 'string', example: 'John Doe' },
                        userEmail: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                        taskName: { type: 'string', example: 'Design Homepage' },
                        projectId: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
                        projectName: { type: 'string', example: 'Website Redesign' },
                        clientId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                        clientName: { type: 'string', example: 'Acme Corporation' },
                    },
                },
                CreateTaskAssignmentRequest: {
                    type: 'object',
                    required: ['userId', 'taskId'],
                    properties: {
                        userId: { type: 'string', format: 'uuid', example: 'e5f6a7b8-c9d0-1234-ef01-34567890abcd', description: 'ID of the user to assign to the task' },
                        taskId: { type: 'string', format: 'uuid', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012', description: 'ID of the task to assign the user to' },
                    },
                },
                BulkCreateTaskAssignmentsRequest: {
                    type: 'object',
                    required: ['userIds', 'taskIds'],
                    properties: {
                        userIds: {
                            type: 'array',
                            items: { type: 'string', format: 'uuid' },
                            minItems: 1,
                            example: ['e5f6a7b8-c9d0-1234-ef01-34567890abcd', 'f6a7b8c9-d0e1-2345-f012-45678901bcde'],
                            description: 'Array of user IDs to assign. Will be combined with taskIds using cartesian product.',
                        },
                        taskIds: {
                            type: 'array',
                            items: { type: 'string', format: 'uuid' },
                            minItems: 1,
                            example: ['c3d4e5f6-a7b8-9012-cdef-123456789012', 'd4e5f6a7-b8c9-0123-defg-234567890123'],
                            description: 'Array of task IDs. Will be combined with userIds using cartesian product. For example, 2 users × 3 tasks = 6 assignments.',
                        },
                    },
                },
                TaskAssignmentResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/TaskAssignmentDto' },
                    },
                },
                ListTaskAssignmentsResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/TaskAssignmentDto' },
                        },
                    },
                },
                BulkCreateTaskAssignmentsResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                created: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/TaskAssignmentDto' },
                                    description: 'Array of successfully created assignments',
                                },
                                count: { type: 'number', example: 4, description: 'Total number of assignments created' },
                            },
                        },
                    },
                },
                AssignmentDeleteResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Task assignment deleted successfully' },
                    },
                },
                AssignmentWithTimeEntriesError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string', example: 'VALIDATION_ASSIGNMENT_HAS_TIME_ENTRIES' },
                                message: { type: 'string', example: 'Cannot delete assignment with existing time entries' },
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/modules/**/*.routes.ts', './src/routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
