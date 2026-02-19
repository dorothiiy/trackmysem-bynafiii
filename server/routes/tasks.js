import express from 'express';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// Get all tasks for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { type, isCompleted } = req.query;
    const db = req.app.locals.db;

    let query = `
        SELECT t.*, s.name as subjectName, s.code as subjectCode
        FROM tasks t
        LEFT JOIN subjects s ON t.subjectCode = s.code
        WHERE t.userId = ?
    `;
    const params = [userId];

    if (type) {
        query += ` AND t.type = ?`;
        params.push(type);
    }
    if (isCompleted !== undefined) {
        query += ` AND t.isCompleted = ?`;
        params.push(isCompleted === 'true' ? 1 : 0);
    }

    query += ` ORDER BY t.dueDate ASC`;

    try {
        const tasks = await db.all(query, params);
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get upcoming tasks (Next Best Action logic relies on this)
router.get('/upcoming', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const limit = req.query.limit || 5;
    const db = req.app.locals.db;

    // Logic: Not completed, ordered by due date ASC, then priority
    const query = `
        SELECT t.*, s.name as subjectName 
        FROM tasks t
        LEFT JOIN subjects s ON t.subjectCode = s.code
        WHERE t.userId = ? AND t.isCompleted = 0
        ORDER BY 
            t.dueDate ASC,
            CASE t.priority 
                WHEN 'high' THEN 1 
                WHEN 'medium' THEN 2 
                WHEN 'low' THEN 3 
                ELSE 4 
            END
        LIMIT ?
    `;

    try {
        const tasks = await db.all(query, [userId, limit]);
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching upcoming tasks:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Create a new task
router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { subjectCode, title, type, dueDate, priority, estimatedMinutes } = req.body;
    const db = req.app.locals.db;

    if (!title || !type) {
        return res.status(400).json({ error: 'Title and Type are required' });
    }

    try {
        const result = await db.run(`
            INSERT INTO tasks (userId, subjectCode, title, type, dueDate, priority, estimatedMinutes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, subjectCode, title, type, dueDate, priority || 'medium', estimatedMinutes || 30]);

        res.status(201).json({ id: result.lastID, ...req.body });
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Update a task (e.g., mark as completed)
router.patch('/:id', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    const updates = req.body;
    const db = req.app.locals.db;

    // Construct dynamic update query
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
    }

    const query = `UPDATE tasks SET ${fields} WHERE id = ? AND userId = ?`;
    values.push(taskId, userId);

    try {
        const result = await db.run(query, values);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }
        res.json({ message: 'Task updated successfully' });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    const db = req.app.locals.db;

    try {
        const result = await db.run(`DELETE FROM tasks WHERE id = ? AND userId = ?`, [taskId, userId]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
