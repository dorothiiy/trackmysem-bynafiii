import express from 'express';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// GET /api/subjects?programme={slug}&semester={num}
router.get('/', authMiddleware, async (req, res) => {
    const { programme, semester } = req.query;
    const db = req.app.locals.db;

    if (!programme || !semester) {
        return res.status(400).json({ error: 'Programme and semester are required' });
    }

    // Validate that the requested programme matches the user's programme
    if (req.user.programmeSlug && req.user.programmeSlug !== programme) {
        return res.status(403).json({ error: 'Access denied: You can only view subjects for your enrolled programme' });
    }

    try {
        const subjects = await db.all(`
            SELECT id, code as courseCode, name as subjectName, type, credits, 
                   semesterNumber, semesterTag, programmeSlug
            FROM subjects
            WHERE programmeSlug = ? AND semesterNumber = ?
            ORDER BY code
        `, [programme, parseInt(semester)]);

        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// GET /api/subjects/available?programme={slug}&semester={num}
router.get('/available', authMiddleware, async (req, res) => {
    const { programme, semester } = req.query;
    const db = req.app.locals.db;

    if (!programme || !semester) {
        return res.status(400).json({ error: 'Programme and semester are required' });
    }

    // Validate programme access
    if (req.user.programmeSlug && req.user.programmeSlug !== programme) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        // Get all subjects for the programme and semester
        const allSubjects = await db.all(`
            SELECT id, code as courseCode, name as subjectName, type, credits, 
                   semesterNumber, semesterTag, programmeSlug
            FROM subjects
            WHERE programmeSlug = ? AND semesterNumber = ?
            ORDER BY code
        `, [programme, parseInt(semester)]);

        // Get subjects already in the user's plan for this semester
        const plannedSubjects = await db.all(`
            SELECT subjectCode
            FROM plans
            WHERE userId = ? AND semester = ?
        `, [req.user.id, parseInt(semester)]);

        const plannedCodes = new Set(plannedSubjects.map(p => p.subjectCode));
        const availableSubjects = allSubjects.filter(s => !plannedCodes.has(s.courseCode));

        res.json(availableSubjects);
    } catch (error) {
        console.error('Error fetching available subjects:', error);
        res.status(500).json({ error: 'Failed to fetch available subjects' });
    }
});

// GET /api/subjects/by-programme/:programmeSlug
router.get('/by-programme/:programmeSlug', authMiddleware, async (req, res) => {
    const { programmeSlug } = req.params;
    const db = req.app.locals.db;

    // Validate programme access
    if (req.user.programmeSlug && req.user.programmeSlug !== programmeSlug) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const subjects = await db.all(`
            SELECT id, code as courseCode, name as subjectName, type, credits, 
                   semesterNumber, semesterTag, programmeSlug
            FROM subjects
            WHERE programmeSlug = ?
            ORDER BY semesterNumber, code
        `, [programmeSlug]);

        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects by programme:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

export default router;
