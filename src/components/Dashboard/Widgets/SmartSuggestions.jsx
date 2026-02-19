import React from 'react';
import { Lightbulb, Plus } from 'lucide-react';

const SmartSuggestions = ({ subjects, tasks, onAddTask }) => {
    // Generate Suggestions Logic
    const getSuggestions = () => {
        const suggestions = [];

        // 1. Check for "Behind" subjects
        const behindSubjects = subjects.filter(s => s.health === 'Behind');
        if (behindSubjects.length > 0) {
            suggestions.push({
                type: 'recovery',
                title: `Catch up on ${behindSubjects[0].subjectName}`,
                priority: 'high',
                reason: 'You are falling behind',
                subjectCode: behindSubjects[0].courseCode
            });
        }

        // 2. Check for upcoming Exams
        const upcomingExams = tasks.filter(t => t.type === 'exam' && !t.isCompleted);
        if (upcomingExams.length > 0) {
            const nextExam = upcomingExams[0];
            suggestions.push({
                type: 'revision',
                title: `Revise for ${nextExam.title}`,
                priority: 'high',
                reason: 'Exam coming up soon',
                subjectCode: nextExam.subjectCode
            });
        }

        // 3. General upkeep (if not too many heavy suggestions)
        if (suggestions.length < 3) {
            const onTrackSubject = subjects.find(s => s.health === 'On Track');
            if (onTrackSubject) {
                suggestions.push({
                    type: 'review',
                    title: `Review notes for ${onTrackSubject.subjectName}`,
                    priority: 'medium',
                    reason: 'Maintain your streak',
                    subjectCode: onTrackSubject.courseCode
                });
            }
        }

        return suggestions.slice(0, 3);
    };

    const suggestions = getSuggestions();

    if (suggestions.length === 0) return null;

    return (
        <div className="widget-card" style={{ gridColumn: 'span 4' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={18} color="var(--accent-teal)" /> Smart Suggestions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {suggestions.map((suggestion, idx) => (
                    <div key={idx} style={{
                        padding: '12px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{suggestion.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{suggestion.reason}</div>
                        </div>
                        <button
                            onClick={() => onAddTask(suggestion)}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '6px',
                                cursor: 'pointer',
                                color: 'var(--accent-blue)'
                            }}
                            title="Add to Today's Plan"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SmartSuggestions;
