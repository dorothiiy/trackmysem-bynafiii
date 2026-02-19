import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Tag } from 'lucide-react';
import { useDashboard } from '../../../contexts/DashboardContext';

const TodayTasks = () => {
    const { tasks, completeTask, loading } = useDashboard();

    // Filter tasks for today (simple string comparison for YYYY-MM-DD or assume API returns relevant)
    // Actually, API returns all tasks. Let's filter in frontend for "Today" + "Not Completed" (or completed today)
    // Ideally, "Today View" shows pending tasks for today AND tasks completed today.

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => {
        const taskDate = t.dueDate ? t.dueDate.split('T')[0] : '';
        return taskDate === todayStr;
    });

    // Sort: Incomplete first, then by priority
    const sortedTasks = [...todayTasks].sort((a, b) => {
        if (a.isCompleted === b.isCompleted) {
            // Priority sort
            const pMap = { high: 0, medium: 1, low: 2 };
            return pMap[a.priority] - pMap[b.priority];
        }
        return a.isCompleted - b.isCompleted;
    });

    if (loading) return <div className="widget-card" style={{ height: '100%', minHeight: '300px' }}>Loading...</div>;

    return (
        <div className="widget-card" style={{ gridColumn: 'span 8', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Today's Tasks</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{todayTasks.filter(t => !t.isCompleted).length} remaining</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedTasks.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '12px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={32} color="var(--success)" />
                        </div>
                        <p>No tasks for today. Enjoy your freedom!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {sortedTasks.map(task => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: 'var(--bg-tertiary)',
                                    opacity: task.isCompleted ? 0.6 : 1,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <button
                                    onClick={() => completeTask(task.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {task.isCompleted ? (
                                        <CheckCircle2 size={24} color="var(--success)" fill="var(--success-bg)" />
                                    ) : (
                                        <Circle size={24} color="var(--text-muted)" />
                                    )}
                                </button>

                                <div style={{ flex: 1 }}>
                                    <h4 style={{
                                        margin: '0 0 4px 0',
                                        fontSize: '1rem',
                                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                                        color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-main)'
                                    }}>
                                        {task.title}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {task.subjectCode && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Tag size={12} /> {task.subjectCode}
                                            </span>
                                        )}
                                        {task.estimatedMinutes && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} /> {task.estimatedMinutes} min
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)'
                                        : task.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)'
                                            : 'rgba(16, 185, 129, 0.1)',
                                    color: task.priority === 'high' ? 'var(--error)'
                                        : task.priority === 'medium' ? 'var(--warning)'
                                            : 'var(--success)'
                                }}>
                                    {task.priority}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default TodayTasks;
