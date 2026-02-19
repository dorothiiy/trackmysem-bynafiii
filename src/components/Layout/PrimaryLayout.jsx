import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AddTaskModal from '../Dashboard/Modals/AddTaskModal';
import { useDashboard } from '../../contexts/DashboardContext';

const PrimaryLayout = ({ children, currentView, onViewChange }) => {
    let dashboardContext;
    try {
        dashboardContext = useDashboard();
    } catch (e) {
        console.warn("PrimaryLayout used outside DashboardProvider");
    }

    const isTaskModalOpen = dashboardContext?.isTaskModalOpen;
    const closeTaskModal = dashboardContext?.closeTaskModal;

    return (
        <div className="dashboard-layout">
            <Sidebar currentView={currentView} onViewChange={onViewChange} />
            <main className="main-content">
                <TopBar />
                <div className="content-area">
                    {children}
                </div>
            </main>
            {/* Global Modal */}
            {dashboardContext && (
                <AddTaskModal isOpen={isTaskModalOpen} onClose={closeTaskModal} />
            )}
        </div>
    );
};

export default PrimaryLayout;
