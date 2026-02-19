import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import subjectRoutes from './routes/subjects.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

async function start() {
    const db = await initDb();

    // Routes
    app.use('/api/auth', authRoutes(db));
    app.use('/api/subjects', subjectRoutes(db));

    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err);
});
