import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { formatDueString } from '../../../utils/productivity';

const DeadlinesTimeline = ({ tasks }) => {
    const upcomingTasks = tasks
        .filter(t => !t.isCompleted)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5); // Show top 5

    return (
        <div className="widget-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="var(--accent-purple)" /> Upcoming
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>See All</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((task, index) => (
                        <div key={task.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '2px',
                                height: '100%',
                                background: index === 0 ? 'var(--accent-purple)' : 'var(--border-color)',
                                minHeight: '32px',
                                marginTop: '4px'
                            }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{task.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{task.subjectName}</span>
                                    <span style={{
                                        color: index === 0 ? 'var(--accent-purple)' : 'inherit',
                                        fontWeight: index === 0 ? '600' : '400'
                                    }}>
                                        {formatDueString(task.dueDate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                        <BookOpen size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <p style={{ fontSize: '0.9rem' }}>No upcoming deadlines</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeadlinesTimeline;
