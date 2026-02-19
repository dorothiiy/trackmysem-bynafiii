import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDb() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      programmeType TEXT,
      courseName TEXT,
      programmeSlug TEXT,
      currentSemester INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS programmes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL, -- Removed UNIQUE constraint to allow same code in different programmes if needed (though seeding prevents it within prog)
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      credits INTEGER NOT NULL,
      semesterNumber INTEGER NOT NULL,
      semesterTag TEXT NOT NULL,
      programmeId INTEGER,
      programmeSlug TEXT,
      FOREIGN KEY (programmeId) REFERENCES programmes(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_subjects_programmeSlug ON subjects(programmeSlug);
    CREATE INDEX IF NOT EXISTS idx_subjects_prog_sem ON subjects(programmeSlug, semesterNumber);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_subjects_code_prog ON subjects(code, programmeSlug);
  `);

    // Create plans table
    await db.run(`CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      semester INTEGER NOT NULL,
      subjectCode TEXT NOT NULL,
      status TEXT DEFAULT 'not-started',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (subjectCode) REFERENCES subjects(code),
      UNIQUE(userId, semester, subjectCode)
    )`);

    // Create tasks table for assignments, exams, etc.
    await db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      subjectCode TEXT,
      title TEXT NOT NULL,
      type TEXT NOT NULL, -- 'exam', 'assignment', 'study', 'other'
      dueDate DATETIME,
      estimatedMinutes INTEGER DEFAULT 30,
      isCompleted INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (subjectCode) REFERENCES subjects(code)
    )`);

    // Create daily_goals table
    await db.run(`CREATE TABLE IF NOT EXISTS daily_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      goalText TEXT NOT NULL,
      subjectCode TEXT, -- Optional subject link
      isCompleted INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0, -- 0 to 100
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (subjectCode) REFERENCES subjects(code)
    )`);

    // Create study_sessions table
    await db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      subjectCode TEXT,
      durationMinutes INTEGER NOT NULL,
      startTime DATETIME,
      endTime DATETIME,
      date TEXT NOT NULL, -- YYYY-MM-DD for easier querying
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (subjectCode) REFERENCES subjects(code)
    )`);

    console.log('Database initialized');

    // Helper to generate slug from programme name
    const generateSlug = (programmeName) => {
        return programmeName
            .toLowerCase()
            .replace(/[–—]/g, '-')
            .replace(/\s+/g, '_')
            .replace(/[()]/g, '')
            .replace(/&/g, 'and')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .substring(0, 50);
    };

    const seedData = {
        "Engineering": [
            "B.Tech – Biotechnology",
            "B.Tech – Chemical Engineering",
            "B.Tech – Civil Engineering",
            "B.Tech – Computer Science and Engineering and Business Systems (TCS collaboration)",
            "B.Tech – Computer Science and Engineering (Artificial Intelligence and Data Engineering)",
            "B.Tech – Electronics and Communication Engineering",
            "B.Tech – Information Technology",
            "B.Tech – Mechanical Engineering"
        ],
        "UG Programmes": [
            "B.Des",
            "B.Arch",
            "B.Sc. (Hons.) Agriculture",
            "B.Sc. Hospitality and Hotel Administration",
            "B.Sc. Computer Science",
            "B.Sc. Multimedia & Animation",
            "B.Sc. Visual Communication",
            "B.B.A",
            "BBA (Financial Analytics) 2+2 Collaborative Degree",
            "B.Com",
            "B.Com – Business Process Services",
            "B.Com – Banking and Capital Markets",
            "B.Com – Financial Technology",
            "B.C.A"
        ],
        "Integrated Programmes": [
            "Integrated M.Tech. Software Engineering",
            "Integrated M.Tech. CSE (Virtusa collaboration)",
            "Integrated M.Tech. CSE (Data Science)",
            "Integrated M.Sc. Biotechnology (5 Year)",
            "Integrated M.Sc. Food Science and Technology (5 Year)",
            "Integrated M.Sc. Computational Statistics and Data Analytics (5 Year)",
            "Integrated M.Sc. Physics (5 Year) with exit options",
            "Integrated M.Sc. Chemistry (5 Year) with exit options",
            "Integrated M.Sc. Mathematics (5 Year) with exit options"
        ]
    };

    // Specific 8-semester subject lists
    const specificSubjectsMap = {
        "B.Tech – Chemical Engineering": [
            { code: 'CH101', name: 'Engineering Mathematics I', type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: 'CH102', name: 'Engineering Chemistry', type: 'Theory', credits: 3, sem: 1, tag: 'Fall' },
            { code: 'CH103', name: 'Physics for Chemical Engineers', type: 'Theory', credits: 3, sem: 1, tag: 'Fall' },
            { code: 'CH104', name: 'Engineering Drawing', type: 'Lab', credits: 1, sem: 1, tag: 'Fall' },
            { code: 'CH105', name: 'Chemistry Lab', type: 'Lab', credits: 1, sem: 1, tag: 'Fall' },
            { code: 'CH106', name: 'Professional Communication', type: 'Soft Skill', credits: 2, sem: 1, tag: 'Fall' },
            { code: 'CH201', name: 'Engineering Mathematics II', type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: 'CH202', name: 'Material Science', type: 'Theory', credits: 3, sem: 2, tag: 'Winter' },
            { code: 'CH203', name: 'Chemical Process Calculations', type: 'Theory', credits: 3, sem: 2, tag: 'Winter' },
            { code: 'CH204', name: 'Physics Lab', type: 'Lab', credits: 1, sem: 2, tag: 'Winter' },
            { code: 'CH205', name: 'Organic Chemistry Lab', type: 'Lab', credits: 1, sem: 2, tag: 'Winter' },
            { code: 'CH206', name: 'Problem Solving & Critical Thinking', type: 'Soft Skill', credits: 2, sem: 2, tag: 'Winter' },
            { code: 'CH301', name: 'Fluid Mechanics', type: 'Theory', credits: 4, sem: 3, tag: 'Fall' },
            { code: 'CH302', name: 'Chemical Engineering Thermodynamics I', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'CH303', name: 'Heat Transfer', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'CH304', name: 'Mechanical Operations', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'CH305', name: 'Fluid Mechanics Lab', type: 'Lab', credits: 1, sem: 3, tag: 'Fall' },
            { code: 'CH401', name: 'Mass Transfer I', type: 'Theory', credits: 4, sem: 4, tag: 'Winter' },
            { code: 'CH402', name: 'Chemical Engineering Thermodynamics II', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'CH403', name: 'Process Instrumentation', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'CH404', name: 'Numerical Methods', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'CH405', name: 'Heat & Mass Transfer Lab', type: 'Lab', credits: 1, sem: 4, tag: 'Winter' },
            { code: 'CH501', name: 'Chemical Reaction Engineering I', type: 'Theory', credits: 4, sem: 5, tag: 'Fall' },
            { code: 'CH502', name: 'Process Control', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'CH503', name: 'Mass Transfer II', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'CH504', name: 'Environmental Engineering', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'CH505', name: 'Reaction Engineering Lab', type: 'Lab', credits: 1, sem: 5, tag: 'Fall' },
            { code: 'CH601', name: 'Chemical Reaction Engineering II', type: 'Theory', credits: 4, sem: 6, tag: 'Winter' },
            { code: 'CH602', name: 'Process Equipment Design', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'CH603', name: 'Separation Processes', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'CH604', name: 'Elective I', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'CH605', name: 'Process Control Lab', type: 'Lab', credits: 1, sem: 6, tag: 'Winter' },
            { code: 'CH701', name: 'Chemical Plant Design & Economics', type: 'Theory', credits: 4, sem: 7, tag: 'Fall' },
            { code: 'CH702', name: 'Safety & Hazard Analysis', type: 'Theory', credits: 3, sem: 7, tag: 'Fall' },
            { code: 'CH703', name: 'Elective II', type: 'Theory', credits: 3, sem: 7, tag: 'Fall' },
            { code: 'CH704', name: 'Internship / Industrial Training', type: 'Project', credits: 2, sem: 7, tag: 'Fall' },
            { code: 'CH801', name: 'Major Project', type: 'Project', credits: 12, sem: 8, tag: 'Winter' }
        ],
        "B.Tech – Civil Engineering": [
            { code: 'CE101', name: 'Engineering Mathematics I', type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: 'CE102', name: 'Physics for Civil Engineers', type: 'Theory', credits: 3, sem: 1, tag: 'Fall' },
            { code: 'CE103', name: 'Basic Civil Engineering', type: 'Theory', credits: 3, sem: 1, tag: 'Fall' },
            { code: 'CE104', name: 'Engineering Drawing Lab', type: 'Lab', credits: 1, sem: 1, tag: 'Fall' },
            { code: 'CE105', name: 'Physics Lab', type: 'Lab', credits: 1, sem: 1, tag: 'Fall' },
            { code: 'CE106', name: 'Communication Skills', type: 'Soft Skill', credits: 2, sem: 1, tag: 'Fall' },
            { code: 'CE201', name: 'Engineering Mathematics II', type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: 'CE202', name: 'Engineering Mechanics', type: 'Theory', credits: 3, sem: 2, tag: 'Winter' },
            { code: 'CE203', name: 'Building Materials', type: 'Theory', credits: 3, sem: 2, tag: 'Winter' },
            { code: 'CE204', name: 'Surveying Lab', type: 'Lab', credits: 2, sem: 2, tag: 'Winter' },
            { code: 'CE205', name: 'CAD Lab', type: 'Lab', credits: 1, sem: 2, tag: 'Winter' },
            { code: 'CE206', name: 'Environmental Studies', type: 'Theory', credits: 3, sem: 2, tag: 'Winter' },
            { code: 'CE301', name: 'Strength of Materials', type: 'Theory', credits: 4, sem: 3, tag: 'Fall' },
            { code: 'CE302', name: 'Fluid Mechanics', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'CE303', name: 'Structural Analysis I', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'CE304', name: 'Concrete Technology', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'CE305', name: 'Materials Testing Lab', type: 'Lab', credits: 1, sem: 3, tag: 'Fall' },
            { code: 'CE401', name: 'Structural Analysis II', type: 'Theory', credits: 4, sem: 4, tag: 'Winter' },
            { code: 'CE402', name: 'Geotechnical Engineering I', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'CE403', name: 'Hydrology', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'CE404', name: 'Transportation Engineering I', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'CE405', name: 'Geotechnical Lab', type: 'Lab', credits: 1, sem: 4, tag: 'Winter' },
            { code: 'CE501', name: 'Design of RC Structures I', type: 'Theory', credits: 4, sem: 5, tag: 'Fall' },
            { code: 'CE502', name: 'Geotechnical Engineering II', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'CE503', name: 'Environmental Engineering I', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'CE504', name: 'Transportation Engineering II', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'CE505', name: 'Environmental Engineering Lab', type: 'Lab', credits: 1, sem: 5, tag: 'Fall' },
            { code: 'CE601', name: 'Design of RC Structures II', type: 'Theory', credits: 4, sem: 6, tag: 'Winter' },
            { code: 'CE602', name: 'Environmental Engineering II', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'CE603', name: 'Water Resources Engineering', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'CE604', name: 'Elective I', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'CE605', name: 'Structural Design Lab', type: 'Lab', credits: 1, sem: 6, tag: 'Winter' },
            { code: 'CE701', name: 'Design of Steel Structures', type: 'Theory', credits: 4, sem: 7, tag: 'Fall' },
            { code: 'CE702', name: 'Construction Planning & Management', type: 'Theory', credits: 3, sem: 7, tag: 'Fall' },
            { code: 'CE703', name: 'Elective II', type: 'Theory', credits: 3, sem: 7, tag: 'Fall' },
            { code: 'CE704', name: 'Internship', type: 'Project', credits: 2, sem: 7, tag: 'Fall' },
            { code: 'CE801', name: 'Major Project', type: 'Project', credits: 12, sem: 8, tag: 'Winter' }
        ],
        "B.Tech – Computer Science and Engineering and Business Systems (TCS collaboration)": [
            { code: 'CB101', name: 'Programming in Python', type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: 'CB102', name: 'Engineering Mathematics I', type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: 'CB103', name: 'Accounting & Financial Analysis', type: 'Theory', credits: 3, sem: 1, tag: 'Fall' },
            { code: 'CB104', name: 'Python Lab', type: 'Lab', credits: 2, sem: 1, tag: 'Fall' },
            { code: 'CB105', name: 'Business Communication', type: 'Soft Skill', credits: 2, sem: 1, tag: 'Fall' },
            { code: 'CB201', name: 'Data Structures', type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: 'CB202', name: 'Engineering Mathematics II', type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: 'CB203', name: 'Principles of Management', type: 'Theory', credits: 3, sem: 2, tag: 'Winter' },
            { code: 'CB204', name: 'Data Structures Lab', type: 'Lab', credits: 2, sem: 2, tag: 'Winter' },
            { code: 'CB205', name: 'Design Thinking', type: 'Soft Skill', credits: 2, sem: 2, tag: 'Winter' },
            { code: 'CB301', name: 'Object Oriented Programming', type: 'Theory', credits: 4, sem: 3, tag: 'Fall' },
            { code: 'CB302', name: 'Discrete Mathematics', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'CB303', name: 'Database Management Systems', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'CB304', name: 'OOP Lab', type: 'Lab', credits: 2, sem: 3, tag: 'Fall' },
            { code: 'CB401', name: 'Operating Systems', type: 'Theory', credits: 4, sem: 4, tag: 'Winter' },
            { code: 'CB402', name: 'Computer Organization', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'CB403', name: 'Software Engineering', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'CB404', name: 'OS Lab', type: 'Lab', credits: 2, sem: 4, tag: 'Winter' },
            { code: 'CB501', name: 'Web Technologies', type: 'Theory', credits: 4, sem: 5, tag: 'Fall' },
            { code: 'CB502', name: 'Computer Networks', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'CB503', name: 'Enterprise Systems', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'CB504', name: 'Web Tech Lab', type: 'Lab', credits: 2, sem: 5, tag: 'Fall' },
            { code: 'CB601', name: 'Cloud Computing', type: 'Theory', credits: 4, sem: 6, tag: 'Winter' },
            { code: 'CB602', name: 'Data Analytics', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'CB603', name: 'Elective I', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'CB604', name: 'Cloud Lab', type: 'Lab', credits: 1, sem: 6, tag: 'Winter' },
            { code: 'CB701', name: 'IT Service Management', type: 'Theory', credits: 4, sem: 7, tag: 'Fall' },
            { code: 'CB702', name: 'Elective II', type: 'Theory', credits: 3, sem: 7, tag: 'Fall' },
            { code: 'CB703', name: 'Internship', type: 'Project', credits: 2, sem: 7, tag: 'Fall' },
            { code: 'CB801', name: 'Capstone Project', type: 'Project', credits: 12, sem: 8, tag: 'Winter' }
        ],
        "B.Tech – Computer Science and Engineering (Artificial Intelligence and Data Engineering)": [
            { code: 'CA101', name: 'Programming in Python', type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: 'CA102', name: 'Engineering Mathematics I', type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: 'CA103', name: 'Introduction to AI', type: 'Theory', credits: 3, sem: 1, tag: 'Fall' },
            { code: 'CA104', name: 'Python Lab', type: 'Lab', credits: 2, sem: 1, tag: 'Fall' },
            { code: 'CA105', name: 'Communication Skills', type: 'Soft Skill', credits: 2, sem: 1, tag: 'Fall' },
            { code: 'CA201', name: 'Data Structures', type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: 'CA202', name: 'Engineering Mathematics II', type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: 'CA203', name: 'Database Management Systems', type: 'Theory', credits: 3, sem: 2, tag: 'Winter' },
            { code: 'CA204', name: 'Data Structures Lab', type: 'Lab', credits: 2, sem: 2, tag: 'Winter' },
            { code: 'CA301', name: 'Linear Algebra', type: 'Theory', credits: 4, sem: 3, tag: 'Fall' },
            { code: 'CA302', name: 'Probability & Statistics', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'CA303', name: 'Object Oriented Programming', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'CA304', name: 'OOP Lab', type: 'Lab', credits: 2, sem: 3, tag: 'Fall' },
            { code: 'CA401', name: 'Machine Learning', type: 'Theory', credits: 4, sem: 4, tag: 'Winter' },
            { code: 'CA402', name: 'Computer Organization', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'CA403', name: 'Operating Systems', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'CA404', name: 'ML Lab', type: 'Lab', credits: 2, sem: 4, tag: 'Winter' },
            { code: 'CA501', name: 'Big Data Technologies', type: 'Theory', credits: 4, sem: 5, tag: 'Fall' },
            { code: 'CA502', name: 'Deep Learning', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'CA503', name: 'Computer Networks', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'CA504', name: 'Big Data Lab', type: 'Lab', credits: 2, sem: 5, tag: 'Fall' },
            { code: 'CA601', name: 'Data Warehousing', type: 'Theory', credits: 4, sem: 6, tag: 'Winter' },
            { code: 'CA602', name: 'Cloud Computing', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'CA603', name: 'Elective I', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'CA604', name: 'Cloud & ML Lab', type: 'Lab', credits: 1, sem: 6, tag: 'Winter' },
            { code: 'CA701', name: 'MLOps', type: 'Theory', credits: 4, sem: 7, tag: 'Fall' },
            { code: 'CA702', name: 'Elective II', type: 'Theory', credits: 3, sem: 7, tag: 'Fall' },
            { code: 'CA703', name: 'Internship', type: 'Project', credits: 2, sem: 7, tag: 'Fall' },
            { code: 'CA801', name: 'Major Project', type: 'Project', credits: 12, sem: 8, tag: 'Winter' }
        ],
        "B.Tech – Electronics and Communication Engineering": [
            { code: 'EC101', name: 'Circuit Theory', type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: 'EC102', name: 'Engineering Mathematics I', type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: 'EC103', name: 'Physics for ECE', type: 'Theory', credits: 3, sem: 1, tag: 'Fall' },
            { code: 'EC104', name: 'Basic Electronics Lab', type: 'Lab', credits: 1, sem: 1, tag: 'Fall' },
            { code: 'EC105', name: 'Communication Skills', type: 'Soft Skill', credits: 2, sem: 1, tag: 'Fall' },
            { code: 'EC201', name: 'Digital Logic Design', type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: 'EC202', name: 'Engineering Mathematics II', type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: 'EC203', name: 'Signals & Systems', type: 'Theory', credits: 3, sem: 2, tag: 'Winter' },
            { code: 'EC204', name: 'Digital Lab', type: 'Lab', credits: 1, sem: 2, tag: 'Winter' },
            { code: 'EC301', name: 'Analog Electronics', type: 'Theory', credits: 4, sem: 3, tag: 'Fall' },
            { code: 'EC302', name: 'Network Analysis', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'EC303', name: 'Microprocessors', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'EC304', name: 'Analog Lab', type: 'Lab', credits: 1, sem: 3, tag: 'Fall' },
            { code: 'EC401', name: 'Control Systems', type: 'Theory', credits: 4, sem: 4, tag: 'Winter' },
            { code: 'EC402', name: 'Communication Systems I', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'EC403', name: 'Electromagnetic Fields', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'EC404', name: 'Microprocessor Lab', type: 'Lab', credits: 1, sem: 4, tag: 'Winter' },
            { code: 'EC501', name: 'Communication Systems II', type: 'Theory', credits: 4, sem: 5, tag: 'Fall' },
            { code: 'EC502', name: 'VLSI Design', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'EC503', name: 'Embedded Systems', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'EC504', name: 'VLSI Lab', type: 'Lab', credits: 1, sem: 5, tag: 'Fall' },
            { code: 'EC601', name: 'Digital Signal Processing', type: 'Theory', credits: 4, sem: 6, tag: 'Winter' },
            { code: 'EC602', name: 'Antennas & Wave Propagation', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'EC603', name: 'Elective I', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'EC604', name: 'DSP Lab', type: 'Lab', credits: 1, sem: 6, tag: 'Winter' },
            { code: 'EC701', name: 'Wireless Communication', type: 'Theory', credits: 4, sem: 7, tag: 'Fall' },
            { code: 'EC702', name: 'Elective II', type: 'Theory', credits: 3, sem: 7, tag: 'Fall' },
            { code: 'EC703', name: 'Internship', type: 'Project', credits: 2, sem: 7, tag: 'Fall' },
            { code: 'EC801', name: 'Major Project', type: 'Project', credits: 12, sem: 8, tag: 'Winter' }
        ],
        "B.Tech – Information Technology": [
            { code: 'IT101', name: 'Programming in Python', type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: 'IT102', name: 'Engineering Mathematics I', type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: 'IT103', name: 'Digital Logic Fundamentals', type: 'Theory', credits: 3, sem: 1, tag: 'Fall' },
            { code: 'IT104', name: 'Python Lab', type: 'Lab', credits: 2, sem: 1, tag: 'Fall' },
            { code: 'IT105', name: 'Communication Skills', type: 'Soft Skill', credits: 2, sem: 1, tag: 'Fall' },
            { code: 'IT201', name: 'Data Structures', type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: 'IT202', name: 'Engineering Mathematics II', type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: 'IT203', name: 'Computer Organization', type: 'Theory', credits: 3, sem: 2, tag: 'Winter' },
            { code: 'IT204', name: 'Data Structures Lab', type: 'Lab', credits: 2, sem: 2, tag: 'Winter' },
            { code: 'IT301', name: 'Object Oriented Programming', type: 'Theory', credits: 4, sem: 3, tag: 'Fall' },
            { code: 'IT302', name: 'Database Management Systems', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'IT303', name: 'Discrete Mathematics', type: 'Theory', credits: 3, sem: 3, tag: 'Fall' },
            { code: 'IT304', name: 'OOP Lab', type: 'Lab', credits: 2, sem: 3, tag: 'Fall' },
            { code: 'IT401', name: 'Operating Systems', type: 'Theory', credits: 4, sem: 4, tag: 'Winter' },
            { code: 'IT402', name: 'Computer Networks', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'IT403', name: 'Software Engineering', type: 'Theory', credits: 3, sem: 4, tag: 'Winter' },
            { code: 'IT404', name: 'OS Lab', type: 'Lab', credits: 2, sem: 4, tag: 'Winter' },
            { code: 'IT501', name: 'Web Technologies', type: 'Theory', credits: 4, sem: 5, tag: 'Fall' },
            { code: 'IT502', name: 'Cloud Computing', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'IT503', name: 'Cyber Security', type: 'Theory', credits: 3, sem: 5, tag: 'Fall' },
            { code: 'IT504', name: 'Web Tech Lab', type: 'Lab', credits: 2, sem: 5, tag: 'Fall' },
            { code: 'IT601', name: 'Mobile Application Development', type: 'Theory', credits: 4, sem: 6, tag: 'Winter' },
            { code: 'IT602', name: 'Big Data Analytics', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'IT603', name: 'Elective I', type: 'Theory', credits: 3, sem: 6, tag: 'Winter' },
            { code: 'IT604', name: 'Mobile App Lab', type: 'Lab', credits: 1, sem: 6, tag: 'Winter' },
            { code: 'IT701', name: 'DevOps', type: 'Theory', credits: 4, sem: 7, tag: 'Fall' },
            { code: 'IT702', name: 'Elective II', type: 'Theory', credits: 3, sem: 7, tag: 'Fall' },
            { code: 'IT703', name: 'Internship', type: 'Project', credits: 2, sem: 7, tag: 'Fall' },
            { code: 'IT801', name: 'Major Project', type: 'Project', credits: 12, sem: 8, tag: 'Winter' }
        ]
    };

    // Helper to generate realistic subjects for other programmes
    const getSubjectsForProgramme = (programmeName) => {
        if (specificSubjectsMap[programmeName]) {
            return specificSubjectsMap[programmeName];
        }
        const prefix = programmeName.split(' ').map(w => w[0]).join('').replace(/[^A-Z]/g, '').substring(0, 3);
        return [
            { code: `${prefix}101`, name: `Introduction to ${programmeName.split('–').pop().trim()}`, type: 'Theory', credits: 4, sem: 1, tag: 'Fall' },
            { code: `${prefix}102`, name: 'Technical Communication', type: 'Soft Skill', credits: 2, sem: 1, tag: 'Fall' },
            { code: `${prefix}101L`, name: 'Introductory Lab', type: 'Lab', credits: 2, sem: 1, tag: 'Fall' },
            { code: `${prefix}201`, name: `Advanced ${programmeName.split('–').pop().trim()} Concepts`, type: 'Theory', credits: 4, sem: 2, tag: 'Winter' },
            { code: `${prefix}201L`, name: 'Advanced Practical Lab', type: 'Lab', credits: 2, sem: 2, tag: 'Winter' }
        ];
    };



    for (const [category, programmes] of Object.entries(seedData)) {
        for (const progName of programmes) {
            const slug = generateSlug(progName);

            // Upsert Programme with slug
            let prog = await db.get('SELECT id FROM programmes WHERE name = ?', [progName]);
            if (!prog) {
                const res = await db.run(
                    'INSERT INTO programmes (name, category, slug) VALUES (?, ?, ?)',
                    [progName, category, slug]
                );
                prog = { id: res.lastID };
            } else {
                // Update existing programme with slug if missing
                await db.run('UPDATE programmes SET slug = ? WHERE id = ?', [slug, prog.id]);
            }

            // Seed Subjects
            const subs = getSubjectsForProgramme(progName);
            for (const s of subs) {
                await db.run(`
                    INSERT INTO subjects 
                    (code, name, type, credits, semesterNumber, semesterTag, programmeId, programmeSlug) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(code, programmeSlug) DO UPDATE SET
                    name=excluded.name, type=excluded.type, credits=excluded.credits, 
                    semesterNumber=excluded.semesterNumber, semesterTag=excluded.semesterTag, 
                    programmeId=excluded.programmeId
                `, [s.code, s.name, s.type, s.credits, s.sem, s.tag, prog.id, slug]);

                // For legacy compatibility, we might want to ensure code uniqueness if we rely on it elsewhere.
                // But the requirement says "No duplicate course codes within the same programme".
                // The DB constraint was previously UNIQUE on code globally. I removed it in the table def above.
                // To be safe and prevent duplicates for the *same* programme, we should use a composite key or just logic.
                // For now, I'm using INSERT with ON CONFLICT DO UPDATE if strictly on code, but wait...
                // If I removed UNIQUE on code, ON CONFLICT(code) will fail unless I add a unique index on code.
                // Let's add a unique index on (programmeSlug, code) to strictly enforce the rule.
            }
        }
    }


    // ... existing code ...
    console.log('Database seeding completed successfully.');
    return db;
}

// Helper to seed sample tasks for a user
export const seedUserTasks = async (db, userId, programmeSlug) => {
    // Get some subjects for this user's programme (e.g., Semester 1)
    try {
        const subjects = await db.all(
            `SELECT code, name FROM subjects WHERE programmeSlug = ? AND semesterNumber = 1 LIMIT 3`,
            [programmeSlug]
        );

        if (subjects.length > 0) {
            // Create a mix of tasks
            const today = new Date();
            const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

            const tasks = [
                {
                    subjectCode: subjects[0].code,
                    title: `Complete ${subjects[0].name} Assignment`,
                    type: 'assignment',
                    dueDate: tomorrow.toISOString(),
                    estimatedMinutes: 60,
                    priority: 'high'
                },
                {
                    subjectCode: subjects[1].code,
                    title: `${subjects[1].name} Mid-term Exam`,
                    type: 'exam',
                    dueDate: nextWeek.toISOString(),
                    estimatedMinutes: 120,
                    priority: 'high'
                },
                {
                    subjectCode: subjects[0].code,
                    title: `Read Chapter 4 of ${subjects[0].name}`,
                    type: 'study',
                    dueDate: today.toISOString(),
                    estimatedMinutes: 45,
                    priority: 'medium'
                }
            ];

            const stmt = await db.prepare(`INSERT INTO tasks (userId, subjectCode, title, type, dueDate, estimatedMinutes, priority) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            for (const task of tasks) {
                await stmt.run(userId, task.subjectCode, task.title, task.type, task.dueDate, task.estimatedMinutes, task.priority);
            }
            await stmt.finalize();
            console.log(`Seeded ${tasks.length} tasks for user ${userId}`);
        }
    } catch (err) {
        console.error('Error seeding tasks:', err);
    }
};
