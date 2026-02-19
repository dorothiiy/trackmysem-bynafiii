import React from 'react';
import { Layout, Calendar, ArrowRight, GraduationCap } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc }) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '16px', color: 'var(--accent-blue)', boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)' }}>
            <Icon size={24} />
        </div>
        <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{title}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{desc}</p>
        </div>
    </div>
);

const Landing = ({ onAuthClick }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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

            <main className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div>
                            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'var(--accent-soft)', color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '16px' }}>🚀 Smart Academic Tracking</span>
                            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px' }}>Master Your <span style={{ color: 'var(--accent-blue)' }}>Semester</span> with Confidence.</h1>
                            <p style={{ fontSize: '1.2rem', maxWidth: '540px', color: 'var(--text-muted)' }}>Track grades, manage assignments, and visualize your progress. The all-in-one productivity companion built specifically for modern students.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <Feature icon={Layout} title="GPA Tracker" desc="Real-time calculation of your current and projected GPA." />
                            <Feature icon={Calendar} title="Smart Planner" desc="Never miss a deadline with automated assignment reminders." />
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button className="btn btn-primary" style={{ fontSize: '1.1rem' }} onClick={() => onAuthClick('register')}>Get Started for Free</button>
                            <button className="btn btn-secondary" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>View Demo <ArrowRight size={18} /></button>
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        {/* Abstract UI representation */}
                        <div className="widget-card" style={{ transform: 'rotate(-2deg)', opacity: 0.9 }}>
                            <div style={{ height: '20px', width: '100px', background: 'var(--accent-soft)', borderRadius: '10px', marginBottom: '20px' }}></div>
                            <div style={{ height: '12px', width: '100%', background: 'var(--border-color)', borderRadius: '6px', marginBottom: '12px' }}></div>
                            <div style={{ height: '12px', width: '80%', background: 'var(--border-color)', borderRadius: '6px', marginBottom: '12px' }}></div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <div style={{ flex: 1, height: '60px', background: 'var(--accent-soft)', borderRadius: '12px' }}></div>
                                <div style={{ flex: 1, height: '60px', background: 'var(--purple-soft)', borderRadius: '12px' }}></div>
                            </div>
                        </div>
                        <div className="widget-card" style={{ position: 'absolute', top: '60px', right: '-20px', width: '240px', transform: 'rotate(5deg)', zIndex: 2 }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Study Hours</h3>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                                {[40, 70, 50, 90, 60].map((h, i) => (
                                    <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--accent-blue)', borderRadius: '4px 4px 0 0' }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Landing;
