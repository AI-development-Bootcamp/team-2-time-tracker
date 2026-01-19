/**
 * @fileoverview Real integration tests for auth endpoints with database
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { router } from '../../src/routes';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { prisma, setupDatabase, cleanupDatabase, disconnectDatabase } from './setup';

let app: Express;
let testUserId: string;
let testRefreshToken: string;
let testAccessToken: string;

beforeAll(async () => {
    // Setup database
    await setupDatabase();

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api', router);
    app.use(errorMiddleware);
});

afterAll(async () => {
    await cleanupDatabase();
    await disconnectDatabase();
});

beforeEach(async () => {
    // Clean database before each test
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
});

describe('Auth Integration Tests', () => {
    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            // Create a test user
            const hashedPassword = await bcrypt.hash('password123', 10);
            const user = await prisma.user.create({
                data: {
                    email: 'test@example.com',
                    password: hashedPassword,
                    fullName: 'Test User',
                    role: 'EMPLOYEE',
                    isActive: true,
                },
            });

            testUserId = user.id;

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data.user.email).toBe('test@example.com');

            // Save tokens for later tests
            testAccessToken = response.body.data.token;
            testRefreshToken = response.body.data.refreshToken;
        });

        it('should return 401 for invalid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    email: 'test@example.com',
                    password: hashedPassword,
                    fullName: 'Test User',
                    role: 'EMPLOYEE',
                    isActive: true,
                },
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 for non-existent user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ password: 'password123' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'not-an-email', password: 'password123' });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('should refresh access token with valid refresh token', async () => {
            // Create user and login first
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    email: 'refresh@example.com',
                    password: hashedPassword,
                    fullName: 'Refresh',
                                        role: 'EMPLOYEE',
                    isActive: true,
                },
            });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'refresh@example.com',
                    password: 'password123',
                });

            const refreshToken = loginResponse.body.data.refreshToken;

            // Now try to refresh
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
        });

        it('should return 401 for invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token' });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user for authenticated request', async () => {
            // Create user and login
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    email: 'me@example.com',
                    password: hashedPassword,
                    fullName: 'Me',
                                        role: 'EMPLOYEE',
                    isActive: true,
                },
            });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'me@example.com',
                    password: 'password123',
                });

            const token = loginResponse.body.data.token;

            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('me@example.com');
        });

        it('should return 401 for missing token', async () => {
            const response = await request(app).get('/api/auth/me');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            // Create user and login
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    email: 'logout@example.com',
                    password: hashedPassword,
                    fullName: 'Logout',
                                        role: 'EMPLOYEE',
                    isActive: true,
                },
            });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'logout@example.com',
                    password: 'password123',
                });

            const token = loginResponse.body.data.token;
            const refreshToken = loginResponse.body.data.refreshToken;

            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .send({ refreshToken });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const response = await request(app).get('/api/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('version');
        });
    });
});
