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
            { name: 'Timer', description: 'Timer management endpoints' },
            { name: 'Time Entries', description: 'Time entry management endpoints' },
            { name: 'Admin - Users', description: 'Admin user management endpoints' },
            { name: 'Absences', description: 'Absence management endpoints' },
            { name: 'Documents', description: 'Document management for absences' },
            { name: 'Health', description: 'Health check endpoints' },
            { name: 'Selectors', description: 'Dropdown selector endpoints' },
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
                // Selectors Schemas
                ClientSelectorDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Google' },
                        usageCount: { type: 'integer', example: 10 },
                    },
                },
                ProjectSelectorDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Android App' },
                        clientId: { type: 'string', format: 'uuid' },
                        usageCount: { type: 'integer', example: 5 },
                    },
                },
                TaskSelectorDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Bug Fixes' },
                        projectId: { type: 'string', format: 'uuid' },
                        reportType: { type: 'string', enum: ['TOTAL_HOURS', 'ENTRY_EXIT'] },
                        usageCount: { type: 'integer', example: 2 },
                    },
                },
                UserAssignmentDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Design Review' },
                        projectId: { type: 'string', format: 'uuid' },
                        projectName: { type: 'string', example: 'Website' },
                        clientName: { type: 'string', example: 'Acme Corp' },
                        reportType: { type: 'string', enum: ['TOTAL_HOURS', 'ENTRY_EXIT'] },
                    },
                },
                MonthlyStatisticsDto: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                totalWorkDays: { type: 'integer', example: 22 },
                                submittedDays: { type: 'integer', example: 20 },
                                missingDays: { type: 'integer', example: 2 },
                                totalWorkMinutes: { type: 'integer', example: 10800 },
                                totalAbsenceMinutes: { type: 'integer', example: 0 },
                                completionPercentage: { type: 'integer', example: 91 },
                            },
                        },
                    },
                },
                // Auth Schemas
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        password: { type: 'string', minLength: 8, example: env.DEFAULT_SEED_PASSWORD },
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
                        currentPassword: { type: 'string', example: env.DEFAULT_SEED_PASSWORD },
                        newPassword: { type: 'string', minLength: 8, example: env.DEFAULT_SEED_PASSWORD },
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
                // Absence Schemas
                CreateAbsenceRequest: {
                    type: 'object',
                    required: ['type', 'startDate', 'endDate'],
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['VACATION', 'SICK', 'RESERVES'],
                            description: 'Type of absence',
                            example: 'VACATION',
                        },
                        startDate: {
                            type: 'string',
                            format: 'date',
                            description: 'Start date in YYYY-MM-DD format',
                            example: '2025-01-20',
                        },
                        endDate: {
                            type: 'string',
                            format: 'date',
                            description: 'End date in YYYY-MM-DD format',
                            example: '2025-01-22',
                        },
                        isHalfDay: {
                            type: 'boolean',
                            description: 'Half-day absence (270 min) or full-day (540 min). Only for VACATION type.',
                            default: false,
                            example: false,
                        },
                        note: {
                            type: 'string',
                            maxLength: 500,
                            description: 'Optional note or description',
                            example: 'Family vacation',
                        },
                    },
                },
                UpdateAbsenceRequest: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['VACATION', 'SICK', 'RESERVES'],
                            example: 'VACATION',
                        },
                        startDate: {
                            type: 'string',
                            format: 'date',
                            example: '2025-01-20',
                        },
                        endDate: {
                            type: 'string',
                            format: 'date',
                            example: '2025-01-22',
                        },
                        isHalfDay: {
                            type: 'boolean',
                            example: false,
                        },
                        note: {
                            type: 'string',
                            maxLength: 500,
                            example: 'Updated note',
                        },
                    },
                },
                AbsenceDayDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        date: { type: 'string', format: 'date', example: '2025-01-20' },
                        minutes: { type: 'integer', example: 540, description: '270 for half-day, 540 for full-day' },
                    },
                },
                AbsenceDocumentDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        fileName: { type: 'string', example: 'medical-certificate.pdf' },
                        fileUrl: { type: 'string', example: 'https://endpoint.idrivee2.com/bucket/absences/userId/absenceId/file.pdf' },
                        fileSize: { type: 'integer', example: 102400, description: 'File size in bytes' },
                        mimeType: { type: 'string', example: 'application/pdf' },
                        uploadedAt: { type: 'string', format: 'date-time' },
                    },
                },
                AbsenceRequestDto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        type: {
                            type: 'string',
                            enum: ['VACATION', 'SICK', 'RESERVES'],
                            example: 'VACATION',
                        },
                        status: {
                            type: 'string',
                            enum: ['PENDING_DOCUMENT', 'SUBMITTED'],
                            example: 'SUBMITTED',
                        },
                        startDate: { type: 'string', format: 'date', example: '2025-01-20' },
                        endDate: { type: 'string', format: 'date', example: '2025-01-22' },
                        isHalfDay: { type: 'boolean', example: false },
                        note: { type: 'string', example: 'Family vacation' },
                        userId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        days: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/AbsenceDayDto' },
                        },
                        documents: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/AbsenceDocumentDto' },
                        },
                    },
                },
                ListAbsencesResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/AbsenceRequestDto' },
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'integer', example: 1 },
                                limit: { type: 'integer', example: 10 },
                                total: { type: 'integer', example: 25 },
                                totalPages: { type: 'integer', example: 3 },
                            },
                        },
                    },
                },
                CreateAbsenceResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/AbsenceRequestDto' },
                    },
                },
                GetAbsenceResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/AbsenceRequestDto' },
                    },
                },
                UploadDocumentResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                fileName: { type: 'string', example: 'document.pdf' },
                                url: { type: 'string', example: 'https://endpoint.idrivee2.com/bucket/absences/userId/absenceId/file.pdf' },
                            },
                        },
                    },
                },
                ListDocumentsResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/AbsenceDocumentDto' },
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
