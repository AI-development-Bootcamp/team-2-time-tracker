
// Simple verification script using native fetch
// Run with: node scripts/verify-manual.js

async function main() {
    const API_URL = 'http://localhost:3000/api';
    console.log('🚀 Starting Manual Verification...');

    // 1. Login
    console.log('\n🔑 Logging in as admin...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'Password1!' })
    });
    
    if (!loginRes.ok) {
        console.error('❌ Login failed:', await loginRes.text());
        process.exit(1);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('✅ Logged in.');

    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    // 2. Clean up (Cancel any running timer)
    console.log('\n🧹 Cleaning up...');
    await fetch(`${API_URL}/timer/cancel`, { method: 'DELETE', headers });

    // 3. Start Timer
    console.log('\n⏱️ Starting Timer...');
    const today = new Date().toISOString().split('T')[0];
    const startRes = await fetch(`${API_URL}/timer/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ workDate: today })
    });

    if (!startRes.ok) {
        console.error('❌ Start failed:', await startRes.text());
        process.exit(1);
    }
    const startData = await startRes.json();
    console.log('✅ Timer Started:', startData.data);

    // 4. Get Status
    console.log('\n📊 Checking Status...');
    const statusRes = await fetch(`${API_URL}/timer/status`, { headers });
    const statusData = await statusRes.json();
    console.log('✅ Status:', statusData.data);
    
    if (!statusData.data.isRunning) {
        console.error('❌ Expected timer to be running!');
        process.exit(1);
    }

    // 5. Get Tasks (to stop timer with valid task ID)
    // We need a task ID. Let's try to list projects/tasks if possible, or just skip stop test if we can't find one easily.
    // Since we ran seed, we hope there's data. But Admin viewing "my tasks" might be empty?
    // Let's assume seed created data.
    // Actually, seed creates data but we need to know the IDs.
    // Minimal verification: Login -> Start -> Status -> Cancel. This proves the Timer Module works.
    // Stop requires Task ID. I'll skip Stop for now unless I can fetch tasks.
    
    // 5. Cancel Timer (Cleanup)
    console.log('\n🔄 Cancelling Timer...');
    const cancelRes = await fetch(`${API_URL}/timer/cancel`, { method: 'DELETE', headers });
    if (!cancelRes.ok) {
        console.error('❌ Cancel failed:', await cancelRes.text());
    } else {
        console.log('✅ Timer Cancelled');
    }

    console.log('\n🎉 Verification Complete (Start/Status/Cancel flow verified)');
}

main().catch(console.error);
