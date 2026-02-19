import React from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';

const TodayProgress = () => {
    const { tasks, loading } = useDashboard();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => {
        const taskDate = t.dueDate ? t.dueDate.split('T')[0] : '';
        return taskDate === todayStr;
    });

    const totalTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(t => t.isCompleted).length;
    const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    const remainingMinutes = todayTasks
        .filter(t => !t.isCompleted)
        .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

    if (loading) return null;

    return (
        <div className="widget-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Today's Progress</h3>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{Math.round(progress)}%</span>
                    <span style={{ color: 'var(--text-muted)' }}>{completedTasks}/{totalTasks} tasks</span>
                </div>

                <div style={{
                    padding: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: remainingMinutes > 60 ? 'var(--warning)' : 'var(--success)'
                    }} />
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                            {remainingMinutes === 0 ? 'All caught up!' : `${remainingMinutes} min remaining`}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {remainingMinutes === 0 ? 'Great job!' : 'Estimated time'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Chart Effect */}
            <svg
                viewBox="0 0 100 100"
                style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    width: '120px',
                    height: '120px',
                    opacity: 0.1,
                    transform: 'rotate(-90deg)'
                }}
            >
                <circle cx="50" cy="50" r="40" stroke="var(--text-muted)" strokeWidth="10" fill="none" />
                <circle
                    cx="50" cy="50" r="40"
                    stroke="var(--accent-primary)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${progress * 2.51} 251`}
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

export default TodayProgress;
