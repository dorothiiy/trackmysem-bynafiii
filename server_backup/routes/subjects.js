import express from 'express';
import { authMiddleware } from '../auth.js';

const router = express.Router();

export default function (db) {
    // Get subjects for the user's course
    router.get('/', authMiddleware, async (req, res) => {
        try {
            const { courseName } = req.user;

            const subjects = await db.all('SELECT * FROM subjects WHERE programme = ?', [courseName]);

            res.json(subjects);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch subjects' });
        }
    });

    return router;
}
