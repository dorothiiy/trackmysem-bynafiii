import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Moon, Sun, Maximize, Minimize } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Settings = () => {
    const { theme, setTheme, density, setDensity, user } = useApp();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px' }}>
            <header>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your account and app preferences.</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Appearance Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="widget-card">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Moon size={20} /> Personalization
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Interface Theme</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setTheme('light')}
                                    className="btn"
                                    style={{
                                        flex: 1, flexDirection: 'column', padding: '16px', borderRadius: '16px',
                                        background: theme === 'light' ? 'var(--accent-soft)' : 'var(--bg-primary)',
                                        border: `2px solid ${theme === 'light' ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                                        color: theme === 'light' ? 'var(--accent-blue)' : 'var(--text-muted)'
                                    }}
                                >
                                    <Sun size={20} style={{ marginBottom: '8px' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className="btn"
                                    style={{
                                        flex: 1, flexDirection: 'column', padding: '16px', borderRadius: '16px',
                                        background: theme === 'dark' ? 'var(--accent-soft)' : 'var(--bg-primary)',
                                        border: `2px solid ${theme === 'dark' ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                                        color: theme === 'dark' ? 'var(--accent-blue)' : 'var(--text-muted)'
                                    }}
                                >
                                    <Moon size={20} style={{ marginBottom: '8px' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Dark</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Layout Density</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setDensity('comfortable')}
                                    className="btn"
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600',
                                        background: density === 'comfortable' ? 'var(--accent-blue)' : 'var(--bg-primary)',
                                        color: density === 'comfortable' ? 'white' : 'var(--text-muted)',
                                        border: density === 'comfortable' ? 'none' : '1px solid var(--border-color)'
                                    }}
                                >
                                    Comfortable
                                </button>
                                <button
                                    onClick={() => setDensity('compact')}
                                    className="btn"
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600',
                                        background: density === 'compact' ? 'var(--accent-blue)' : 'var(--bg-primary)',
                                        color: density === 'compact' ? 'white' : 'var(--text-muted)',
                                        border: density === 'compact' ? 'none' : '1px solid var(--border-color)'
                                    }}
                                >
                                    Compact
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Profile Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="widget-card">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={20} /> Profile Information
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                            {user?.name?.slice(0, 2).toUpperCase() || '??'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Name</label>
                                    <input type="text" value={user?.name || ''} readOnly />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</label>
                                    <input type="text" value={user?.email || ''} readOnly />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* System Settings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="widget-card">
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bell size={18} /> Notifications
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {['Study Reminders', 'Deadline Alerts', 'Streak Updates'].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{item}</span>
                                    <div style={{ width: '36px', height: '18px', background: i < 2 ? 'var(--accent-blue)' : 'var(--border-color)', borderRadius: '10px' }}></div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="widget-card">
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={18} /> Security
                        </h3>
                        <button className="btn btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}>Change Password</button>
                        <button className="btn btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '0.85rem', marginTop: '12px', color: '#ef4444', borderColor: '#ef4444' }}>Delete Account</button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
