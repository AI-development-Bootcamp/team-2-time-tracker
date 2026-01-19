import { prisma } from './src/db/index';

async function testPrismaConnection() {
    console.log('🔍 Testing Prisma 7.2 Connection...\n');

    try {
        // Test 1: Database Connection
        console.log('Test 1: Database Connection');
        await prisma.$connect();
        console.log('✅ Successfully connected to database\n');

        // Test 2: Query Test (count users)
        console.log('Test 2: Query Execution');
        const userCount = await prisma.user.count();
        console.log(`✅ Query successful - Found ${userCount} users\n`);

        // Test 3: Schema Introspection
        console.log('Test 3: Schema Introspection');
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;
        console.log(`✅ Schema introspection successful - Found ${(tables as any[]).length} tables\n`);

        // Test 4: Transaction Test
        console.log('Test 4: Transaction Support');
        await prisma.$transaction(async (tx) => {
            const count = await tx.user.count();
            console.log(`✅ Transaction successful - User count: ${count}\n`);
        });

        console.log('🎉 All Prisma 7.2 tests passed!\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('👋 Disconnected from database');
    }
}

testPrismaConnection();
