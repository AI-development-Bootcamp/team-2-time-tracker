import { prisma } from './src/db/index';
import { EntityStatus, TaskStatus } from '@prisma/client';

async function main() {
    console.log('Seeding Tasks...');

    try {
        // Create Client
        const client = await prisma.client.upsert({
            where: { id: '550e8400-e29b-41d4-a716-446655440001' },
            update: {},
            create: {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'לקוח א',
                status: EntityStatus.ACTIVE,
            },
        });
        console.log('✓ Upserted Client:', client.id);

        // Create Project
        const project = await prisma.project.upsert({
            where: { id: '550e8400-e29b-41d4-a716-446655440011' },
            update: {},
            create: {
                id: '550e8400-e29b-41d4-a716-446655440011',
                name: 'פרויקט 1',
                clientId: client.id,
                status: EntityStatus.ACTIVE,
            },
        });
        console.log('✓ Upserted Project:', project.id);

        // Create Task
        const task = await prisma.task.upsert({
            where: { id: '550e8400-e29b-41d4-a716-446655440111' },
            update: {},
            create: {
                id: '550e8400-e29b-41d4-a716-446655440111',
                name: 'משימה 1',
                projectId: project.id,
                status: TaskStatus.OPEN,
            },
        });
        console.log('✓ Upserted Task:', task.id);

        console.log('\n✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
