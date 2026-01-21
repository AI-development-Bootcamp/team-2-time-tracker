
import { prisma } from './db';
import { createAbsence } from './modules/absences/absences.service';
import { getWorkday } from './modules/time-reports/workday.service';

async function main() {
    console.log('--- Debugging Absence Flow ---');
    try {
        // 1. Get or create a test user
        let user = await prisma.user.findFirst({ where: { email: 'debug@test.com' } });
        if (!user) {
            console.log('Creating test user debug@test.com');
            user = await prisma.user.create({
                data: {
                    email: 'debug@test.com',
                    fullName: 'Debug User',
                    password: 'password_hash',
                    role: 'EMPLOYEE'
                } as any
            });
        }
        console.log(`Using user: ${user.id}`);

        // 2. Define dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        console.log(`Creating absence for ${todayStr} to ${tomorrowStr}`);

        // 3. Create Absence
        try {
            const absence = await createAbsence(user.id, {
                type: 'SICK',
                startDate: todayStr,
                endDate: tomorrowStr,
                isHalfDay: false,
                note: 'Debug sickness'
            });

            if (absence) {
                console.log('Absence created:', absence.id);
            } else {
                console.log('Absence creation returned null/undefined');
            }
        } catch (e: any) {
            if (e.message?.includes('Overlapping')) {
                console.log('Absence already exists, continuing...');
            } else {
                throw e;
            }
        }

        // 4. Verify AbsenceDay records in DB
        const absenceDays = await prisma.absenceDay.findMany({
            where: {
                userId: user.id,
                workDate: {
                    gte: new Date(todayStr),
                }
            },
            orderBy: { workDate: 'asc' }
        });

        console.log(`Found ${absenceDays.length} absence days in DB:`);
        absenceDays.forEach(d => console.log(` - ${d.workDate.toISOString()} (Request: ${d.absenceRequestId})`));

        if (absenceDays.length === 0) {
            console.error('CRITICAL: No absence days created!');
            return;
        }

        // 5. Test getWorkday
        const checkDate = absenceDays[0].workDate.toISOString().split('T')[0];
        console.log(`Calling getWorkday for ${checkDate}...`);

        const workday = await getWorkday(user.id, checkDate);

        console.log('--- getWorkday Result ---');
        console.log('Absences array:', JSON.stringify(workday.absences, null, 2));

        if (workday.absences.length > 0) {
            console.log('SUCCESS: Absence found in workday response.');
        } else {
            console.log('FAILURE: Absence NOT found in workday response.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
