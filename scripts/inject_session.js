import { initDb } from '../server/db.js';

async function inject() {
    console.log('Initializing DB...');
    const db = await initDb();

    // Get first user
    const user = await db.get('SELECT id, email FROM users LIMIT 1');
    if (!user) {
        console.error('No users found!');
        process.exit(1);
    }
    console.log(`Found user: ${user.email} (ID: ${user.id})`);

    // Check existing sessions
    const count = await db.get('SELECT count(*) as c FROM study_sessions WHERE userId = ?', [user.id]);
    console.log(`Current sessions: ${count.c}`);

    // Insert session for today
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const duration = 60;

    await db.run(`
        INSERT INTO study_sessions (userId, subjectCode, durationMinutes, startTime, endTime, date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [user.id, 'MATH101', duration, now.toISOString(), now.toISOString(), date, 'Direct Injection Test']);

    console.log('Session injected.');

    // Verify
    const newCount = await db.get('SELECT count(*) as c FROM study_sessions WHERE userId = ?', [user.id]);
    console.log(`New sessions: ${newCount.c}`);
}

inject().catch(console.error);
