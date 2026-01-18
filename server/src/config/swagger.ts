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
