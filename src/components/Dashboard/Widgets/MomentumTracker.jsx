import React from 'react';
import { TrendingUp, Flame } from 'lucide-react';

const MomentumTracker = ({ stats }) => {
    // If stats are not provided yet (loading)
    if (!stats) {
        return (
            <div className="widget-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px' }}>Loading stats...</div>
            </div>
        );
    }

    const maxMinutes = Math.max(...(stats?.weeklyData?.map(d => d.minutes) || [0]), 60); // Min scale 60m

    return (
        <div className="widget-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="var(--success)" /> Momentum
                </h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    color: '#fbbf24',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                }}>
                    <Flame size={14} fill="#fbbf24" /> {stats.currentStreak} Day Streak
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8px', minHeight: '120px' }}>
                {(stats.weeklyData || []).map((day, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'flex-end',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: '100%',
                                height: `${(day.minutes / maxMinutes) * 100}%`,
                                background: day.minutes > 0 ? 'var(--success)' : 'transparent',
                                opacity: 0.8,
                                transition: 'height 0.5s ease'
                            }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                            {day.day}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total Study Time: <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{stats.totalHours} {stats.totalHours == 1 ? 'hr' : 'hrs'}</span>
            </div>
        </div>
    );
};

export default MomentumTracker;
