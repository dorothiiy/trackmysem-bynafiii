import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { DashboardProvider, useDashboard } from '../../contexts/DashboardContext';
import DeadlinesTimeline from './Widgets/DeadlinesTimeline';
import DailyFocusGoal from './Widgets/DailyFocusGoal';
import SubjectHealthBadges from './Widgets/SubjectHealthBadges';
import LiveClockTimer from './Widgets/LiveClockTimer';
import MomentumTracker from './Widgets/MomentumTracker';
import SmartSuggestions from './Widgets/SmartSuggestions';
import TodayTasks from './Widgets/TodayTasks';
import TodayProgress from './Widgets/TodayProgress';
// import AddTaskModal from './Modals/AddTaskModal'; // Moved to Layout
import { computeSubjectHealth } from '../../utils/productivity';

const DashboardContent = () => {
    const { user } = useApp();
    const {
        subjects,
        tasks,
        dailyGoal,
        studyStats,
        loading,
        updateDailyGoal,
        toggleDailyGoal,
        completeTask,
        logStudySession,
        openTaskModal // Use global open
    } = useDashboard();

    // const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); // Removed local state

    // Derived State
    const activeTasks = tasks.filter(t => !t.isCompleted);

    // Compute Health for Subjects
    const subjectsWithHealth = subjects.map(sub => {
        const subTasks = tasks.filter(t => t.subjectCode === sub.courseCode);
        return {
            ...sub,
            health: computeSubjectHealth(sub, subTasks)
        };
    });

    const semesterLabel = user?.currentSemester ? `Semester ${user.currentSemester}` : 'Semester 1';

    return (
        <div className="dashboard-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 'var(--item-gap)',
            paddingBottom: '40px'
        }}>
            {/* 1. Header & Welcome (Span 8) */}
            <div style={{ gridColumn: 'span 8', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {semesterLabel} • {activeTasks.length} pending tasks
                    </p>
                </div>
                {/* 
                <button
                    onClick={openTaskModal}
                    style={{
                       ...
                    }}
                >
                    <Plus size={18} /> Add Task
                </button>
                Note: We can keep this button working too!
                */}
                <button
                    onClick={openTaskModal}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        background: 'var(--accent-primary)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                    }}
                >
                    <Plus size={18} /> Add Task
                </button>
            </div>

            {/* 2. Focus Studio (Span 4) - Top Right */}
            <LiveClockTimer subjects={subjects} onLogSession={logStudySession} />

            {/* 3. Today's Tasks (Span 8) */}
            <TodayTasks />

            {/* 4. Today's Progress (Span 4) */}
            <TodayProgress />

            {/* 5. Deadlines Timeline (Span 4) */}
            <DeadlinesTimeline tasks={tasks} />

            {/* 6. Daily Focus Goal (Span 4) */}
            <DailyFocusGoal
                goal={dailyGoal}
                subjects={subjects}
                onSetGoal={updateDailyGoal}
                onToggleGoal={(id, val) => toggleDailyGoal(val)}
            />

            {/* 7. Momentum Tracker (Span 4) */}
            <MomentumTracker stats={studyStats} />

            {/* 8. Subject Health Overview (Span 12) */}
            <motion.div
                className="widget-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ gridColumn: 'span 12' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={18} color="var(--accent-blue)" /> Subject Status
                    </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                    {loading ? (
                        <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Loading subjects...</div>
                    ) : subjectsWithHealth.map(sub => (
                        <div key={sub.id} style={{
                            padding: '16px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '16px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>{sub.courseCode}</span>
                                <SubjectHealthBadges status={sub.health} />
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sub.subjectName}
                            </div>
                        </div>
                    ))}
                    {!loading && subjectsWithHealth.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                            No subjects found.
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Modal removed from here, now in Layout */}
        </div>
    );
};

// Hub no longer needs to provide DashboardContext
const Hub = () => (
    <DashboardContent />
);

export default Hub;
