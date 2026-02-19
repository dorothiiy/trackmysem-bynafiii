import express from 'express';
import { hashPassword, comparePassword, generateToken, authMiddleware } from '../auth.js';
import { seedUserTasks } from '../db.js'; // Import seedUserTasks

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, programmeType, courseName, programmeSlug } = req.body;
    const db = req.app.locals.db;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    try {
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const passwordHash = await hashPassword(password);
        const result = await db.run(
            `INSERT INTO users (name, email, passwordHash, programmeType, courseName, programmeSlug, currentSemester) 
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [name, email, passwordHash, programmeType, courseName, programmeSlug || '']
        );

        const userId = result.lastID;

        const user = {
            id: userId,
            name,
            email,
            programmeType,
            courseName,
            programmeSlug,
            currentSemester: 1
        };

        const token = generateToken(user);

        // Seed initial tasks for the new user (for demo purposes)
        seedUserTasks(db, userId, programmeSlug).catch(console.error);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: userId,
                name,
                email,
                programmeType,
                courseName,
                programmeSlug,
                currentSemester: 1
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const db = req.app.locals.db;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await db.get(
            'SELECT id, name, email, passwordHash, programmeType, courseName, programmeSlug, currentSemester FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { passwordHash, ...userWithoutPassword } = user;
        const token = generateToken(userWithoutPassword);

        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    const db = req.app.locals.db;

    try {
        const user = await db.get(
            `SELECT u.id, u.name, u.email, u.programmeType, u.courseName, u.programmeSlug, u.currentSemester,
                    p.name as programmeName, p.category as programmeCategory
             FROM users u
             LEFT JOIN programmes p ON u.programmeSlug = p.slug
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { ...userProfile } = user;
        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PATCH /api/auth/me - Update user profile
router.patch('/me', authMiddleware, async (req, res) => {
    const { currentSemester } = req.body;
    const db = req.app.locals.db;

    try {
        if (currentSemester !== undefined) {
            await db.run(
                'UPDATE users SET currentSemester = ? WHERE id = ?',
                [parseInt(currentSemester), req.user.id]
            );
        }

        const updatedUser = await db.get(
            `SELECT u.id, u.name, u.email, u.programmeType, u.courseName, u.programmeSlug, u.currentSemester,
                    p.name as programmeName, p.category as programmeCategory
             FROM users u
             LEFT JOIN programmes p ON u.programmeSlug = p.slug
             WHERE u.id = ?`,
            [req.user.id]
        );

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
