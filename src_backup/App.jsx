import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, LogIn, UserPlus, ArrowRight, Layout, Calendar,
  TrendingUp, ChevronLeft, ChevronRight, Check, Search, Filter,
  Bell, Settings, LogOut, BookOpen, Clock, ChevronDown,
  ChevronUp, AlertCircle, X
} from 'lucide-react';

// --- API UTILS ---
const API_URL = 'http://localhost:5001/api';

const api = {
  post: async (endpoint, data, token) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Request failed');
    return result;
  },
  get: async (endpoint, token) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Request failed');
    return result;
  }
};

// --- COMPONENTS ---

const Navbar = ({ onAuthClick }) => (
  <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => onAuthClick(null)}>
      <div style={{ background: 'var(--accent-blue)', padding: '8px', borderRadius: '12px', color: 'white' }}>
        <GraduationCap size={24} />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>TrackMySem</h2>
    </div>
    <div style={{ display: 'flex', gap: '16px' }}>
      <button className="btn btn-secondary" onClick={() => onAuthClick('login')}>Log In</button>
      <button className="btn btn-primary" onClick={() => onAuthClick('register')}>Create Account</button>
    </div>
  </nav>
);

const Feature = ({ icon: Icon, title, desc }) => (
  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
    <div style={{ background: 'white', padding: '12px', borderRadius: '16px', color: 'var(--accent-blue)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Icon size={24} />
    </div>
    <div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{title}</h3>
      <p style={{ fontSize: '0.95rem' }}>{desc}</p>
    </div>
  </div>
);

const Toast = ({ message, type = 'success', onClose }) => (
  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="toast" style={{ background: type === 'error' ? '#ef4444' : '#1e293b' }}>
    {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
    <span>{message}</span>
    <X size={16} style={{ cursor: 'pointer', marginLeft: '12px' }} onClick={onClose} />
  </motion.div>
);

// --- MAIN APP ---

const courseDataMock = {
  'Engineering Programmes': [
    'B.Tech – Biotechnology', 'B.Tech – Chemical Engineering', 'B.Tech – Civil Engineering',
    'B.Tech – Computer Science and Engineering and Business Systems (TCS collaboration)',
    'B.Tech – Computer Science and Engineering (Artificial Intelligence and Data Engineering)',
    'B.Tech – Electronics and Communication Engineering', 'B.Tech – Information Technology',
    'B.Tech – Mechanical Engineering'
  ],
  'UG Programmes': [
    'B.Des', 'B.Arch', 'B.Sc. (Hons.) Agriculture', 'B.Sc. Hospitality and Hotel Administration',
    'B.Sc. Computer Science', 'B.Sc. Multimedia & Animation', 'B.Sc. Visual Communication',
    'B.B.A', 'BBA (Financial Analytics) 2+2 Collaborative Degree', 'B.Com',
    'B.Com – Business Process Services', 'B.Com – Banking and Capital Markets',
    'B.Com – Financial Technology', 'B.C.A'
  ],
  'Integrated Programmes': [
    'Integrated M.Tech. Software Engineering', 'Integrated M.Tech. CSE (Virtusa collaboration)',
    'Integrated M.Tech. CSE (Data Science)', 'Integrated M.Sc. Biotechnology (5 Year)',
    'Integrated M.Sc. Food Science and Technology (5 Year)',
    'Integrated M.Sc. Computational Statistics and Data Analytics (5 Year)',
    'Integrated M.Sc. Physics (5 Year) with exit options',
    'Integrated M.Sc. Chemistry (5 Year) with exit options',
    'Integrated M.Sc. Mathematics (5 Year) with exit options'
  ]
};

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register', 'dashboard'
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Registration flow
  const [regStep, setRegStep] = useState(1);
  const [regData, setRegData] = useState({ name: '', email: '', password: '', programmeType: 'Engineering Programmes', courseName: null });

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Dashboard states
  const [dashboardView, setDashboardView] = useState('hub'); // 'subjects', 'hub'
  const [tasks, setTasks] = useState([
    { id: 1, text: 'DSA - Trees and Graphs', completed: false, priority: 'high', subject: 'Data Structures' },
    { id: 2, text: 'OS - Process Scheduling', completed: true, priority: 'medium', subject: 'Operating Systems' },
    { id: 3, text: 'DBMS - SQL Queries', completed: false, priority: 'low', subject: 'Databases' }
  ]);

  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [collapsedSemesters, setCollapsedSemesters] = useState({});
  const [toast, setToast] = useState(null);

  // Appearance states
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [density, setDensity] = useState(() => localStorage.getItem('density') || 'comfortable');

  const MAX_CREDITS = 24;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
    localStorage.setItem('density', density);
  }, [density]);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  useEffect(() => {
    let interval;
    if (isPomoRunning && pomoTime > 0) {
      interval = setInterval(() => setPomoTime(prev => prev - 1), 1000);
    } else if (pomoTime === 0) {
      setIsPomoRunning(false);
      setToast({ message: "Focus session complete! Take a break. ☕", type: 'success' });
      setTimeout(() => setToast(null), 3000);
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoTime]);

  const fetchProfile = async () => {
    try {
      const userData = await api.get('/auth/me', token);
      setUser(userData);
      setView('dashboard');
      fetchSubjects(token);
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const fetchSubjects = async (t) => {
    try {
      const data = await api.get('/subjects', t);
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setView('landing');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/auth/login', loginData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setToast({ message: 'Welcome back!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', regData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setToast({ message: 'Account created successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const totalSelectedCredits = useMemo(() => {
    return selectedSubjects.reduce((acc, subId) => {
      const sub = subjects.find(s => s.id === subId);
      return acc + (sub ? sub.credits : 0);
    }, 0);
  }, [selectedSubjects, subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(sub => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || sub.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'All' || sub.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterType, subjects]);

  const subjectsBySemester = useMemo(() => {
    return filteredSubjects.reduce((acc, sub) => {
      if (!acc[sub.semester]) acc[sub.semester] = [];
      acc[sub.semester].push(sub);
      return acc;
    }, {});
  }, [filteredSubjects]);

  const toggleSubject = (id, credits) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter(sid => sid !== id));
    } else {
      if (totalSelectedCredits + credits > MAX_CREDITS) {
        setToast({ message: "Maximum credit limit of 24 reached!", type: 'error' });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ProgressRing = ({ percentage, color = 'var(--accent-blue)', size = 60 }) => {
    const radius = size * 0.4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="progress-ring-container" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={color} strokeWidth="6"
            strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
            strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <span className="progress-ring-text">{percentage}%</span>
      </div>
    );
  };

  const renderLanding = () => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onAuthClick={(mode) => { setView(mode); setRegStep(1); }} />
      <main className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <AnimatePresence mode="wait">
          <motion.section key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '16px' }}>🚀 Smart Academic Tracking</motion.span>
                <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px' }}>Master Your <span style={{ color: 'var(--accent-blue)' }}>Semester</span> with Confidence.</h1>
                <p style={{ fontSize: '1.25rem', maxWidth: '540px' }}>Track grades, manage assignments, and visualize your progress. The all-in-one productivity companion built specifically for modern students.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <Feature icon={Layout} title="GPA Tracker" desc="Real-time calculation of your current and projected GPA." />
                <Feature icon={Calendar} title="Smart Planner" desc="Never miss a deadline with automated assignment reminders." />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button className="btn btn-primary" style={{ fontSize: '1.1rem' }} onClick={() => { setView('register'); setRegStep(1); }}>Get Started for Free</button>
                <button className="btn btn-secondary" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>View Demo <ArrowRight size={18} /></button>
              </div>
            </div>
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );

  const renderDashboardHub = () => (
    <div className="dashboard-grid">
      {/* Semester Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="widget-card" style={{ gridColumn: 'span 8', display: 'flex', gap: '32px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: '700', marginBottom: '8px' }}>
            <Calendar size={18} /> Current Semester
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Semester 3 – Fall 2025</h2>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Overall Progress</span>
            <span style={{ fontWeight: '700' }}>68%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))' }} />
          </div>
        </div>
        <button className="btn btn-secondary" style={{ padding: '12px 24px' }}>View Semester Plan</button>
      </motion.div>

      {/* Pomodoro Timer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="widget-card" style={{ gridColumn: 'span 4', textAlign: 'center' }}>
        <div className="widget-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Clock size={18} /> Focus Session
        </div>
        <div className="pomo-timer">{formatTime(pomoTime)}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => setIsPomoRunning(!isPomoRunning)} style={{ padding: '8px 24px' }}>
            {isPomoRunning ? 'Pause' : 'Start'}
          </button>
          <button className="btn btn-secondary" onClick={() => { setPomoTime(25 * 60); setIsPomoRunning(false); }} style={{ padding: '8px' }}>
            <Settings size={18} />
          </button>
        </div>
      </motion.div>

      {/* Today's Plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="widget-card" style={{ gridColumn: 'span 5' }}>
        <div className="widget-header">
          <div className="widget-title">Today's Plan</div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontWeight: '600', cursor: 'pointer' }}>+ Add Task</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.length > 0 ? tasks.map(task => (
            <div key={task.id} className="task-item" onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}>
              <div className={`task-checkbox ${task.completed ? 'checked' : ''}`}>
                {task.completed && <Check size={14} color="white" />}
              </div>
              <div className={`task-text ${task.completed ? 'completed' : ''}`}>
                {task.text}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{task.subject}</div>
              </div>
              <span className={`priority-tag priority-${task.priority}`}>{task.priority}</span>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
              No tasks today—nice work! 🎉
            </div>
          )}
        </div>
      </motion.div>

      {/* Weekly Study Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="widget-card" style={{ gridColumn: 'span 7' }}>
        <div className="widget-header">
          <div className="widget-title">Weekly Study Summary</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--warning)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
            5-day streak 🔥
          </div>
        </div>
        <div className="chart-bar-container">
          {[4, 6, 2, 8, 5, 0, 0].map((hours, i) => (
            <div key={i} className="chart-bar" style={{ height: `${(hours / 10) * 100}%`, opacity: i > 4 ? 0.2 : 1 }}>
              <div className="chart-label">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '32px', display: 'flex', gap: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <div><span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.1rem' }}>25</span> hours this week</div>
          <div style={{ color: 'var(--success)' }}>+12% vs last week</div>
        </div>
      </motion.div>

      {/* Subject Progress Rings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="widget-card" style={{ gridColumn: 'span 8' }}>
        <div className="widget-header">
          <div className="widget-title">Subject Progress</div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontWeight: '600', cursor: 'pointer' }}>Manage Subjects</button>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {subjects.slice(0, 3).map((sub, i) => (
            <div key={sub.id} className={`widget-card ${i === 0 ? 'learning-card-active' : ''}`} style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '16px', border: '1.5px solid var(--border-color)', boxShadow: 'none' }}>
              <ProgressRing percentage={[75, 42, 15][i]} color={['#0ea5e9', '#8b5cf6', '#10b981'][i]} size={50} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>{sub.code}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.2' }}>{sub.name}</div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontSize: '0.8rem', padding: 0, fontWeight: '700', cursor: 'pointer' }}>Continue Learning →</button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Smart Suggestions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="widget-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)' }}>
          <TrendingUp size={18} /> Smart Suggestions
        </div>
        <div style={{ background: 'var(--purple-soft)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
            <strong>Heads up!</strong> You're slightly behind in <em>{subjects[1]?.name || 'Mechanics'}</em>. Want to reschedule your target for this week?
          </p>
          <button className="btn btn-primary" style={{ marginTop: '12px', width: '100%', padding: '8px', fontSize: '0.85rem', background: 'var(--accent-purple)' }}>Yes, Reschedule</button>
        </div>
        <div style={{ background: 'var(--accent-soft)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
            Recommended: Watch <strong>Process Sync</strong> video lecture before tomorrow's lab.
          </p>
        </div>
      </motion.div>
    </div>
  );

  const renderProgressView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <header>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Progress Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track how far you've come and what to focus on next.</p>
      </header>

      <div className="dashboard-grid">
        {/* Overall Progress Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="widget-card" style={{ gridColumn: 'span 12', display: 'flex', alignItems: 'center', gap: '48px', background: 'var(--primary-bg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <ProgressRing percentage={68} size={150} color="var(--accent-blue)" />
            <span style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--accent-blue)' }}>Semester 3</span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>You're doing great, {user?.name}!</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '600px' }}>
              You have completed <strong>68%</strong> of your semester goals. Keep up the momentum to finish strong!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--accent-soft)', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Tasks Remaining</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-blue)' }}>12</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--purple-soft)', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Credits Earned</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-purple)' }}>18 / 24</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Current GPA</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>3.84</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Time Spent Analytics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="widget-card" style={{ gridColumn: 'span 7' }}>
          <div className="widget-header">
            <div className="widget-title">Study Hours Analytics</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '700', padding: '4px 12px', background: 'var(--accent-soft)', borderRadius: '20px' }}>+12% vs last week</span>
          </div>
          <div className="chart-bar-container" style={{ height: '180px', marginTop: '40px' }}>
            {[4.5, 6.2, 3.8, 8.5, 5.2, 2.1, 1.5].map((hours, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${(hours / 10) * 100}%` }}
                  className="chart-bar" style={{ width: '100%', borderRadius: '8px 8px 0 0', background: i === 3 ? 'var(--accent-blue)' : 'rgba(14, 165, 233, 0.3)' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '48px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Average study time: <strong>4.5 hours/day</strong>. Your peak productivity is on <strong>Thursday</strong>.
          </p>
        </motion.div>

        {/* Milestones & Streaks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="widget-card" style={{ gridColumn: 'span 5' }}>
          <div className="widget-header">
            <div className="widget-title">Milestones & Streaks</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--accent-soft)', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
            <div style={{ fontSize: '2.5rem' }}>🔥</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--warning)' }}>5-Day Streak</div>
              <div style={{ color: 'var(--text-muted)', fontWeight: '600' }}>You're on fire! Keep it up.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--accent-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                <BookOpen size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>100 Hours Studied</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bronze Scholar Achievement</div>
              </div>
              <Check size={20} color="var(--success)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--purple-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
                <TrendingUp size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>DSA Mastery</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed all Module 1 tasks</div>
              </div>
              <Check size={20} color="var(--success)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--bg-primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Semester Ace</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Finish with 4.0 GPA (In Progress)</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subject wise Progress Grid */}
        <div style={{ gridColumn: 'span 12' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', marginTop: '16px' }}>Subject-wise Progress</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {subjects.slice(0, 4).map((sub, i) => (
              <motion.div key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (i * 0.1) }} className="widget-card" style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                  <ProgressRing percentage={[75, 42, 15, 90][i % 4]} color={['#0ea5e9', '#8b5cf6', 'var(--success)', 'var(--warning)'][i % 4]} size={80} />
                </div>
                <div style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '4px' }}>{sub.code}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', minHeight: '40px', lineHeight: '1.3' }}>{sub.name}</div>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>Continue Learning</button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSemestersView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <header>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>My Semesters</h1>
        <p style={{ color: 'var(--text-muted)' }}>Your academic journey, one semester at a time.</p>
      </header>

      <div className="dashboard-grid">
        {/* Semester Timeline / Grid */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
          const isActive = semNum === 3;
          const isCompleted = semNum < 3;
          const isFuture = semNum > 3;

          return (
            <motion.div
              key={semNum}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: semNum * 0.05 }}
              className={`widget-card ${isActive ? 'learning-card-active' : ''}`}
              style={{
                gridColumn: 'span 4',
                border: isActive ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                boxShadow: isActive ? '0 10px 30px rgba(14, 165, 233, 0.15)' : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'var(--accent-blue)', color: 'white',
                  fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px',
                  borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  Active
                </div>
              )}
              {isCompleted && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: '#10b981', color: 'white',
                  fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px',
                  borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  Completed
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Semester {semNum}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {semNum % 2 === 0 ? 'Spring 2026' : 'Fall 2025'}
                  </p>
                </div>

                {!isFuture ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '-12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                      <span style={{ fontWeight: '700' }}>{isCompleted ? '100%' : '68%'}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? '100%' : '68%' }}
                        style={{ height: '100%', background: isCompleted ? 'var(--success)' : 'var(--accent-blue)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BookOpen size={14} /> {isCompleted ? '6' : '5'} Subjects
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> {isCompleted ? '24' : '18'} Credits
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>View Plan</button>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>Edit</button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '24px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={32} style={{ opacity: 0.1 }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '180px' }}>
                      Your plan will appear here once generated.
                    </p>
                    <button className="btn btn-secondary" style={{ width: '100%', padding: '8px', fontSize: '0.85rem', border: '1px dashed var(--border-color)' }}>Pre-plan Semester</button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Semester Actions Quick Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="widget-card" style={{ gridColumn: 'span 12', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--accent-soft)', border: '1.5px dashed var(--accent-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--accent-blue)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layout size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Looking for your full academic roadmap?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Generate a complete 4-year plan based on your current progress and curriculum.</p>
            </div>
          </div>
          <button className="btn btn-primary">Generate Roadmap</button>
        </motion.div>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '900px' }}>
      <header>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your account and preferences.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="widget-card">
          <div className="widget-header">
            <h3 style={{ fontSize: '1.25rem' }}>Profile Settings</h3>
            <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Edit Profile</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '16px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
              {user?.name?.slice(0, 2).toUpperCase() || '??'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</div>
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Programme & Semester */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="widget-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Academic Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Active Programme</label>
                <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                  {user?.courseName || 'Not set'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Current Semester</label>
                <select style={{ width: '100%', padding: '12px', background: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  <option>Semester 3 – Fall 2025</option>
                  <option>Semester 4 – Spring 2026</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="widget-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Notifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Study Reminders', desc: 'Alerts for planned study sessions' },
                { label: 'Deadline Alerts', desc: 'Notifications before project due dates' },
                { label: 'Streak Reminders', desc: 'Keep your momentum alive' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  <div style={{ width: '40px', height: '20px', background: i < 2 ? 'var(--accent-blue)' : 'var(--border-color)', borderRadius: '10px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: '2px', right: i < 2 ? '2px' : 'auto', left: i < 2 ? 'auto' : '2px', width: '16px', height: '16px', background: 'white', borderRadius: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="widget-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Appearance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Theme</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setTheme('light')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: '16px',
                    border: `2px solid ${theme === 'light' ? 'var(--accent-blue)' : 'transparent'}`,
                    background: theme === 'light' ? 'var(--bg-card)' : 'rgba(0,0,0,0.03)',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '24px', height: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: theme === 'light' ? 'var(--accent-blue)' : 'var(--text-muted)' }}>Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: '16px',
                    border: `2px solid ${theme === 'dark' ? 'var(--accent-blue)' : 'transparent'}`,
                    background: theme === 'dark' ? 'var(--bg-card)' : 'rgba(0,0,0,0.03)',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '24px', height: '24px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: theme === 'dark' ? 'var(--accent-blue)' : 'var(--text-muted)' }}>Dark</span>
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Layout Density</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setDensity('comfortable')}
                  style={{
                    flex: 1, padding: '12px',
                    background: density === 'comfortable' ? 'var(--accent-blue)' : 'rgba(0,0,0,0.03)',
                    color: density === 'comfortable' ? 'white' : 'var(--text-muted)',
                    border: 'none', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Comfortable
                </button>
                <button
                  onClick={() => setDensity('compact')}
                  style={{
                    flex: 1, padding: '12px',
                    background: density === 'compact' ? 'var(--accent-blue)' : 'rgba(0,0,0,0.03)',
                    color: density === 'compact' ? 'white' : 'var(--text-muted)',
                    border: 'none', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="widget-card" style={{ border: '1px solid rgba(239, 68, 68, 0.1)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#ef4444' }}>Security & Auth</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }}>Change Password</button>
            <button className="btn btn-secondary" style={{ flex: 1 }}>Manage Active Sessions</button>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ flex: 1, color: '#ef4444', borderColor: '#fee2e2' }}>Log Out from All Devices</button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '8px', borderRadius: '10px' }}>
            <GraduationCap size={20} />
          </div>
          <span>TrackMySem</span>
        </div>
        <nav style={{ flex: 1 }}>
          <div className={`nav-item ${dashboardView === 'hub' ? 'active' : ''}`} onClick={() => setDashboardView('hub')}><Layout size={20} /> <span>Dashboard</span></div>
          <div className={`nav-item ${dashboardView === 'semesters' ? 'active' : ''}`} onClick={() => setDashboardView('semesters')}><Calendar size={20} /> <span>My Semesters</span></div>
          <div className={`nav-item ${dashboardView === 'subjects' ? 'active' : ''}`} onClick={() => setDashboardView('subjects')}><BookOpen size={20} /> <span>Subjects</span></div>
          <div className={`nav-item ${dashboardView === 'progress' ? 'active' : ''}`} onClick={() => setDashboardView('progress')}><TrendingUp size={20} /> <span>Progress</span></div>
          <div className={`nav-item ${dashboardView === 'settings' ? 'active' : ''}`} onClick={() => setDashboardView('settings')}><Settings size={20} /> <span>Settings</span></div>
        </nav>
        <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
          <LogOut size={20} /> <span>Log Out</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <button className="btn btn-primary" style={{ height: '40px', padding: '0 16px', fontSize: '0.9rem', marginRight: 'auto' }}>+ Add Task</button>
          <Bell className="top-bar-icon" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} size={20} />
          <Settings className="top-bar-icon" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} size={20} />
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.name?.slice(0, 2).toUpperCase() || '??'}
          </div>
        </header>

        <div className="content-area">
          <AnimatePresence mode="wait">
            <motion.div key={dashboardView} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ width: '100%' }}>
              {dashboardView === 'hub' ? renderDashboardHub() :
                dashboardView === 'progress' ? renderProgressView() :
                  dashboardView === 'semesters' ? renderSemestersView() :
                    dashboardView === 'settings' ? renderSettingsView() : (
                      <div style={{ display: 'flex', gap: '32px' }}>
                        {renderDashboardSelection()}
                        <aside className="summary-panel">
                          <h3 style={{ marginBottom: '24px' }}>Selection Summary</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                              <span>Subjects Selected</span>
                              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedSubjects.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                              <span>Total Credits</span>
                              <span style={{ fontWeight: '600', color: totalSelectedCredits >= MAX_CREDITS ? '#ef4444' : 'var(--text-main)' }}>{totalSelectedCredits} / {MAX_CREDITS}</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(totalSelectedCredits / MAX_CREDITS) * 100}%` }} style={{ height: '100%', background: totalSelectedCredits >= MAX_CREDITS ? '#ef4444' : 'var(--accent-blue)' }} />
                            </div>
                          </div>
                          <button
                            className={`btn btn-primary ${selectedSubjects.length === 0 ? 'btn-disabled' : ''}`}
                            style={{ width: '100%', marginBottom: '12px' }}
                            disabled={selectedSubjects.length === 0}
                            onClick={() => { setDashboardView('hub'); setToast({ message: 'Subjects added! Redirecting to your hub...', type: 'success' }); setTimeout(() => setToast(null), 3000); }}
                          >
                            Add Selected Subjects
                          </button>
                          <button className="btn btn-secondary" style={{ width: '100%', border: 'none' }} onClick={() => setDashboardView('hub')}>Skip for Now</button>
                        </aside>
                      </div>
                    )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );

  const renderAuth = () => {
    if (view === 'login') {
      return (
        <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass" style={{ padding: '40px', borderRadius: 'var(--card-radius)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h2>
            <p>Continue your academic journey</p>
          </div>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleLogin}>
            <input type="email" placeholder="Email" required value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
            <input type="password" placeholder="Password" required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p>Don't have an account? <span onClick={() => { setView('register'); setRegStep(1); }} style={{ color: 'var(--accent-blue)', fontWeight: '600', cursor: 'pointer' }}>Sign up</span></p>
          </div>
        </motion.div>
      );
    }

    // Register flow
    return (
      <div className="registration-container">
        <div className="step-indicator">Step {regStep} of 3 – {regStep === 1 ? 'Personal Details' : regStep === 2 ? 'Choose Your Course' : 'Create Account'}</div>
        <AnimatePresence mode="wait">
          {regStep === 1 && (
            <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass" style={{ padding: '40px', borderRadius: 'var(--card-radius)', maxWidth: '450px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}><h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Let's Get Started</h2><p>Tell us a bit about yourself</p></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input type="text" placeholder="Full Name" required value={regData.name} onChange={(e) => setRegData({ ...regData, name: e.target.value })} />
                <button className="btn btn-primary" onClick={() => setRegStep(2)}>Next Step <ChevronRight size={18} /></button>
              </div>
            </motion.div>
          )}

          {regStep === 2 && (
            <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="tabs-container">
                {Object.keys(courseDataMock).map(cat => (
                  <button key={cat} className={`tab ${regData.programmeType === cat ? `active active-${cat.split(' ')[0]}` : ''}`} onClick={() => setRegData({ ...regData, programmeType: cat, courseName: null })}>{cat}</button>
                ))}
              </div>
              <div className="course-grid">
                {courseDataMock[regData.programmeType].map(course => (
                  <div key={course} className={`course-card ${regData.courseName === course ? 'selected' : ''}`} onClick={() => setRegData({ ...regData, courseName: course })}>{course}</div>
                ))}
              </div>
              <div className="nav-buttons">
                <button className="btn btn-secondary" onClick={() => setRegStep(1)}><ChevronLeft size={18} /> Back</button>
                <button className={`btn btn-primary ${!regData.courseName ? 'btn-disabled' : ''}`} disabled={!regData.courseName} onClick={() => setRegStep(3)}>Continue <ChevronRight size={18} /></button>
              </div>
            </motion.div>
          )}

          {regStep === 3 && (
            <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass" style={{ padding: '40px', borderRadius: 'var(--card-radius)', maxWidth: '450px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}><h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Security</h2><p>Secure your TrackMySem account</p></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input type="email" placeholder="Email" required value={regData.email} onChange={(e) => setRegData({ ...regData, email: e.target.value })} />
                <input type="password" placeholder="Password" required value={regData.password} onChange={(e) => setRegData({ ...regData, password: e.target.value })} />
                <div className="nav-buttons">
                  <button className="btn btn-secondary" onClick={() => setRegStep(2)}>Back</button>
                  <button className="btn btn-primary" onClick={handleRegister} disabled={loading}>{loading ? 'Creating...' : 'Complete Signup'}</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div style={{ background: view === 'dashboard' ? '#f8fafc' : 'var(--primary-bg)', minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
        {view === 'landing' ? renderLanding() :
          view === 'dashboard' ? renderDashboard() :
            <main className="container" style={{ padding: '60px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative' }}>
              <button onClick={() => setView('landing')} style={{ position: 'absolute', top: '40px', left: '40px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><ChevronLeft size={20} /> Back to Home</button>
              {renderAuth()}
            </main>
        }
      </AnimatePresence>
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
