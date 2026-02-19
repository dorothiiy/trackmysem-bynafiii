import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDueString } from '../../../utils/productivity';

const NextBestActionCard = ({ task, onComplete, onStart }) => {
    if (!task) {
        return (
            <motion.div
                className="widget-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    gridColumn: 'span 8', // Takes up significant space
                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '180px'
                }}
            >
                <div style={{ textAlign: 'center', opacity: 0.7 }}>
                    <CheckCircle2 size={48} style={{ marginBottom: '16px', color: 'var(--success)' }} />
                    <h3>All caught up!</h3>
                    <p>Great job following your plan today.</p>
                </div>
            </motion.div>
        );
    }

    const isUrgent = new Date(task.dueDate) < new Date(new Date().setDate(new Date().getDate() + 1));

    return (
        <motion.div
            className="widget-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                gridColumn: 'span 8', // Wide card
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                border: isUrgent ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {isUrgent && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    color: 'var(--accent-red)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                }}>
                    <AlertCircle size={14} /> Due {formatDueString(task.dueDate)}
                </div>
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    opacity: 0.7,
                    marginBottom: '8px'
                }}>
                    Next Best Action
                </h4>

                <h2 style={{
                    fontSize: '1.8rem',
                    marginBottom: '8px',
                    background: 'linear-gradient(90deg, var(--text-primary), var(--text-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {task.title}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: 'var(--bg-tertiary)',
                        fontSize: '0.8rem'
                    }}>
                        {task.subjectName || task.subjectCode}
                    </span>
                    <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        • {task.type}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => onStart(task)}
                        style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        Start Now <ArrowRight size={18} />
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={() => onComplete(task.id)}
                        style={{ padding: '10px 20px' }}
                    >
                        Mark Done
                    </button>
                </div>
            </div>

            {/* Subtle background decoration */}
            <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                opacity: 0.05,
                transform: 'rotate(-15deg)'
            }}>
                <CheckCircle2 size={200} />
            </div>
        </motion.div>
    );
};

export default NextBestActionCard;
