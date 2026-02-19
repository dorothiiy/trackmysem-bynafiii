import React from 'react';
import { Layout, Calendar, TrendingUp, Settings, LogOut, GraduationCap, BookOpen } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Sidebar = ({ currentView, onViewChange }) => {
    const { setToken, setUser } = useApp();

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '8px', borderRadius: '10px' }}>
                    <GraduationCap size={20} />
                </div>
                <span>TrackMySem</span>
            </div>

            <nav style={{ flex: 1 }}>
                <div
                    className={`nav-item ${currentView === 'hub' ? 'active' : ''}`}
                    onClick={() => onViewChange('hub')}
                >
                    <Layout size={20} /> <span>Dashboard</span>
                </div>
                <div
                    className={`nav-item ${currentView === 'semesters' ? 'active' : ''}`}
                    onClick={() => onViewChange('semesters')}
                >
                    <Calendar size={20} /> <span>My Semesters</span>
                </div>
                <div
                    className={`nav-item ${currentView === 'subjects' ? 'active' : ''}`}
                    onClick={() => onViewChange('subjects')}
                >
                    <BookOpen size={20} /> <span>Subjects</span>
                </div>
                <div
                    className={`nav-item ${currentView === 'progress' ? 'active' : ''}`}
                    onClick={() => onViewChange('progress')}
                >
                    <TrendingUp size={20} /> <span>Progress</span>
                </div>
                <div
                    className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                    onClick={() => onViewChange('settings')}
                >
                    <Settings size={20} /> <span>Settings</span>
                </div>
            </nav>

            <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444', marginTop: 'auto' }}>
                <LogOut size={20} /> <span>Log Out</span>
            </div>
        </aside>
    );
};

export default Sidebar;
