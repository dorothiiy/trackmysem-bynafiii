import React from 'react';
import { Bell, Settings as SettingsIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useDashboard } from '../../contexts/DashboardContext';

const TopBar = () => {
    const { user } = useApp();
    const { openTaskModal } = useDashboard();

    return (
        <header className="top-bar">
            <button
                className="btn btn-primary"
                style={{ height: '40px', padding: '0 16px', fontSize: '0.9rem', marginRight: 'auto' }}
                onClick={openTaskModal}
            >
                + Add Task
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Bell size={20} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                <SettingsIcon size={20} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />

                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '0.9rem'
                }}>
                    {user?.name?.slice(0, 2).toUpperCase() || '??'}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
