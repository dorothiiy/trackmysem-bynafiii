import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApp } from './AppContext';
import { useSubjects } from './SubjectContext'; // Re-use subject fetching logic if needed, but might be cleaner to fetch here for specific dashboard needs

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
    const { user, token } = useApp();
    const subjectContext = useSubjects();
    const { fetchSubjects } = subjectContext || {};

    console.log('DashboardProvider: useApp user:', user);
    console.log('DashboardProvider: useSubjects context:', subjectContext);

    // State
    const [subjects, setSubjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [dailyGoal, setDailyGoal] = useState(null);
    const [studyStats, setStudyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const openTaskModal = () => setIsTaskModalOpen(true);
    const closeTaskModal = () => setIsTaskModalOpen(false);

    // Fetch All Data
    const refreshDashboard = useCallback(async () => {
        if (!user?.currentSemester || !token) return;

        // Don't set loading to true on refresh to avoid flickering, only on initial load
        // But we can track refreshing state if needed
        try {
            // Parallel Fetch
            const [subjectsData, tasksRes, goalRes, statsRes] = await Promise.all([
                fetchSubjects(user.currentSemester),
                fetch('http://localhost:3001/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:3001/api/goals/today', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:3001/api/study/stats', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (subjectsData) setSubjects(subjectsData);

            if (tasksRes.ok) {
                const tasksData = await tasksRes.json();
                setTasks(tasksData);
            }

            if (goalRes.ok) {
                const goalData = await goalRes.json();
                setDailyGoal(goalData);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStudyStats(statsData);
            } else {
                console.error("Stats fetch failed", statsRes.status);
                setStudyStats({ weeklyData: [], totalHours: 0, currentStreak: 0 }); // Fallback
            }

        } catch (err) {
            console.error('Error refreshing dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, [user, token, fetchSubjects]);

    // Initial Load
    useEffect(() => {
        setLoading(true);
        refreshDashboard();
    }, [refreshDashboard]);

    // Actions
    const logStudySession = async (subjectCode, durationMinutes, notes) => {
        try {
            await fetch('http://localhost:3001/api/study', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subjectCode, durationMinutes, notes })
            });
            // Refresh to update stats and momentum
            refreshDashboard();
        } catch (err) {
            console.error('Error logging session:', err);
        }
    };

    const updateDailyGoal = async (goalText, subjectCode) => {
        try {
            const res = await fetch('http://localhost:3001/api/goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ goalText, subjectCode })
            });
            const data = await res.json();
            setDailyGoal(data);
        } catch (err) {
            console.error('Error updating goal:', err);
        }
    };

    const toggleDailyGoal = async (isCompleted) => {
        if (!dailyGoal) return;
        // Optimistic
        setDailyGoal(prev => ({ ...prev, isCompleted }));
        try {
            await fetch(`http://localhost:3001/api/goals/${dailyGoal.id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isCompleted })
            });
            // No need to full refresh, but could if momentum depended on it
        } catch (err) {
            console.error('Error toggling goal:', err);
            setDailyGoal(prev => ({ ...prev, isCompleted: !isCompleted }));
        }
    };

    const completeTask = async (taskId) => {
        // Optimistic
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: 1 } : t));
        try {
            await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isCompleted: true })
            });
            // Refresh to update lists/stats
            refreshDashboard();
        } catch (err) {
            console.error('Error completing task:', err);
        }
    };

    const addTask = async (taskData) => {
        // Optimistic update optional, but given it's a new item, better to wait for ID or fetch
        // For now, let's just fetch after
        try {
            const res = await fetch('http://localhost:3001/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskData)
            });

            if (res.ok) {
                // Refresh dashboard to show new task
                await refreshDashboard();
            }
        } catch (err) {
            console.error('Error adding task:', err);
            throw err;
        }
    };

    const value = {
        subjects,
        tasks,
        dailyGoal,
        studyStats,
        loading,
        refreshDashboard,
        logStudySession,
        updateDailyGoal,
        toggleDailyGoal,
        completeTask,
        addTask,
        isTaskModalOpen,
        openTaskModal,
        closeTaskModal
    };

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};
