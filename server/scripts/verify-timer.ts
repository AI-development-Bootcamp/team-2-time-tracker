
import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api';

async function main() {
    console.log('🚀 Starting Timer Verification...');

    // 1. Setup Test Data
    console.log('📦 Setting up test data...');
    
    // Ensure Admin
    const adminEmail = 'admin@example.com';
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
        const hashedAdminPwd = await bcrypt.hash('Password1!', 10);
        admin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedAdminPwd,
                fullName: 'Admin User',
                role: UserRole.ADMIN,
                isActive: true,
            }
        });
    }

    // Ensure Employee
    const email = 'timer_test@example.com';
    const password = 'Password1!';
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName: 'Timer Test User',
                role: UserRole.EMPLOYEE,
                isActive: true,
            }
        });
    }

    // Ensure Client/Project/Task
    let client = await prisma.client.findFirst({ where: { name: 'Test Client' } });
    if (!client) client = await prisma.client.create({ data: { name: 'Test Client' } });

    let project = await prisma.project.findFirst({ where: { name: 'Test Project', clientId: client.id } });
    if (!project) project = await prisma.project.create({ data: { name: 'Test Project', clientId: client.id } });

    let task = await prisma.task.findFirst({ where: { name: 'Test Task', projectId: project.id } });
    if (!task) task = await prisma.task.create({ data: { name: 'Test Task', projectId: project.id } });

    // Ensure Assignment
    const assignment = await prisma.taskAssignment.findUnique({
        where: { userId_taskId: { userId: user.id, taskId: task.id } }
    });
    if (!assignment) {
        await prisma.taskAssignment.create({
            data: {
                userId: user.id,
                taskId: task.id,
                assignedByAdminId: admin.id,
            }
        });
    }

    console.log('✅ Test data ready');

    // Helper for API calls
    const apiCall = async (method: string, path: string, body?: any, token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        try {
            const res = await fetch(`${API_URL}${path}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });
            
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            if (!res.ok) {
                throw new Error(data.error || JSON.stringify(data) || res.statusText);
            }
            return data;
        } catch (error: any) {
            throw error;
        }
    };

    // 2. Login
    console.log('🔑 Logging in...');
    let token: string;
    try {
        const loginRes = await apiCall('POST', '/auth/login', { email, password });
        token = loginRes.data.token;
        console.log('✅ Logged in successfully');
    } catch (error: any) {
        console.error('❌ Login failed:', error.message);
        process.exit(1);
    }

    // 3. Clean up
    try { await apiCall('DELETE', '/timer/cancel', undefined, token); } catch (e) {}

    // 4. Test Start
    console.log('⏱️  Testing Start Timer...');
    const today = new Date().toISOString().split('T')[0];
    try {
        const startRes = await apiCall('POST', '/timer/start', { workDate: today }, token);
        console.log('✅ Timer started:', startRes.data);
    } catch (error: any) {
        console.error('❌ Start Timer failed:', error.message);
        process.exit(1);
    }

    // 5. Status
    console.log('📊 Testing Get Status...');
    try {
        const statusRes = await apiCall('GET', '/timer/status', undefined, token);
        if (statusRes.data.isRunning) console.log('✅ Timer is running');
        else throw new Error('Timer not running');
    } catch (error: any) {
        console.error('❌ Get Status failed:', error.message);
        process.exit(1);
    }

    // 6. Stop
    console.log('🛑 Testing Stop Timer...');
    try {
        await new Promise(r => setTimeout(r, 1000));
        const stopRes = await apiCall('POST', '/timer/stop', {
            taskId: task.id,
            location: 'OFFICE',
            description: 'Testing timer implementation verification script',
        }, token);
        console.log('✅ Timer stopped, entry created:', stopRes.data.id);
    } catch (error: any) {
        console.error('❌ Stop Timer failed:', error.message);
        process.exit(1);
    }

    console.log('🎉 All Verify Tests Passed!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
