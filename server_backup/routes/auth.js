import express from 'express';
import { hashPassword, comparePassword, generateToken, authMiddleware } from '../auth.js';

const router = express.Router();

export default function (db) {
    // Register
    router.post('/register', async (req, res) => {
        const { name, email, password, programmeType, courseName } = req.body;

        try {
            const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            const passwordHash = await hashPassword(password);
            const result = await db.run(
                'INSERT INTO users (name, email, passwordHash, programmeType, courseName) VALUES (?, ?, ?, ?, ?)',
                [name, email, passwordHash, programmeType, courseName]
            );

            const user = { id: result.lastID, email, name, programmeType, courseName };
            const token = generateToken(user);

            res.status(201).json({ token, user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to register user' });
        }
    });

    // Login
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const isMatch = await comparePassword(password, user.passwordHash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = generateToken(user);
            delete user.passwordHash;
            res.json({ token, user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    // Me (Profile)
    router.get('/me', authMiddleware, async (req, res) => {
        try {
            const user = await db.get('SELECT id, name, email, programmeType, courseName FROM users WHERE id = ?', [req.user.id]);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    });

    return router;
}
