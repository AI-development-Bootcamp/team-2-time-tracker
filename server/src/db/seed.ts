import { prisma } from './index';
import bcrypt from 'bcrypt';
import { UserRole } from '@shared/types';
import { logger } from '../shared/logger';
import { env } from '../config/env';

export const seedDatabase = async () => {
    try {
        // Check if database is already populated
        const userCount = await prisma.user.count();
        if (userCount > 0) {
            logger.info('🌱 Database already seeded (users exist). Skipping seed.');
            return;
        }

        const saltRounds = 10;
        const defaultPassword = env.DEFAULT_SEED_PASSWORD;
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

        // Create Admin User
        const admin = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                password: hashedPassword,
                fullName: 'Admin User',
                role: UserRole.ADMIN,
                isActive: true,
                mustChangePassword: false,
            },
        });

        // Create Employee User
        const employee = await prisma.user.create({
            data: {
                email: 'employee@example.com',
                password: hashedPassword,
                fullName: 'Employee User',
                role: UserRole.EMPLOYEE,
                isActive: true,
                mustChangePassword: false,
            },
        });

        logger.debug(`Users created: ${admin.email}, ${employee.email}`);

        // Seed Clients, Projects, and Tasks
        logger.info('🌱 Seeding clients, projects, and tasks...');

        // Client 1: Acme Corp
        const acmeClient = await prisma.client.create({
            data: {
                name: 'Acme Corp',
                status: 'ACTIVE',
            },
        });

        // Client 2: Internal
        const internalClient = await prisma.client.create({
            data: {
                name: 'Internal',
                status: 'ACTIVE',
            },
        });

        // Project 1: Website Redesign (Acme)
        const websiteProject = await prisma.project.create({
            data: {
                name: 'Website Redesign',
                clientId: acmeClient.id,
                status: 'ACTIVE',
                reportType: 'TOTAL_HOURS',
            },
        });

        // Project 2: Mobile App (Acme)
        const mobileProject = await prisma.project.create({
            data: {
                name: 'Mobile App',
                clientId: acmeClient.id,
                status: 'ACTIVE',
                reportType: 'TOTAL_HOURS',
            },
        });

        // Project 3: Operations (Internal)
        const opsProject = await prisma.project.create({
            data: {
                name: 'Operations',
                clientId: internalClient.id,
                status: 'ACTIVE',
                reportType: 'TOTAL_HOURS',
            },
        });

        // Tasks for Website Redesign
        const designTask = await prisma.task.create({
            data: {
                name: 'Design Phase',
                projectId: websiteProject.id,
                status: 'OPEN',
            },
        });

        const devTask = await prisma.task.create({
            data: {
                name: 'Development',
                projectId: websiteProject.id,
                status: 'OPEN',
            },
        });

        // Tasks for Mobile App
        const appTask = await prisma.task.create({
            data: {
                name: 'App Architecture',
                projectId: mobileProject.id,
                status: 'OPEN',
            },
        });

        // Tasks for Operations
        const meetingTask = await prisma.task.create({
            data: {
                name: 'Weekly Meeting',
                projectId: opsProject.id,
                status: 'OPEN',
            },
        });

        // Admin-specific tasks (with 'Admin' prefix)
        const adminDesignTask = await prisma.task.create({
            data: {
                name: 'Admin Design Phase',
                projectId: websiteProject.id,
                status: 'OPEN',
            },
        });

        const adminDevTask = await prisma.task.create({
            data: {
                name: 'Admin Development',
                projectId: websiteProject.id,
                status: 'OPEN',
            },
        });

        const adminAppTask = await prisma.task.create({
            data: {
                name: 'Admin App Architecture',
                projectId: mobileProject.id,
                status: 'OPEN',
            },
        });

        const adminMeetingTask = await prisma.task.create({
            data: {
                name: 'Admin Weekly Meeting',
                projectId: opsProject.id,
                status: 'OPEN',
            },
        });

        // Assign tasks: Employee gets regular tasks, Admin gets admin-specific tasks
        await prisma.taskAssignment.createMany({
            data: [
                // Employee assignments (regular tasks)
                {
                    userId: employee.id,
                    taskId: designTask.id,
                    assignedByAdminId: admin.id,
                },
                {
                    userId: employee.id,
                    taskId: devTask.id,
                    assignedByAdminId: admin.id,
                },
                {
                    userId: employee.id,
                    taskId: appTask.id,
                    assignedByAdminId: admin.id,
                },
                {
                    userId: employee.id,
                    taskId: meetingTask.id,
                    assignedByAdminId: admin.id,
                },
                // Admin assignments (admin-specific tasks only)
                {
                    userId: admin.id,
                    taskId: adminDesignTask.id,
                    assignedByAdminId: admin.id,
                },
                {
                    userId: admin.id,
                    taskId: adminDevTask.id,
                    assignedByAdminId: admin.id,
                },
                {
                    userId: admin.id,
                    taskId: adminAppTask.id,
                    assignedByAdminId: admin.id,
                },
                {
                    userId: admin.id,
                    taskId: adminMeetingTask.id,
                    assignedByAdminId: admin.id,
                },
            ],
        });

        logger.info('✅ Seeded clients, projects, tasks, and assignments.');
    } catch (error) {
        logger.error('Failed to seed database:', error);
    }
};
