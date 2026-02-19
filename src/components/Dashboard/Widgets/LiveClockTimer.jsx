import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';

const LiveClockTimer = ({ subjects, onLogSession }) => {
    const { token } = useApp();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25m
    const [isActive, setIsActive] = useState(false);
    const [initialTime, setInitialTime] = useState(25 * 60);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [sessionCompleted, setSessionCompleted] = useState(false);

    const audioRef = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'));

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Countdown Timer
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            handleComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleStart = () => {
        if (!selectedSubject && subjects.length > 0) {
            // Default to first subject if none selected
            setSelectedSubject(subjects[0].courseCode);
        }
        setIsActive(true);
        setSessionCompleted(false);
    };

    const handlePause = () => setIsActive(false);

    const handleReset = () => {
        setIsActive(false);
        setTimeLeft(initialTime);
        setSessionCompleted(false);
    };

    const handleSetDuration = (minutes) => {
        const seconds = minutes * 60;
        setInitialTime(seconds);
        setTimeLeft(seconds);
        setIsActive(false);
        setSessionCompleted(false);
    };

    const handleComplete = async () => {
        audioRef.current.play().catch(e => console.log('Audio play failed', e));
        setSessionCompleted(true);

        // Log session to backend via parent handler
        if (selectedSubject && onLogSession) {
            const durationMinutes = Math.floor(initialTime / 60);
            await onLogSession(selectedSubject, durationMinutes, 'Completed via Focus Studio');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="widget-card" style={{
            gridColumn: 'span 4',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-primary) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            {/* Live Clock Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)', fontWeight: '600' }}>
                    <Clock size={16} /> Focus Studio
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Timer Display */}
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                    fontSize: '3.5rem',
                    fontWeight: '800',
                    color: isActive ? 'var(--accent-purple)' : 'var(--text-main)',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1
                }}>
                    {formatTime(timeLeft)}
                </div>
                {sessionCompleted && (
                    <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Session Logged!
                    </div>
                )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Duration Presets */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {[25, 45, 60].map(m => (
                        <button
                            key={m}
                            onClick={() => handleSetDuration(m)}
                            style={{
                                background: initialTime === m * 60 ? 'var(--accent-soft)' : 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '4px 8px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                color: initialTime === m * 60 ? 'var(--accent-blue)' : 'var(--text-muted)'
                            }}
                        >
                            {m}m
                        </button>
                    ))}
                </div>

                {/* Main Controls */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {!isActive ? (
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleStart}>
                            <Play size={18} /> Start
                        </button>
                    ) : (
                        <button className="btn btn-secondary" style={{ flex: 1, borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={handlePause}>
                            <Pause size={18} /> Pause
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={handleReset} style={{ padding: '0 12px' }}>
                        <RotateCcw size={18} />
                    </button>
                </div>

                {/* Subject Selector */}
                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '8px' }}
                >
                    <option value="" disabled>Select Subject</option>
                    {subjects?.map(sub => (
                        <option key={sub.id} value={sub.courseCode}>{sub.subjectName}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LiveClockTimer;
