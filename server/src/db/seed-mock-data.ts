import { prisma } from './index';
import bcrypt from 'bcrypt';
import { UserRole, EntityStatus, TaskStatus, WorkLocation, AbsenceType, AbsenceStatus, TimeEntrySource, WorkdayStatus, ReportType } from '@prisma/client';
import { logger } from '../shared/logger';
import { env } from '../config/env';

// ============================================================================
// Configuration and Constants
// ============================================================================

const WORKDAY_MINUTES = 540; // 9 hours
const HALF_DAY_MINUTES = 270; // 4.5 hours
const SALT_ROUNDS = 10;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Seeded random number generator for deterministic but varied data
 */
function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

/**
 * Pick a random item from an array
 */
function pickRandom<T>(arr: T[], random: () => number): T {
    return arr[Math.floor(random() * arr.length)];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle<T>(arr: T[], random: () => number): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Check if a date is a workday (Israeli week: Sunday-Thursday)
 */
function isWorkday(date: Date): boolean {
    const day = date.getDay();
    return day !== 5 && day !== 6; // Not Friday (5) or Saturday (6)
}

/**
 * Get workdays in a date range
 */
function getWorkdaysInRange(startDate: Date, endDate: Date): Date[] {
    const workdays: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        if (isWorkday(current)) {
            workdays.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }
    return workdays;
}

/**
 * Format time as HH:MM for database storage
 */
function createTimeDate(hours: number, minutes: number): Date {
    const date = new Date('1970-01-01');
    date.setHours(hours, minutes, 0, 0);
    return date;
}

/**
 * Get a date N days ago from today
 */
function getDaysAgo(daysAgo: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);
    return date;
}

// ============================================================================
// Mock Data Definitions
// ============================================================================

const EMPLOYEE_DATA = [
    { fullName: 'יוסי כהן', email: 'yossi.cohen@example.com' },
    { fullName: 'מיכל לוי', email: 'michal.levi@example.com' },
    { fullName: 'דוד אברהם', email: 'david.avraham@example.com' },
    { fullName: 'שרה ישראלי', email: 'sara.israeli@example.com' },
    { fullName: 'אורי גולן', email: 'ori.golan@example.com' },
];

const CLIENTS_DATA = [
    { name: 'Tech Startup Inc', description: 'Innovative technology solutions startup focused on AI and ML products' },
    { name: 'Financial Services Ltd', description: 'Leading financial services company providing banking and investment solutions' },
    { name: 'Healthcare Solutions', description: 'Healthcare technology company developing patient management systems' },
    { name: 'Retail Corp', description: 'Major retail chain with e-commerce and physical stores integration' },
    { name: 'Media Group', description: 'Digital media and entertainment company with streaming and content platforms' },
];

const PROJECTS_DATA: { clientIndex: number; name: string; reportType: ReportType }[] = [
    // Tech Startup Inc (client 0)
    { clientIndex: 0, name: 'AI Chat Platform', reportType: ReportType.TOTAL_HOURS },
    { clientIndex: 0, name: 'Mobile App Development', reportType: ReportType.ENTRY_EXIT },
    { clientIndex: 0, name: 'Data Analytics Dashboard', reportType: ReportType.TOTAL_HOURS },
    // Financial Services Ltd (client 1)
    { clientIndex: 1, name: 'Banking Portal Redesign', reportType: ReportType.ENTRY_EXIT },
    { clientIndex: 1, name: 'Investment Tracker App', reportType: ReportType.TOTAL_HOURS },
    // Healthcare Solutions (client 2)
    { clientIndex: 2, name: 'Patient Management System', reportType: ReportType.TOTAL_HOURS },
    { clientIndex: 2, name: 'Telemedicine Platform', reportType: ReportType.ENTRY_EXIT },
    { clientIndex: 2, name: 'Medical Records API', reportType: ReportType.TOTAL_HOURS },
    // Retail Corp (client 3)
    { clientIndex: 3, name: 'E-commerce Platform', reportType: ReportType.TOTAL_HOURS },
    { clientIndex: 3, name: 'Inventory Management System', reportType: ReportType.ENTRY_EXIT },
    // Media Group (client 4)
    { clientIndex: 4, name: 'Streaming Platform', reportType: ReportType.TOTAL_HOURS },
    { clientIndex: 4, name: 'Content Management System', reportType: ReportType.TOTAL_HOURS },
];

const TASKS_PER_PROJECT: { projectIndex: number; name: string }[] = [
    // AI Chat Platform (project 0) - 6 tasks
    { projectIndex: 0, name: 'Natural Language Processing Integration' },
    { projectIndex: 0, name: 'Chat UI Development' },
    { projectIndex: 0, name: 'API Endpoints Implementation' },
    { projectIndex: 0, name: 'Chatbot Training Module' },
    { projectIndex: 0, name: 'Conversation History Feature' },
    { projectIndex: 0, name: 'Multi-language Support' },
    // Mobile App Development (project 1) - 6 tasks
    { projectIndex: 1, name: 'React Native Setup' },
    { projectIndex: 1, name: 'User Authentication Module' },
    { projectIndex: 1, name: 'Push Notifications' },
    { projectIndex: 1, name: 'Offline Mode Implementation' },
    { projectIndex: 1, name: 'App Store Deployment' },
    { projectIndex: 1, name: 'Deep Linking Setup' },
    // Data Analytics Dashboard (project 2) - 5 tasks
    { projectIndex: 2, name: 'Dashboard Charts Development' },
    { projectIndex: 2, name: 'Data Pipeline Setup' },
    { projectIndex: 2, name: 'Export Reports Feature' },
    { projectIndex: 2, name: 'Real-time Data Streaming' },
    { projectIndex: 2, name: 'Custom Widgets Builder' },
    // Banking Portal Redesign (project 3) - 6 tasks
    { projectIndex: 3, name: 'UI/UX Redesign' },
    { projectIndex: 3, name: 'Security Audit Integration' },
    { projectIndex: 3, name: 'Payment Gateway Integration' },
    { projectIndex: 3, name: 'Two-Factor Authentication' },
    { projectIndex: 3, name: 'Transaction History Module' },
    { projectIndex: 3, name: 'Account Management Dashboard' },
    // Investment Tracker App (project 4) - 5 tasks
    { projectIndex: 4, name: 'Portfolio Dashboard' },
    { projectIndex: 4, name: 'Real-time Stock Updates' },
    { projectIndex: 4, name: 'Market Analysis Charts' },
    { projectIndex: 4, name: 'Investment Alerts System' },
    { projectIndex: 4, name: 'Tax Reporting Feature' },
    // Patient Management System (project 5) - 6 tasks
    { projectIndex: 5, name: 'Patient Registration Module' },
    { projectIndex: 5, name: 'Appointment Scheduling' },
    { projectIndex: 5, name: 'Medical History Tracker' },
    { projectIndex: 5, name: 'Insurance Verification' },
    { projectIndex: 5, name: 'Billing Integration' },
    { projectIndex: 5, name: 'Patient Portal Development' },
    // Telemedicine Platform (project 6) - 5 tasks
    { projectIndex: 6, name: 'Video Consultation Setup' },
    { projectIndex: 6, name: 'Prescription Management' },
    { projectIndex: 6, name: 'Appointment Reminders' },
    { projectIndex: 6, name: 'Doctor Availability Calendar' },
    { projectIndex: 6, name: 'Session Recording Feature' },
    // Medical Records API (project 7) - 5 tasks
    { projectIndex: 7, name: 'REST API Design' },
    { projectIndex: 7, name: 'Database Migration' },
    { projectIndex: 7, name: 'HIPAA Compliance Implementation' },
    { projectIndex: 7, name: 'Data Encryption Layer' },
    { projectIndex: 7, name: 'Audit Logging System' },
    // E-commerce Platform (project 8) - 6 tasks
    { projectIndex: 8, name: 'Product Catalog Development' },
    { projectIndex: 8, name: 'Shopping Cart Implementation' },
    { projectIndex: 8, name: 'Checkout Process' },
    { projectIndex: 8, name: 'Order Tracking System' },
    { projectIndex: 8, name: 'Customer Reviews Module' },
    { projectIndex: 8, name: 'Wishlist Feature' },
    // Inventory Management System (project 9) - 5 tasks
    { projectIndex: 9, name: 'Stock Tracking Module' },
    { projectIndex: 9, name: 'Supplier Integration' },
    { projectIndex: 9, name: 'Low Stock Alerts' },
    { projectIndex: 9, name: 'Barcode Scanner Integration' },
    { projectIndex: 9, name: 'Warehouse Management' },
    // Streaming Platform (project 10) - 6 tasks
    { projectIndex: 10, name: 'Video Player Development' },
    { projectIndex: 10, name: 'Content Delivery Optimization' },
    { projectIndex: 10, name: 'User Recommendations Engine' },
    { projectIndex: 10, name: 'Subtitle Management System' },
    { projectIndex: 10, name: 'Watchlist Feature' },
    { projectIndex: 10, name: 'Quality Adaptive Streaming' },
    // Content Management System (project 11) - 5 tasks
    { projectIndex: 11, name: 'Article Editor' },
    { projectIndex: 11, name: 'Media Library Management' },
    { projectIndex: 11, name: 'SEO Optimization Tools' },
    { projectIndex: 11, name: 'Content Scheduling' },
    { projectIndex: 11, name: 'Version History Feature' },
];

const WORK_DESCRIPTIONS = [
    'Implemented new feature components with full TypeScript support and unit tests',
    'Fixed critical bug in the authentication flow and added error handling',
    'Conducted thorough code review for pull requests and provided feedback',
    'Attended team standup and sprint planning meeting to discuss priorities',
    'Worked on database schema optimization and query performance improvements',
    'Created comprehensive API documentation with usage examples and specifications',
    'Developed responsive UI components following the design system guidelines',
    'Integrated third-party library for enhanced functionality and reliability',
    'Performed security vulnerability assessment and implemented safety measures',
    'Refactored legacy code to improve maintainability and reduce complexity',
    'Setup continuous integration pipeline with automated testing and deployment',
    'Collaborated with design team on user interface improvements and accessibility',
    'Debugged production issues and deployed hotfix to resolve customer problems',
    'Wrote technical specification document for upcoming features and roadmap',
    'Optimized application performance reducing load time by thirty percent',
    'Implemented caching layer to improve response times and reduce server load',
    'Created automated test suite covering critical business logic scenarios',
    'Participated in architecture review and provided technical recommendations',
    'Developed data migration scripts to handle legacy system transitions',
    'Integrated analytics tracking for user behavior insights and metrics',
];

const ABSENCE_NOTES = [
    'Annual vacation trip planned in advance with the team coordination',
    'Feeling unwell and need to rest for proper recovery from illness',
    'Military reserve duty as required by law will be away for training',
    'Personal matters that need attention during regular working hours',
    'Family event celebration with relatives visiting from abroad this week',
    'Medical appointment scheduled for routine checkup and follow-up visit',
    'Taking a mental health day to recharge and maintain productivity levels',
];

// ============================================================================
// Main Seed Function
// ============================================================================

/**
 * Seeds the database with mock data for development/testing
 * This creates employees, clients, projects, tasks, time entries, and absences
 *
 * IMPORTANT: This should only be called in development environments
 * For production, use initializeSchema() from schema-init.ts instead
 */
export const seedMockData = async (): Promise<void> => {
    try {
        // Check if mock data already exists (check for employees)
        const employeeCount = await prisma.user.count({
            where: { role: UserRole.EMPLOYEE },
        });

        if (employeeCount > 0) {
            logger.info('🌱 Mock data already seeded (employees exist). Skipping.');
            return;
        }

        // Get or create admin user
        let admin = await prisma.user.findFirst({
            where: { role: UserRole.ADMIN },
        });

        if (!admin) {
            const defaultPassword = env.DEFAULT_SEED_PASSWORD;
            const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

            admin = await prisma.user.create({
                data: {
                    email: 'admin@example.com',
                    password: hashedPassword,
                    fullName: 'Admin User',
                    role: UserRole.ADMIN,
                    isActive: true,
                    mustChangePassword: false,
                },
            });
            logger.info(`✅ Admin user created: ${admin.email}`);
        }

        const defaultPassword = env.DEFAULT_SEED_PASSWORD;
        const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

        logger.info('🌱 Starting mock data seeding...');

        // ====================================================================
        // Create Employee Users
        // ====================================================================
        const employees = await Promise.all(
            EMPLOYEE_DATA.map(async (emp) => {
                return prisma.user.create({
                    data: {
                        email: emp.email,
                        password: hashedPassword,
                        fullName: emp.fullName,
                        role: UserRole.EMPLOYEE,
                        isActive: true,
                        mustChangePassword: true,
                    },
                });
            })
        );
        logger.info(`✅ Created ${employees.length} employee users`);

        // ====================================================================
        // Create Clients
        // ====================================================================
        const clients = await Promise.all(
            CLIENTS_DATA.map(async (client) => {
                return prisma.client.create({
                    data: {
                        name: client.name,
                        description: client.description,
                        status: EntityStatus.ACTIVE,
                    },
                });
            })
        );
        logger.info(`✅ Created ${clients.length} clients`);

        // ====================================================================
        // Create Projects
        // ====================================================================
        const projects = await Promise.all(
            PROJECTS_DATA.map(async (proj, index) => {
                const startDate = getDaysAgo(90 - index * 5);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 6);

                return prisma.project.create({
                    data: {
                        clientId: clients[proj.clientIndex].id,
                        name: proj.name,
                        status: EntityStatus.ACTIVE,
                        reportType: proj.reportType,
                        startDate,
                        endDate,
                    },
                });
            })
        );
        logger.info(`✅ Created ${projects.length} projects`);

        // ====================================================================
        // Create Tasks
        // ====================================================================
        const allTasks = await Promise.all(
            TASKS_PER_PROJECT.map(async (task, index) => {
                const startDate = getDaysAgo(60 - index * 2);
                const isOpen = index % 4 !== 0; // Every 4th task is closed

                return prisma.task.create({
                    data: {
                        projectId: projects[task.projectIndex].id,
                        name: task.name,
                        status: isOpen ? TaskStatus.OPEN : TaskStatus.CLOSED,
                        startDate,
                        endDate: isOpen ? null : getDaysAgo(5),
                    },
                });
            })
        );
        logger.info(`✅ Created ${allTasks.length} tasks`);

        // ====================================================================
        // Create Task Assignments (each task assigned to exactly ONE user)
        // ====================================================================
        const openTasks = allTasks.filter((t) => t.status === TaskStatus.OPEN);
        let totalAssignments = 0;
        const assignmentRandom = seededRandom(12345);

        // Shuffle tasks and distribute them evenly across employees
        const shuffledOpenTasks = shuffle(openTasks, assignmentRandom);
        const tasksPerEmployee = Math.ceil(shuffledOpenTasks.length / employees.length);

        for (let empIndex = 0; empIndex < employees.length; empIndex++) {
            const employee = employees[empIndex];
            const startIdx = empIndex * tasksPerEmployee;
            const endIdx = Math.min(startIdx + tasksPerEmployee, shuffledOpenTasks.length);
            const employeeTasks = shuffledOpenTasks.slice(startIdx, endIdx);

            if (employeeTasks.length === 0) {
                logger.warn(`⚠️ No tasks available for employee ${employee.fullName}`);
                continue;
            }

            await Promise.all(
                employeeTasks.map(async (task) => {
                    return prisma.taskAssignment.create({
                        data: {
                            userId: employee.id,
                            taskId: task.id,
                            assignedByAdminId: admin.id,
                        },
                    });
                })
            );
            totalAssignments += employeeTasks.length;
            logger.info(`   📌 ${employee.fullName}: ${employeeTasks.length} tasks assigned`);
        }
        logger.info(`✅ Created ${totalAssignments} task assignments`);

        // ====================================================================
        // Create Time Entries and Workday Summaries for Each Employee
        // ====================================================================
        let totalTimeEntries = 0;
        const locations: WorkLocation[] = [WorkLocation.OFFICE, WorkLocation.CLIENT, WorkLocation.HOME];

        for (let empIndex = 0; empIndex < employees.length; empIndex++) {
            const employee = employees[empIndex];
            const random = seededRandom(empIndex * 2000);

            // Get this employee's assigned tasks
            const assignments = await prisma.taskAssignment.findMany({
                where: { userId: employee.id },
                include: { task: true },
            });
            const employeeTasks = assignments.map((a) => a.task);

            if (employeeTasks.length === 0) continue;

            // Generate time entries for the last 30 days
            const numDaysWithEntries = 15 + Math.floor(random() * 10); // 15-25 days
            const allWorkdays: Date[] = [];

            for (let d = 1; d <= 45; d++) {
                const day = getDaysAgo(d);
                if (isWorkday(day)) {
                    allWorkdays.push(day);
                }
            }

            const shuffledDays = shuffle(allWorkdays, random);
            const workingDays = shuffledDays.slice(0, numDaysWithEntries);

            for (const workDate of workingDays) {
                // Generate 1-4 time entries per day
                const numEntries = 1 + Math.floor(random() * 4);
                let dayTotalMinutes = 0;
                const entriesForDay: {
                    startHour: number;
                    startMin: number;
                    endHour: number;
                    endMin: number;
                    taskId: string;
                    description: string;
                    location: WorkLocation;
                    durationMinutes: number;
                }[] = [];

                // Generate non-overlapping time slots
                let currentHour = 8 + Math.floor(random() * 2); // Start between 8-9 AM

                for (let e = 0; e < numEntries && currentHour < 18; e++) {
                    const durationMinutes = 60 + Math.floor(random() * 180); // 60-240 minutes
                    const startHour = currentHour;
                    const startMin = Math.floor(random() * 4) * 15; // 0, 15, 30, or 45

                    const totalStartMinutes = startHour * 60 + startMin;
                    const totalEndMinutes = totalStartMinutes + durationMinutes;

                    if (totalEndMinutes > 18 * 60) break; // Don't go past 6 PM

                    const endHour = Math.floor(totalEndMinutes / 60);
                    const endMin = totalEndMinutes % 60;

                    const task = pickRandom(employeeTasks, random);
                    const description = pickRandom(WORK_DESCRIPTIONS, random);
                    const location = pickRandom(locations, random);

                    entriesForDay.push({
                        startHour,
                        startMin,
                        endHour,
                        endMin,
                        taskId: task.id,
                        description,
                        location,
                        durationMinutes,
                    });

                    dayTotalMinutes += durationMinutes;
                    currentHour = endHour + Math.floor(random() * 2); // Gap of 0-1 hours
                }

                // Create time entries
                for (const entry of entriesForDay) {
                    await prisma.timeEntry.create({
                        data: {
                            userId: employee.id,
                            workDate,
                            location: entry.location,
                            startTime: createTimeDate(entry.startHour, entry.startMin),
                            endTime: createTimeDate(entry.endHour, entry.endMin),
                            durationMinutes: entry.durationMinutes,
                            taskId: entry.taskId,
                            description: entry.description,
                            source: TimeEntrySource.MANUAL,
                            isDeleted: false,
                        },
                    });
                    totalTimeEntries++;
                }

                // Create or update workday summary
                const status = dayTotalMinutes >= WORKDAY_MINUTES
                    ? WorkdayStatus.FULL
                    : dayTotalMinutes > 0
                        ? WorkdayStatus.MISSING
                        : WorkdayStatus.MISSING;

                await prisma.workdaySummary.upsert({
                    where: {
                        userId_workDate: {
                            userId: employee.id,
                            workDate,
                        },
                    },
                    update: {
                        workMinutes: dayTotalMinutes,
                        status,
                    },
                    create: {
                        userId: employee.id,
                        workDate,
                        targetMinutes: WORKDAY_MINUTES,
                        workMinutes: dayTotalMinutes,
                        absenceMinutes: 0,
                        status,
                        isLocked: false,
                        isSubmitted: false,
                        requiresExactTotal: false,
                    },
                });
            }
        }
        logger.info(`✅ Created ${totalTimeEntries} time entries with workday summaries`);

        // ====================================================================
        // Create Absence Requests for Each Employee
        // ====================================================================
        const absenceTypes: AbsenceType[] = [AbsenceType.VACATION, AbsenceType.SICK, AbsenceType.RESERVES, AbsenceType.OTHER];
        let totalAbsenceRequests = 0;
        let totalAbsenceDays = 0;

        for (let empIndex = 0; empIndex < employees.length; empIndex++) {
            const employee = employees[empIndex];
            const random = seededRandom(empIndex * 3000);

            // Each employee gets 1-3 absence requests
            const numAbsences = 1 + Math.floor(random() * 3);

            for (let a = 0; a < numAbsences; a++) {
                const absenceType = pickRandom(absenceTypes, random);
                const isHalfDay = random() < 0.25; // 25% chance of half-day
                const startDaysAgo = 10 + Math.floor(random() * 30);
                const startDate = getDaysAgo(startDaysAgo);

                // Find a valid workday for start
                while (!isWorkday(startDate)) {
                    startDate.setDate(startDate.getDate() + 1);
                }

                const durationDays = isHalfDay ? 0 : Math.floor(random() * 4); // 0-3 additional days
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + durationDays);

                // Determine status based on type
                const needsDocument = absenceType === AbsenceType.SICK || absenceType === AbsenceType.RESERVES;
                const status = needsDocument && random() < 0.3
                    ? AbsenceStatus.PENDING_DOCUMENT
                    : AbsenceStatus.SUBMITTED;

                const note = pickRandom(ABSENCE_NOTES, random);

                const absenceRequest = await prisma.absenceRequest.create({
                    data: {
                        userId: employee.id,
                        type: absenceType,
                        startDate,
                        endDate,
                        isHalfDay,
                        status,
                        note,
                    },
                });
                totalAbsenceRequests++;

                // Create absence days
                const workdays = getWorkdaysInRange(startDate, endDate);
                for (const workDate of workdays) {
                    const minutes = isHalfDay ? HALF_DAY_MINUTES : WORKDAY_MINUTES;

                    await prisma.absenceDay.create({
                        data: {
                            absenceRequestId: absenceRequest.id,
                            userId: employee.id,
                            workDate,
                            minutes,
                        },
                    });
                    totalAbsenceDays++;

                    // Update workday summary with absence minutes
                    await prisma.workdaySummary.upsert({
                        where: {
                            userId_workDate: {
                                userId: employee.id,
                                workDate,
                            },
                        },
                        update: {
                            absenceMinutes: {
                                increment: minutes,
                            },
                        },
                        create: {
                            userId: employee.id,
                            workDate,
                            targetMinutes: WORKDAY_MINUTES,
                            workMinutes: 0,
                            absenceMinutes: minutes,
                            status: isHalfDay ? WorkdayStatus.MISSING : WorkdayStatus.FULL,
                            isLocked: false,
                            isSubmitted: false,
                            requiresExactTotal: false,
                        },
                    });
                }
            }
        }
        logger.info(`✅ Created ${totalAbsenceRequests} absence requests with ${totalAbsenceDays} absence days`);

        // ====================================================================
        // Summary
        // ====================================================================
        logger.info('');
        logger.info('📊 Mock Data Seed Summary:');
        logger.info(`   - Employees: ${employees.length}`);
        logger.info(`   - Clients: ${clients.length}`);
        logger.info(`   - Projects: ${projects.length}`);
        logger.info(`   - Tasks: ${allTasks.length} (${openTasks.length} open)`);
        logger.info(`   - Task Assignments: ${totalAssignments}`);
        logger.info(`   - Time Entries: ${totalTimeEntries}`);
        logger.info(`   - Absence Requests: ${totalAbsenceRequests}`);
        logger.info(`   - Absence Days: ${totalAbsenceDays}`);
        logger.info('');
        logger.info('✅ Mock data seeded successfully!');

    } catch (error) {
        logger.error('❌ Error seeding mock data:', error);
        throw error;
    }
};

// Execute if run directly
if (require.main === module) {
    seedMockData()
        .then(async () => {
            await prisma.$disconnect();
            process.exit(0);
        })
        .catch(async (error) => {
            console.error(error);
            await prisma.$disconnect();
            process.exit(1);
        });
}
