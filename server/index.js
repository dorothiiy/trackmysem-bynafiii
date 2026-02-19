import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import authRouter from './routes/auth.js';
import subjectsRouter from './routes/subjects.js';
import plansRouter from './routes/plans.js';
import tasksRouter from './routes/tasks.js';
import goalsRouter from './routes/goals.js';
import studyRouter from './routes/study.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database and store in app.locals
const db = await initDb();
app.locals.db = db;

// Routes
app.use('/api/auth', authRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/study', studyRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'TrackMySem API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
