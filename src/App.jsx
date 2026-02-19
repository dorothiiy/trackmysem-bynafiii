import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { SubjectProvider } from './contexts/SubjectContext';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './components/Auth/Landing';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { DashboardProvider } from './contexts/DashboardContext';
import PrimaryLayout from './components/Layout/PrimaryLayout';
import Hub from './components/Dashboard/Hub';
import Semesters from './components/Dashboard/Semesters';
import Progress from './components/Dashboard/Progress';
import Settings from './components/Dashboard/Settings';
import Subjects from './components/Dashboard/Subjects';

function AppContent() {
    const { user, token, loading } = useApp();
    const [authView, setAuthView] = useState('landing');
    const [currentView, setCurrentView] = useState('hub');

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!token || !user) {
        return (
            <AnimatePresence mode="wait">
                {authView === 'landing' && (
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Landing onAuthClick={setAuthView} />
                    </motion.div>
                )}
                {authView === 'login' && (
                    <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <Login onAuthClick={setAuthView} />
                    </motion.div>
                )}
                {authView === 'register' && (
                    <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <Register onAuthClick={setAuthView} />
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    // Dashboard Views
    return (
        <DashboardProvider>
            <PrimaryLayout currentView={currentView} onViewChange={setCurrentView}>
                <AnimatePresence mode="wait">
                    {currentView === 'hub' && (
                        <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Hub />
                        </motion.div>
                    )}
                    {currentView === 'semesters' && (
                        <motion.div key="semesters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Semesters />
                        </motion.div>
                    )}
                    {currentView === 'subjects' && (
                        <motion.div key="subjects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Subjects />
                        </motion.div>
                    )}
                    {currentView === 'progress' && (
                        <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Progress />
                        </motion.div>
                    )}
                    {currentView === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Settings />
                        </motion.div>
                    )}
                </AnimatePresence>
            </PrimaryLayout>
        </DashboardProvider>
    );
}

export default function App() {
    return (
        <AppProvider>
            <SubjectProvider>
                <AppContent />
            </SubjectProvider>
        </AppProvider>
    );
}
