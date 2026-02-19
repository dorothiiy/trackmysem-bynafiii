import React, { useState } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const DailyFocusGoal = ({ goal, subjects, onSetGoal, onToggleGoal }) => {
    const [input, setInput] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSetGoal(input, selectedSubject);
            setIsEditing(false);
            if (!goal) {
                // Celebration for setting a goal!
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 }
                });
            }
        }
    };

    const handleToggle = () => {
        if (!goal.isCompleted) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
        onToggleGoal(goal.id, !goal.isCompleted);
    };

    if (!goal && !isEditing) {
        return (
            <div className="widget-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={20} color="var(--accent-blue)" />
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem' }}>No Focus Goal Set</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>What's your one main priority today?</p>
                </div>
                <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Set Daily Goal</button>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="widget-card" style={{ gridColumn: 'span 4' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Set Today's Focus</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        type="text"
                        placeholder="e.g. Finish DSA Trees module"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                    />
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        style={{ fontSize: '0.9rem' }}
                    >
                        <option value="">(Optional) Link a specific Subject</option>
                        {subjects?.map(sub => (
                            <option key={sub.id} value={sub.courseCode}>{sub.subjectName}</option>
                        ))}
                    </select>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Set Goal</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="widget-card" style={{ gridColumn: 'span 4', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} color="var(--accent-purple)" /> Today's Focus
                </h3>
                <button style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => { setInput(goal.goalText); setSelectedSubject(goal.subjectCode || ''); setIsEditing(true); }}>Edit</button>
            </div>

            <div style={{ background: goal.isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s ease' }}>
                <button
                    onClick={handleToggle}
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: goal.isCompleted ? 'none' : '2px solid var(--text-muted)',
                        background: goal.isCompleted ? 'var(--success)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
                    {goal.isCompleted && <CheckCircle2 size={16} />}
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        textDecoration: goal.isCompleted ? 'line-through' : 'none',
                        color: goal.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                        transition: 'all 0.3s ease'
                    }}>
                        {goal.goalText}
                    </div>
                    {goal.subjectCode && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '4px' }}>
                            Linked to {subjects?.find(s => s.courseCode === goal.subjectCode)?.subjectName || goal.subjectCode}
                        </div>
                    )}
                </div>
            </div>

            {goal.isCompleted && (
                <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>
                    Momentum +1 🔥
                </div>
            )}
        </div>
    );
};

export default DailyFocusGoal;
