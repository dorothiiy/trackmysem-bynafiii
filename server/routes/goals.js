import express from 'express';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// Get today's goal
router.get('/today', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const db = req.app.locals.db;
    const today = new Date().toISOString().split('T')[0];

    try {
        const goal = await db.get(
            `SELECT * FROM daily_goals WHERE userId = ? AND date = ?`,
            [userId, today]
        );
        res.json(goal || null);
    } catch (err) {
        console.error('Error fetching daily goal:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Set or update today's goal
router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { goalText, subjectCode } = req.body;
    const db = req.app.locals.db;
    const today = new Date().toISOString().split('T')[0];

    if (!goalText) {
        return res.status(400).json({ error: 'Goal text is required' });
    }

    try {
        // Check if exists
        const existing = await db.get(
            `SELECT id FROM daily_goals WHERE userId = ? AND date = ?`,
            [userId, today]
        );

        if (existing) {
            await db.run(
                `UPDATE daily_goals SET goalText = ?, subjectCode = ? WHERE id = ?`,
                [goalText, subjectCode || null, existing.id]
            );
            res.json({ id: existing.id, date: today, goalText, subjectCode, isCompleted: 0 });
        } else {
            const result = await db.run(
                `INSERT INTO daily_goals (userId, date, goalText, subjectCode) VALUES (?, ?, ?, ?)`,
                [userId, today, goalText, subjectCode || null]
            );
            res.json({ id: result.lastID, date: today, goalText, subjectCode, isCompleted: 0 });
        }
    } catch (err) {
        console.error('Error setting daily goal:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Toggle completion
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { isCompleted } = req.body;
    const db = req.app.locals.db;

    try {
        await db.run(
            `UPDATE daily_goals SET isCompleted = ? WHERE id = ? AND userId = ?`,
            [isCompleted ? 1 : 0, goalId, userId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error toggling goal:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
