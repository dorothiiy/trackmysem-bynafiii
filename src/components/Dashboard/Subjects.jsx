import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Clock, Tag } from 'lucide-react';
import { useSubjects } from '../../contexts/SubjectContext';
import { useApp } from '../../contexts/AppContext';

const Subjects = () => {
    const { fetchAllSubjects, loading } = useSubjects();
    const { user } = useApp();
    const [allSubjects, setAllSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [semesters, setSemesters] = useState([]);

    useEffect(() => {
        const loadSubjects = async () => {
            const data = await fetchAllSubjects();
            if (data) {
                setAllSubjects(data || []);
            }
        };
        loadSubjects();
    }, [fetchAllSubjects]);

    useEffect(() => {
        // Filter and Group
        let filtered = allSubjects;

        if (searchTerm) {
            const lowerInfo = searchTerm.toLowerCase();
            filtered = allSubjects.filter(sub =>
                sub.subjectName.toLowerCase().includes(lowerInfo) ||
                sub.courseCode.toLowerCase().includes(lowerInfo)
            );
        }

        // Group by Semester
        const grouped = filtered.reduce((acc, sub) => {
            const sem = sub.semesterNumber;
            if (!acc[sem]) acc[sem] = [];
            acc[sem].push(sub);
            return acc;
        }, {});

        setFilteredSubjects(grouped);
        setSemesters(Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b)));

    }, [allSubjects, searchTerm]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Subjects</h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Full course catalog for {user?.programmeSlug?.toUpperCase() || 'your programme'}.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '24px', position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search subjects by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 48px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading subjects...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {semesters.length > 0 ? (
                        semesters.map(sem => (
                            <section key={sem}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                                    Semester {sem}
                                </h2>
                                <div className="dashboard-grid">
                                    {filteredSubjects[sem].map(subject => (
                                        <motion.div
                                            key={subject.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="widget-card"
                                            style={{ gridColumn: 'span 4' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <span style={{
                                                    background: 'var(--bg-secondary)',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    {subject.courseCode}
                                                </span>
                                                <span style={{
                                                    background: 'var(--accent-soft)',
                                                    color: 'var(--accent-blue)',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {subject.credits} Credits
                                                </span>
                                            </div>

                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: '1.4' }}>
                                                {subject.subjectName}
                                            </h3>

                                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Tag size={14} /> {subject.type}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={14} /> {subject.semesterTag}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            {searchTerm ? 'No subjects found matching your search.' : 'No subjects found.'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Subjects;
