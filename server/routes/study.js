import express from 'express';
import { authMiddleware } from '../auth.js';
import { differenceInDays, parseISO, startOfWeek, endOfWeek, format } from 'date-fns';

const router = express.Router();

// Log a study session
router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { subjectCode, durationMinutes, notes } = req.body;
    const db = req.app.locals.db;
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const startTime = new Date(now.getTime() - durationMinutes * 60000).toISOString();
    const endTime = now.toISOString();

    if (!durationMinutes || durationMinutes <= 0) {
        return res.status(400).json({ error: 'Valid duration is required' });
    }

    try {
        const result = await db.run(
            `INSERT INTO study_sessions (userId, subjectCode, durationMinutes, startTime, endTime, date, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, subjectCode, durationMinutes, startTime, endTime, date, notes || '']
        );

        res.status(201).json({
            id: result.lastID,
            message: 'Session logged successfully',
            minutes: durationMinutes
        });
    } catch (err) {
        console.error('Error logging study session:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get study stats (Momentum, Weekly, etc.)
router.get('/stats', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const db = req.app.locals.db;

    try {
        // 1. Get all sessions ordered by date DESC
        const sessions = await db.all(
            `SELECT date, durationMinutes FROM study_sessions WHERE userId = ? ORDER BY date DESC`,
            [userId]
        );

        // Calculate Streak
        let currentStreak = 0;
        if (sessions.length > 0) {
            // Get unique dates sorted DESC
            const uniqueDates = [...new Set(sessions.map(s => s.date))];

            // Get today and yesterday in YYYY-MM-DD
            // Note: Using UTC for simplicity, but ideally should use user's timezone
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const yesterdayDate = new Date(now);
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterday = yesterdayDate.toISOString().split('T')[0];

            // Check if latest study date is today or yesterday
            if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
                currentStreak = 1;

                // Determine start date for check (if today is present, start checking from yesterday, else start from day before yesterday)
                let checkDateStr = uniqueDates.includes(today) ? today : yesterday;
                let checkDate = new Date(checkDateStr);

                // Iterate through unique dates
                // We want to check consecutiveness. uniqueDates is sorted DESC.
                // uniqueDates[0] is either today or yesterday (verified by if).

                for (let i = 1; i < uniqueDates.length; i++) {
                    const previousDateStr = uniqueDates[i]; // The next date in the list (older)

                    // Expected previous date is checkDate - 1 day
                    const expectedDateObj = new Date(checkDate);
                    expectedDateObj.setDate(expectedDateObj.getDate() - 1);
                    const expectedDateStr = expectedDateObj.toISOString().split('T')[0];

                    if (previousDateStr === expectedDateStr) {
                        currentStreak++;
                        checkDate = expectedDateObj; // Move check date back
                    } else {
                        break; // Gap found
                    }
                }
            }
        }

        // Calculate Total Hours
        const totalMinutes = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
        // Format to 1 decimal, but remove .0 if integer
        const totalHours = (totalMinutes / 60);
        const formattedHours = totalHours % 1 === 0 ? totalHours.toFixed(0) : totalHours.toFixed(1);

        // Calculate Weekly Data (Last 7 days)
        const weeklyData = [];
        const todayObj = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(todayObj);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

            const minutesForDay = sessions
                .filter(s => s.date === dateStr)
                .reduce((acc, s) => acc + s.durationMinutes, 0);

            weeklyData.push({ day: dayLabel, minutes: minutesForDay });
        }

        res.json({
            currentStreak,
            totalHours: formattedHours,
            weeklyData
        });

    } catch (err) {
        console.error('Error fetching study stats:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
