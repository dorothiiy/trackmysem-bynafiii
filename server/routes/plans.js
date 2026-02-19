import express from 'express';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// GET /api/plans/:semester - Get plan for a specific semester
router.get('/:semester', authMiddleware, async (req, res) => {
    const { semester } = req.params;
    const db = req.app.locals.db;

    try {
        const plans = await db.all(`
            SELECT p.id, p.subjectCode, p.status, p.createdAt,
                   s.name as subjectName, s.type, s.credits, s.semesterNumber
            FROM plans p
            JOIN subjects s ON p.subjectCode = s.code
            WHERE p.userId = ? AND p.semester = ?
            ORDER BY s.code
        `, [req.user.id, parseInt(semester)]);

        const totalCredits = plans.reduce((sum, p) => sum + p.credits, 0);

        res.json({
            semester: parseInt(semester),
            subjects: plans,
            totalCredits
        });
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ error: 'Failed to fetch plan' });
    }
});

// POST /api/plans/:semester - Create/update plan for a semester
router.post('/:semester', authMiddleware, async (req, res) => {
    const { semester } = req.params;
    const { subjects } = req.body; // Array of { courseCode, status }
    const db = req.app.locals.db;

    if (!subjects || !Array.isArray(subjects)) {
        return res.status(400).json({ error: 'Subjects array is required' });
    }

    try {
        // Validate that all subjects belong to the user's programme
        const userProgrammeSlug = req.user.programmeSlug;

        for (const subject of subjects) {
            const subjectData = await db.get(`
                SELECT s.code, p.slug as programmeSlug
                FROM subjects s
                JOIN programmes p ON s.programmeId = p.id
                WHERE s.code = ?
            `, [subject.courseCode]);

            if (!subjectData) {
                return res.status(400).json({ error: `Subject ${subject.courseCode} not found` });
            }

            if (subjectData.programmeSlug !== userProgrammeSlug) {
                return res.status(403).json({
                    error: `Subject ${subject.courseCode} does not belong to your programme`
                });
            }
        }

        // Delete existing plan for this semester
        await db.run('DELETE FROM plans WHERE userId = ? AND semester = ?',
            [req.user.id, parseInt(semester)]);

        // Insert new plan
        for (const subject of subjects) {
            await db.run(`
                INSERT INTO plans (userId, semester, subjectCode, status)
                VALUES (?, ?, ?, ?)
            `, [req.user.id, parseInt(semester), subject.courseCode, subject.status || 'not-started']);
        }

        // Fetch and return the updated plan
        const updatedPlan = await db.all(`
            SELECT p.id, p.subjectCode, p.status, p.createdAt,
                   s.name as subjectName, s.type, s.credits, s.semesterNumber
            FROM plans p
            JOIN subjects s ON p.subjectCode = s.code
            WHERE p.userId = ? AND p.semester = ?
            ORDER BY s.code
        `, [req.user.id, parseInt(semester)]);

        const totalCredits = updatedPlan.reduce((sum, p) => sum + p.credits, 0);

        res.json({
            semester: parseInt(semester),
            subjects: updatedPlan,
            totalCredits
        });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

// DELETE /api/plans/:semester - Delete a semester plan
router.delete('/:semester', authMiddleware, async (req, res) => {
    const { semester } = req.params;
    const db = req.app.locals.db;

    try {
        await db.run('DELETE FROM plans WHERE userId = ? AND semester = ?',
            [req.user.id, parseInt(semester)]);

        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting plan:', error);
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});

// PATCH /api/plans/:semester/subject/:code - Update subject status
router.patch('/:semester/subject/:code', authMiddleware, async (req, res) => {
    const { semester, code } = req.params;
    const { status } = req.body;
    const db = req.app.locals.db;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    try {
        await db.run(`
            UPDATE plans 
            SET status = ?
            WHERE userId = ? AND semester = ? AND subjectCode = ?
        `, [status, req.user.id, parseInt(semester), code]);

        res.json({ message: 'Subject status updated' });
    } catch (error) {
        console.error('Error updating subject status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

export default router;
