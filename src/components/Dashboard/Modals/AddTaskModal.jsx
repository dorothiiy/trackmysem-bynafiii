import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../../../contexts/DashboardContext';
import { X, BookOpen, Calendar, Clock, AlertCircle, Check } from 'lucide-react';

const AddTaskModal = ({ isOpen, onClose }) => {
    const { subjects, addTask } = useDashboard();

    const [formData, setFormData] = useState({
        title: '',
        subjectCode: '',
        type: 'study', // study, assignment, exam
        dueDate: new Date().toISOString().split('T')[0],
        estimatedMinutes: 30,
        priority: 'medium'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // No early return for null to ensure AnimatePresence works?
    // Actually AnimatePresence handles the null check via isOpen condition usually.
    // But we will use Portal.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addTask(formData);
            onClose();
            // Reset form
            setFormData({
                title: '',
                subjectCode: '',
                type: 'study',
                dueDate: new Date().toISOString().split('T')[0],
                estimatedMinutes: 30,
                priority: 'medium'
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 9999
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxWidth: '500px',
                            background: 'var(--sidebar-bg)',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            zIndex: 10000,
                            color: 'var(--text-main)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Add New Task</h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Title */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Task Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Read Chapter 4, Finish Lab Report"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-tertiary)',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            {/* Subject & Type Row */}
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Subject</label>
                                    <div style={{ position: 'relative' }}>
                                        <BookOpen size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <select
                                            value={formData.subjectCode}
                                            onChange={e => setFormData({ ...formData, subjectCode: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 12px 12px 40px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-tertiary)',
                                                color: 'var(--text-main)',
                                                appearance: 'none'
                                            }}
                                        >
                                            <option value="">No Subject</option>
                                            {Array.isArray(subjects) && subjects.map(sub => (
                                                sub && (
                                                    <option key={sub.courseCode || Math.random()} value={sub.courseCode}>
                                                        {sub.courseCode} - {sub.subjectName}
                                                    </option>
                                                )
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-tertiary)',
                                            color: 'var(--text-main)'
                                        }}
                                    >
                                        <option value="study">Study Session</option>
                                        <option value="assignment">Assignment</option>
                                        <option value="exam">Exam Prep</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Date, Time, Priority Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Due Date</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 12px 12px 40px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-tertiary)',
                                                color: 'var(--text-main)'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Est. Time</label>
                                    <div style={{ position: 'relative' }}>
                                        <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="number"
                                            min="5"
                                            step="5"
                                            value={formData.estimatedMinutes}
                                            onChange={e => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 12px 12px 40px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-tertiary)',
                                                color: 'var(--text-main)'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Priority</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['low', 'medium', 'high'].map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                style={{
                                                    flex: 1,
                                                    height: '42px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    background: formData.priority === p
                                                        ? (p === 'high' ? 'var(--error)' : p === 'medium' ? 'var(--warning)' : 'var(--success)')
                                                        : 'var(--bg-tertiary)',
                                                    opacity: formData.priority === p ? 1 : 0.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <AlertCircle size={16} color={formData.priority === p ? '#fff' : 'var(--text-muted)'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    marginTop: '8px',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: 'var(--accent-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: isSubmitting ? 'wait' : 'pointer'
                                }}
                            >
                                {isSubmitting ? 'Adding...' : <><Check size={20} /> Add Task</>}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default AddTaskModal;
