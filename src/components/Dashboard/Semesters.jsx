
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, BookOpen, Layout, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSubjects } from '../../contexts/SubjectContext';

const SemesterCard = ({ semNum, isActive, isCompleted, onEdit, onView }) => {
    const { fetchSubjects } = useSubjects();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ credits: 0, count: 0 });

    useEffect(() => {
        setLoading(true);
        fetchSubjects(semNum).then(data => {
            if (data) {
                setSubjects(data);
                const totalCredits = data.reduce((sum, sub) => sum + sub.credits, 0);
                setStats({ credits: totalCredits, count: data.length });
            }
            setLoading(false);
        });
    }, [semNum, fetchSubjects]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: semNum * 0.05 }}
            className="widget-card"
            style={{
                gridColumn: 'span 6',
                border: isActive ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                position: 'relative'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Semester {semNum}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {semNum % 2 === 0 ? 'Spring' : 'Fall'} {2024 + Math.floor((semNum - 1) / 2)}
                        </p>
                    </div>
                    {isActive && <span style={{ background: 'var(--accent-blue)', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px', borderRadius: '20px' }}>ACTIVE</span>}
                    {isCompleted && <span style={{ background: 'var(--success)', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px', borderRadius: '20px' }}>COMPLETED</span>}
                </div>

                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BookOpen size={14} /> {loading ? '...' : stats.count} Subjects
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> {loading ? '...' : stats.credits} Credits
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => onView(semNum, subjects)}
                        style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                    >
                        View Detail
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => onEdit(semNum)}
                        style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                    >
                        Edit Plan
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const SubjectModal = ({ isOpen, onClose, title, subjects }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="widget-card"
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    margin: '20px'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {subjects.length > 0 ? (
                        subjects.map(subject => (
                            <div key={subject.courseCode} style={{
                                padding: '16px',
                                background: 'var(--bg-primary)',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>{subject.subjectName}</h4>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {subject.courseCode} • {subject.type} • {subject.credits} Credits
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: 'var(--accent-soft)',
                                    color: 'var(--accent-blue)',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}>
                                    {subject.semesterTag}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No subjects found for this semester.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const Semesters = () => {
    const { user } = useApp();
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [modalData, setModalData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleView = (semNum, subjects) => {
        setSelectedSemester(semNum);
        setModalData(subjects);
        setIsModalOpen(true);
    };

    const handleEdit = (semNum) => {
        // Placeholder for edit functionality
        alert(`Edit plan for Semester ${semNum} coming soon!`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>My Semesters</h1>
                <p style={{ color: 'var(--text-muted)' }}>Your academic journey, one semester at a time.</p>
            </header>

            <div className="dashboard-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => (
                    <SemesterCard
                        key={semNum}
                        semNum={semNum}
                        isActive={user?.currentSemester === semNum}
                        isCompleted={user?.currentSemester > semNum}
                        onView={handleView}
                        onEdit={handleEdit}
                    />
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <SubjectModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={`Semester ${selectedSemester} Subjects`}
                        subjects={modalData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Semesters;
