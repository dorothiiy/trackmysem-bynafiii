import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COURSES = {
    'Engineering Programmes': [
        'B.Tech – Biotechnology',
        'B.Tech – Chemical Engineering',
        'B.Tech – Civil Engineering',
        'B.Tech – Computer Science and Engineering and Business Systems (TCS collaboration)',
        'B.Tech – Computer Science and Engineering (Artificial Intelligence and Data Engineering)',
        'B.Tech – Electronics and Communication Engineering',
        'B.Tech – Information Technology',
        'B.Tech – Mechanical Engineering'
    ],
    'UG Programmes': [
        'B.Des',
        'B.Arch',
        'B.Sc. (Hons.) Agriculture',
        'B.Sc. Hospitality and Hotel Administration',
        'B.Sc. Computer Science',
        'B.Sc. Multimedia & Animation',
        'B.Sc. Visual Communication',
        'B.B.A',
        'BBA (Financial Analytics) 2+2 Collaborative Degree',
        'B.Com',
        'B.Com – Business Process Services',
        'B.Com – Banking and Capital Markets',
        'B.Com – Financial Technology',
        'B.C.A'
    ],
    'Integrated Programmes': [
        'Integrated M.Tech. Software Engineering',
        'Integrated M.Tech. CSE (Virtusa collaboration)',
        'Integrated M.Tech. CSE (Data Science)',
        'Integrated M.Sc. Biotechnology (5 Year)',
        'Integrated M.Sc. Food Science and Technology (5 Year)',
        'Integrated M.Sc. Computational Statistics and Data Analytics (5 Year)',
        'Integrated M.Sc. Physics (5 Year) with exit options',
        'Integrated M.Sc. Chemistry (5 Year) with exit options',
        'Integrated M.Sc. Mathematics (5 Year) with exit options'
    ],
    'PG Programmes': [
        'M.Tech. (Various Specializations)',
        'M.C.A',
        'M.Sc. (Various Specializations)',
        'M.Des'
    ]
};

const CourseSelection = ({ initialType, onSelect, onBack, currentSelection }) => {
    const [activeCategory, setActiveCategory] = useState(initialType || 'Engineering Programmes');
    const [selectedCourse, setSelectedCourse] = useState(currentSelection || null);

    const categories = Object.keys(COURSES);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '70vh',
            width: '100%',
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '40px 20px'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '8px'
                }}>
                    STEP 2 OF 3 – CHOOSE YOUR COURSE
                </h3>
            </div>

            {/* Category Tabs */}
            <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '48px',
                flexWrap: 'wrap'
            }}>
                {categories.map(cat => {
                    const isActive = activeCategory === cat;
                    const isEngineering = cat === 'Engineering Programmes';

                    return (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '12px 32px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                borderRadius: '50px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: isActive
                                    ? (isEngineering ? '#fbbf24' : '#1e3a8a')
                                    : '#f1f5f9',
                                color: isActive
                                    ? (isEngineering ? '#000' : '#fff')
                                    : '#64748b',
                                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* Course Grid */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginBottom: '48px',
                paddingBottom: '20px'
            }}>
                <AnimatePresence mode="wait">
                    {COURSES[activeCategory].map((course, idx) => {
                        const isSelected = selectedCourse === course;
                        return (
                            <motion.div
                                key={`${activeCategory}-${course}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.02 }}
                                onClick={() => setSelectedCourse(course)}
                                style={{
                                    padding: '24px',
                                    borderRadius: '12px',
                                    background: '#ffffff',
                                    border: isSelected ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    minHeight: '80px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isSelected
                                        ? '0 4px 12px rgba(59, 130, 246, 0.15)'
                                        : '0 1px 3px rgba(0,0,0,0.05)',
                                    transform: isSelected ? 'translateY(-2px)' : 'none'
                                }}
                            >
                                <span style={{
                                    fontSize: '0.95rem',
                                    fontWeight: isSelected ? '600' : '500',
                                    lineHeight: '1.5',
                                    color: '#1e293b'
                                }}>
                                    {course}
                                </span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        padding: '14px 40px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        borderRadius: '8px',
                        border: '2px solid #e2e8f0',
                        background: '#ffffff',
                        color: '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Back
                </button>
                <button
                    onClick={() => onSelect({ programmeType: activeCategory, courseName: selectedCourse })}
                    disabled={!selectedCourse}
                    style={{
                        padding: '14px 48px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        borderRadius: '8px',
                        border: 'none',
                        background: selectedCourse
                            ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                            : '#cbd5e1',
                        color: '#ffffff',
                        cursor: selectedCourse ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        opacity: selectedCourse ? 1 : 0.6
                    }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default CourseSelection;
