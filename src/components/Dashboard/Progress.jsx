
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Check, GraduationCap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSubjects } from '../../contexts/SubjectContext';

const Progress = () => {
    const { user, token } = useApp();
    const { fetchSubjects } = useSubjects();
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [credits, setCredits] = useState({ earned: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.currentSemester || !token) return;
            setLoading(true);
            try {
                // 1. Fetch Study Stats
                const statsRes = await fetch('http://localhost:3001/api/study/stats', {
                    headers: { 'Authorization': `Bearer ${token} ` }
                });
                const statsData = await statsRes.json();
                setStats(statsData);

                // 2. Fetch Tasks
                const tasksRes = await fetch('http://localhost:3001/api/tasks', {
                    headers: { 'Authorization': `Bearer ${token} ` }
                });
                const tasksData = await tasksRes.json();
                setTasks(tasksData);

                // 3. Fetch Subjects for Credits
                const subjects = await fetchSubjects(user.currentSemester);
                if (subjects) {
                    const total = subjects.reduce((sum, s) => sum + s.credits, 0);
                    const completedTasks = tasksData.filter(t => t.isCompleted).length;
                    const totalTasks = tasksData.length;
                    const completionRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;

                    setCredits({ earned: Math.floor(total * completionRatio), total });
                }

            } catch (err) {
                console.error('Error loading progress data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user, token, fetchSubjects]);

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading progress...</div>;
    }

    const completedTasksCount = tasks.filter(t => t.isCompleted).length;
    const totalTasksCount = tasks.length;
    const progressPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // Prepare chart data (using real data or fallback)
    const chartData = stats?.weeklyData?.length > 0 ? stats.weeklyData.map(d => d.minutes / 60) : [0, 0, 0, 0, 0, 0, 0];
    const maxHour = Math.max(...chartData, 1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Progress Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track how far you've come in <strong>{user?.programmeSlug?.replace(/_/g, ' ').toUpperCase() || 'YOUR PROGRAMME'}</strong>.</p>
            </header>

            <div className="dashboard-grid">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="widget-card" style={{ gridColumn: 'span 12', display: 'flex', alignItems: 'center', gap: '48px' }}>
                    <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '8px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-blue)' }}>
                        {progressPercentage}%
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>
                            {progressPercentage > 75 ? 'Outstanding!' : progressPercentage > 40 ? 'Keep it up!' : 'Let\'s get to work!'}
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '600px' }}>
                            You've completed <strong>{progressPercentage}%</strong> of your tasks.
                            {progressPercentage > 50 ? " You're on track for a successful semester." : " Picking up the pace now will pay off later."}
                        </p>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--accent-soft)', border: '1px solid var(--border-color)', flex: 1 }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tasks Remaining</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-blue)' }}>{totalTasksCount - completedTasksCount}</div>
                            </div>
                            <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--purple-soft)', border: '1px solid var(--border-color)', flex: 1 }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Est. Credits Earned</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-purple)' }}>{credits.earned} / {credits.total}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="widget-card" style={{ gridColumn: 'span 7' }}>
                    <h3 style={{ marginBottom: '24px' }}>Study Hours Analytics (Click to Log)</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                        {chartData.map((h, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <div style={{ width: '100%', height: `${(h / maxHour) * 100}% `, background: 'var(--accent-blue)', borderRadius: '6px 6px 0 0', opacity: 0.3 + (h / maxHour) * 0.7, minHeight: '4px' }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats?.weeklyData?.[i]?.day || ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="widget-card" style={{ gridColumn: 'span 5' }}>
                    <h3 style={{ marginBottom: '24px' }}>Milestones</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { icon: GraduationCap, label: `${Math.round(stats?.totalHours || 0)} Hours Studied`, color: 'var(--accent-blue)', achieved: (stats?.totalHours || 0) > 100 },
                            { icon: Check, label: 'Semester Ace (All Tasks Done)', color: 'var(--success)', achieved: progressPercentage === 100 && totalTasksCount > 0 },
                            { icon: TrendingUp, label: `${stats?.currentStreak || 0} -Day Study Streak`, color: 'var(--warning)', achieved: (stats?.currentStreak || 0) >= 7 }
                        ].map((m, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-primary)', borderRadius: '12px', opacity: m.achieved ? 1 : 0.6 }}>
                                <div style={{ padding: '8px', borderRadius: '10px', background: 'white', color: m.color, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <m.icon size={20} />
                                </div>
                                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{m.label}</span>
                                {m.achieved && <Check size={16} color="var(--success)" style={{ marginLeft: 'auto' }} />}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Progress;
