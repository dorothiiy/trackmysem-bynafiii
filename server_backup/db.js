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
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      credits INTEGER NOT NULL,
      semester TEXT NOT NULL,
      programme TEXT NOT NULL
    );
  `);

    // Seed subjects
    // We'll check for each programme to ensure we don't double seed if some exist
    const seedProgrammes = async (programmeName, subjects) => {
        const existing = await db.get('SELECT id FROM subjects WHERE programme = ? LIMIT 1', [programmeName]);
        if (!existing) {
            const stmt = await db.prepare('INSERT INTO subjects (code, name, type, credits, semester, programme) VALUES (?, ?, ?, ?, ?, ?)');
            for (const sub of subjects) {
                await stmt.run([...sub, programmeName]);
            }
            await stmt.finalize();
            console.log(`Seeded subjects for ${programmeName}`);
        }
    };

    // BCA Subjects
    await seedProgrammes('B.C.A', [
        ['BCA1001', 'Introduction to Programming', 'Theory', 4, 'Fall 2025–26'],
        ['BCA1002', 'Mathematics for Computer Science', 'Theory', 4, 'Fall 2025–26'],
        ['BCA1003', 'Programming Lab', 'Lab', 2, 'Fall 2025–26'],
        ['BCA1004', 'Communication Skills', 'Soft Skill', 2, 'Fall 2025–26'],
        ['BCA2001', 'Data Structures & Algorithms', 'Theory', 4, 'Winter 2025–26'],
        ['BCA2002', 'Computer Networks', 'Theory', 4, 'Winter 2025–26'],
        ['BCA2003', 'DSA Lab', 'Lab', 2, 'Winter 2025–26'],
        ['BCA2004', 'Ethics in IT', 'Soft Skill', 2, 'Winter 2025–26'],
    ]);

    // Mechanical Engineering
    await seedProgrammes('B.Tech – Mechanical Engineering', [
        ['ME101', 'Engineering Mechanics', 'Theory', 4, 'Fall 2025–26'],
        ['ME102', 'Thermodynamics', 'Theory', 3, 'Fall 2025–26'],
        ['ME103', 'Manufacturing Processes', 'Theory', 3, 'Fall 2025–26'],
        ['ME104', 'Workshop Practice', 'Lab', 1, 'Fall 2025–26'],
        ['ME105', 'Professional Communication', 'Soft Skill', 2, 'Fall 2025–26'],
        ['ME201', 'Strength of Materials', 'Theory', 4, 'Winter 2025–26'],
        ['ME202', 'Fluid Mechanics', 'Theory', 3, 'Winter 2025–26'],
        ['ME203', 'Machine Design', 'Theory', 3, 'Winter 2025–26'],
        ['ME204', 'CAD Lab', 'Lab', 1, 'Winter 2025–26'],
        ['ME205', 'Environmental Studies', 'Soft Skill', 2, 'Winter 2025–26'],
    ]);

    // Chemical Engineering
    await seedProgrammes('B.Tech – Chemical Engineering', [
        ['CH101', 'Engineering Mathematics I', 'Theory', 4, 'Sem 1'],
        ['CH102', 'Engineering Chemistry', 'Theory', 3, 'Sem 1'],
        ['CH103', 'Physics for Chemical Engineers', 'Theory', 3, 'Sem 1'],
        ['CH104', 'Engineering Drawing', 'Lab', 1, 'Sem 1'],
        ['CH105', 'Chemistry Lab', 'Lab', 1, 'Sem 1'],
        ['CH106', 'Professional Communication', 'Soft Skill', 2, 'Sem 1'],
        ['CH201', 'Engineering Mathematics II', 'Theory', 4, 'Sem 2'],
        ['CH202', 'Material Science', 'Theory', 3, 'Sem 2'],
        ['CH203', 'Chemical Process Calculations', 'Theory', 3, 'Sem 2'],
        ['CH204', 'Physics Lab', 'Lab', 1, 'Sem 2'],
        ['CH205', 'Organic Chemistry Lab', 'Lab', 1, 'Sem 2'],
        ['CH206', 'Problem Solving & Critical Thinking', 'Soft Skill', 2, 'Sem 2'],
        ['CH301', 'Fluid Mechanics', 'Theory', 4, 'Sem 3'],
        ['CH302', 'Chemical Engineering Thermodynamics I', 'Theory', 3, 'Sem 3'],
        ['CH303', 'Heat Transfer', 'Theory', 3, 'Sem 3'],
        ['CH304', 'Mechanical Operations', 'Theory', 3, 'Sem 3'],
        ['CH305', 'Fluid Mechanics Lab', 'Lab', 1, 'Sem 3'],
        ['CH401', 'Mass Transfer I', 'Theory', 4, 'Sem 4'],
        ['CH402', 'Chemical Engineering Thermodynamics II', 'Theory', 3, 'Sem 4'],
        ['CH403', 'Process Instrumentation', 'Theory', 3, 'Sem 4'],
        ['CH404', 'Numerical Methods', 'Theory', 3, 'Sem 4'],
        ['CH405', 'Heat & Mass Transfer Lab', 'Lab', 1, 'Sem 4'],
        ['CH501', 'Chemical Reaction Engineering I', 'Theory', 4, 'Sem 5'],
        ['CH502', 'Process Control', 'Theory', 3, 'Sem 5'],
        ['CH503', 'Mass Transfer II', 'Theory', 3, 'Sem 5'],
        ['CH504', 'Environmental Engineering', 'Theory', 3, 'Sem 5'],
        ['CH505', 'Reaction Engineering Lab', 'Lab', 1, 'Sem 5'],
        ['CH601', 'Chemical Reaction Engineering II', 'Theory', 4, 'Sem 6'],
        ['CH602', 'Process Equipment Design', 'Theory', 3, 'Sem 6'],
        ['CH603', 'Separation Processes', 'Theory', 3, 'Sem 6'],
        ['CH604', 'Elective I', 'Theory', 3, 'Sem 6'],
        ['CH605', 'Process Control Lab', 'Lab', 1, 'Sem 6'],
        ['CH701', 'Chemical Plant Design & Economics', 'Theory', 4, 'Sem 7'],
        ['CH702', 'Safety & Hazard Analysis', 'Theory', 3, 'Sem 7'],
        ['CH703', 'Elective II', 'Theory', 3, 'Sem 7'],
        ['CH704', 'Internship / Industrial Training', 'Project', 2, 'Sem 7'],
        ['CH801', 'Major Project', 'Project', 12, 'Sem 8'],
    ]);

    // Civil Engineering
    await seedProgrammes('B.Tech – Civil Engineering', [
        ['CE101', 'Engineering Mathematics I', 'Theory', 4, 'Sem 1'],
        ['CE102', 'Physics for Civil Engineers', 'Theory', 4, 'Sem 1'],
        ['CE103', 'Basic Civil Engineering', 'Theory', 3, 'Sem 1'],
        ['CE104', 'Engineering Drawing Lab', 'Lab', 1, 'Sem 1'],
        ['CE105', 'Physics Lab', 'Lab', 1, 'Sem 1'],
        ['CE106', 'Communication Skills', 'Soft Skill', 2, 'Sem 1'],
        ['CE201', 'Engineering Mathematics II', 'Theory', 4, 'Sem 2'],
        ['CE202', 'Engineering Mechanics', 'Theory', 4, 'Sem 2'],
        ['CE203', 'Building Materials', 'Theory', 3, 'Sem 2'],
        ['CE204', 'Surveying Lab', 'Lab', 1, 'Sem 2'],
        ['CE205', 'CAD Lab', 'Lab', 1, 'Sem 2'],
        ['CE206', 'Environmental Studies', 'Soft Skill', 2, 'Sem 2'],
        ['CE301', 'Strength of Materials', 'Theory', 4, 'Sem 3'],
        ['CE302', 'Fluid Mechanics', 'Theory', 4, 'Sem 3'],
        ['CE303', 'Structural Analysis I', 'Theory', 3, 'Sem 3'],
        ['CE304', 'Concrete Technology', 'Theory', 3, 'Sem 3'],
        ['CE305', 'Materials Testing Lab', 'Lab', 1, 'Sem 3'],
        ['CE401', 'Structural Analysis II', 'Theory', 4, 'Sem 4'],
        ['CE402', 'Geotechnical Engineering I', 'Theory', 4, 'Sem 4'],
        ['CE403', 'Hydrology', 'Theory', 3, 'Sem 4'],
        ['CE404', 'Transportation Engineering I', 'Theory', 3, 'Sem 4'],
        ['CE405', 'Geotechnical Lab', 'Lab', 1, 'Sem 4'],
        ['CE501', 'Design of RC Structures I', 'Theory', 4, 'Sem 5'],
        ['CE502', 'Geotechnical Engineering II', 'Theory', 4, 'Sem 5'],
        ['CE503', 'Environmental Engineering I', 'Theory', 3, 'Sem 5'],
        ['CE504', 'Transportation Engineering II', 'Theory', 3, 'Sem 5'],
        ['CE505', 'Environmental Engineering Lab', 'Lab', 1, 'Sem 5'],
        ['CE601', 'Design of RC Structures II', 'Theory', 4, 'Sem 6'],
        ['CE602', 'Environmental Engineering II', 'Theory', 4, 'Sem 6'],
        ['CE603', 'Water Resources Engineering', 'Theory', 3, 'Sem 6'],
        ['CE604', 'Elective I', 'Theory', 3, 'Sem 6'],
        ['CE605', 'Structural Design Lab', 'Lab', 1, 'Sem 6'],
        ['CE701', 'Design of Steel Structures', 'Theory', 4, 'Sem 7'],
        ['CE702', 'Construction Planning & Management', 'Theory', 4, 'Sem 7'],
        ['CE703', 'Elective II', 'Theory', 3, 'Sem 7'],
        ['CE704', 'Internship', 'Project', 2, 'Sem 7'],
        ['CE801', 'Major Project', 'Project', 12, 'Sem 8'],
    ]);

    // CSE & Business Systems (TCS)
    await seedProgrammes('B.Tech – Computer Science and Engineering and Business Systems (TCS collaboration)', [
        ['CB101', 'Programming in Python', 'Theory', 4, 'Sem 1'],
        ['CB102', 'Engineering Mathematics I', 'Theory', 4, 'Sem 1'],
        ['CB103', 'Accounting & Financial Analysis', 'Theory', 3, 'Sem 1'],
        ['CB104', 'Python Lab', 'Lab', 1, 'Sem 1'],
        ['CB105', 'Business Communication', 'Soft Skill', 2, 'Sem 1'],
        ['CB201', 'Data Structures', 'Theory', 4, 'Sem 2'],
        ['CB202', 'Engineering Mathematics II', 'Theory', 4, 'Sem 2'],
        ['CB203', 'Principles of Management', 'Theory', 3, 'Sem 2'],
        ['CB204', 'Data Structures Lab', 'Lab', 1, 'Sem 2'],
        ['CB205', 'Design Thinking', 'Soft Skill', 2, 'Sem 2'],
        ['CB301', 'Object Oriented Programming', 'Theory', 4, 'Sem 3'],
        ['CB302', 'Discrete Mathematics', 'Theory', 4, 'Sem 3'],
        ['CB303', 'Database Management Systems', 'Theory', 3, 'Sem 3'],
        ['CB304', 'OOP Lab', 'Lab', 1, 'Sem 3'],
        ['CB401', 'Operating Systems', 'Theory', 4, 'Sem 4'],
        ['CB402', 'Computer Organization', 'Theory', 4, 'Sem 4'],
        ['CB403', 'Software Engineering', 'Theory', 3, 'Sem 4'],
        ['CB404', 'OS Lab', 'Lab', 1, 'Sem 4'],
        ['CB501', 'Web Technologies', 'Theory', 4, 'Sem 5'],
        ['CB502', 'Computer Networks', 'Theory', 4, 'Sem 5'],
        ['CB503', 'Enterprise Systems', 'Theory', 3, 'Sem 5'],
        ['CB504', 'Web Tech Lab', 'Lab', 1, 'Sem 5'],
        ['CB601', 'Cloud Computing', 'Theory', 4, 'Sem 6'],
        ['CB602', 'Data Analytics', 'Theory', 4, 'Sem 6'],
        ['CB603', 'Elective I', 'Theory', 3, 'Sem 6'],
        ['CB604', 'Cloud Lab', 'Lab', 1, 'Sem 6'],
        ['CB701', 'IT Service Management', 'Theory', 4, 'Sem 7'],
        ['CB702', 'Elective II', 'Theory', 3, 'Sem 7'],
        ['CB703', 'Internship', 'Project', 2, 'Sem 7'],
        ['CB801', 'Capstone Project', 'Project', 12, 'Sem 8'],
    ]);

    // CSE (AI & Data Engineering)
    await seedProgrammes('B.Tech – Computer Science and Engineering (Artificial Intelligence and Data Engineering)', [
        ['CA101', 'Programming in Python', 'Theory', 4, 'Sem 1'],
        ['CA102', 'Engineering Mathematics I', 'Theory', 4, 'Sem 1'],
        ['CA103', 'Introduction to AI', 'Theory', 3, 'Sem 1'],
        ['CA104', 'Python Lab', 'Lab', 1, 'Sem 1'],
        ['CA105', 'Communication Skills', 'Soft Skill', 2, 'Sem 1'],
        ['CA201', 'Data Structures', 'Theory', 4, 'Sem 2'],
        ['CA202', 'Engineering Mathematics II', 'Theory', 4, 'Sem 2'],
        ['CA203', 'Database Management Systems', 'Theory', 3, 'Sem 2'],
        ['CA204', 'Data Structures Lab', 'Lab', 1, 'Sem 2'],
        ['CA301', 'Linear Algebra', 'Theory', 4, 'Sem 3'],
        ['CA302', 'Probability & Statistics', 'Theory', 4, 'Sem 3'],
        ['CA303', 'Object Oriented Programming', 'Theory', 4, 'Sem 3'],
        ['CA304', 'OOP Lab', 'Lab', 1, 'Sem 3'],
        ['CA401', 'Machine Learning', 'Theory', 4, 'Sem 4'],
        ['CA402', 'Computer Organization', 'Theory', 4, 'Sem 4'],
        ['CA403', 'Operating Systems', 'Theory', 4, 'Sem 4'],
        ['CA404', 'ML Lab', 'Lab', 1, 'Sem 4'],
        ['CA501', 'Big Data Technologies', 'Theory', 4, 'Sem 5'],
        ['CA502', 'Deep Learning', 'Theory', 4, 'Sem 5'],
        ['CA503', 'Computer Networks', 'Theory', 4, 'Sem 5'],
        ['CA504', 'Big Data Lab', 'Lab', 1, 'Sem 5'],
        ['CA601', 'Data Warehousing', 'Theory', 4, 'Sem 6'],
        ['CA602', 'Cloud Computing', 'Theory', 4, 'Sem 6'],
        ['CA603', 'Elective I', 'Theory', 3, 'Sem 6'],
        ['CA604', 'Cloud & ML Lab', 'Lab', 1, 'Sem 6'],
        ['CA701', 'MLOps', 'Theory', 4, 'Sem 7'],
        ['CA702', 'Elective II', 'Theory', 3, 'Sem 7'],
        ['CA703', 'Internship', 'Project', 2, 'Sem 7'],
        ['CA801', 'Major Project', 'Project', 12, 'Sem 8'],
    ]);

    // ECE
    await seedProgrammes('B.Tech – Electronics and Communication Engineering', [
        ['EC101', 'Circuit Theory', 'Theory', 4, 'Sem 1'],
        ['EC102', 'Engineering Mathematics I', 'Theory', 4, 'Sem 1'],
        ['EC103', 'Physics for ECE', 'Theory', 3, 'Sem 1'],
        ['EC104', 'Basic Electronics Lab', 'Lab', 1, 'Sem 1'],
        ['EC105', 'Communication Skills', 'Soft Skill', 2, 'Sem 1'],
        ['EC201', 'Digital Logic Design', 'Theory', 4, 'Sem 2'],
        ['EC202', 'Engineering Mathematics II', 'Theory', 4, 'Sem 2'],
        ['EC203', 'Signals & Systems', 'Theory', 3, 'Sem 2'],
        ['EC204', 'Digital Lab', 'Lab', 1, 'Sem 2'],
        ['EC301', 'Analog Electronics', 'Theory', 4, 'Sem 3'],
        ['EC302', 'Network Analysis', 'Theory', 4, 'Sem 3'],
        ['EC303', 'Microprocessors', 'Theory', 3, 'Sem 3'],
        ['EC304', 'Analog Lab', 'Lab', 1, 'Sem 3'],
        ['EC401', 'Control Systems', 'Theory', 4, 'Sem 4'],
        ['EC402', 'Communication Systems I', 'Theory', 4, 'Sem 4'],
        ['EC403', 'Electromagnetic Fields', 'Theory', 3, 'Sem 4'],
        ['EC404', 'Microprocessor Lab', 'Lab', 1, 'Sem 4'],
        ['EC501', 'Communication Systems II', 'Theory', 4, 'Sem 5'],
        ['EC502', 'VLSI Design', 'Theory', 4, 'Sem 5'],
        ['EC503', 'Embedded Systems', 'Theory', 3, 'Sem 5'],
        ['EC504', 'VLSI Lab', 'Lab', 1, 'Sem 5'],
        ['EC601', 'Digital Signal Processing', 'Theory', 4, 'Sem 6'],
        ['EC602', 'Antennas & Wave Propagation', 'Theory', 4, 'Sem 6'],
        ['EC603', 'Elective I', 'Theory', 3, 'Sem 6'],
        ['EC604', 'DSP Lab', 'Lab', 1, 'Sem 6'],
        ['EC701', 'Wireless Communication', 'Theory', 4, 'Sem 7'],
        ['EC702', 'Elective II', 'Theory', 3, 'Sem 7'],
        ['EC703', 'Internship', 'Project', 2, 'Sem 7'],
        ['EC801', 'Major Project', 'Project', 12, 'Sem 8'],
    ]);

    // IT
    await seedProgrammes('B.Tech – Information Technology', [
        ['IT101', 'Programming in Python', 'Theory', 4, 'Sem 1'],
        ['IT102', 'Engineering Mathematics I', 'Theory', 4, 'Sem 1'],
        ['IT103', 'Digital Logic Fundamentals', 'Theory', 3, 'Sem 1'],
        ['IT104', 'Python Lab', 'Lab', 1, 'Sem 1'],
        ['IT105', 'Communication Skills', 'Soft Skill', 2, 'Sem 1'],
        ['IT201', 'Data Structures', 'Theory', 4, 'Sem 2'],
        ['IT202', 'Engineering Mathematics II', 'Theory', 4, 'Sem 2'],
        ['IT203', 'Computer Organization', 'Theory', 3, 'Sem 2'],
        ['IT204', 'Data Structures Lab', 'Lab', 1, 'Sem 2'],
        ['IT301', 'Object Oriented Programming', 'Theory', 4, 'Sem 3'],
        ['IT302', 'Database Management Systems', 'Theory', 4, 'Sem 3'],
        ['IT303', 'Discrete Mathematics', 'Theory', 3, 'Sem 3'],
        ['IT304', 'OOP Lab', 'Lab', 1, 'Sem 3'],
        ['IT401', 'Operating Systems', 'Theory', 4, 'Sem 4'],
        ['IT402', 'Computer Networks', 'Theory', 4, 'Sem 4'],
        ['IT403', 'Software Engineering', 'Theory', 3, 'Sem 4'],
        ['IT404', 'OS Lab', 'Lab', 1, 'Sem 4'],
        ['IT501', 'Web Technologies', 'Theory', 4, 'Sem 5'],
        ['IT502', 'Cloud Computing', 'Theory', 4, 'Sem 5'],
        ['IT503', 'Cyber Security', 'Theory', 3, 'Sem 5'],
        ['IT504', 'Web Tech Lab', 'Lab', 1, 'Sem 5'],
        ['IT601', 'Mobile Application Development', 'Theory', 4, 'Sem 6'],
        ['IT602', 'Big Data Analytics', 'Theory', 4, 'Sem 6'],
        ['IT603', 'Elective I', 'Theory', 3, 'Sem 6'],
        ['IT604', 'Mobile App Lab', 'Lab', 1, 'Sem 6'],
        ['IT701', 'DevOps', 'Theory', 4, 'Sem 7'],
        ['IT702', 'Elective II', 'Theory', 3, 'Sem 7'],
        ['IT703', 'Internship', 'Project', 2, 'Sem 7'],
        ['IT801', 'Major Project', 'Project', 12, 'Sem 8'],
    ]);

    return db;
}
