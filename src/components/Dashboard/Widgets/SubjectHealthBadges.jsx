import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const SubjectHealthBadges = ({ status }) => {
    let color, icon, label;

    switch (status) {
        case 'Behind':
            color = 'var(--error)';
            icon = <XCircle size={14} />;
            label = 'Behind';
            break;
        case 'At Risk':
            color = 'var(--warning)';
            icon = <AlertTriangle size={14} />;
            label = 'At Risk';
            break;
        case 'On Track':
        default:
            color = 'var(--success)';
            icon = <CheckCircle size={14} />;
            label = 'On Track';
            break;
    }

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: `${color}20`, // 20% opacity
            color: color,
            fontSize: '0.75rem',
            fontWeight: '600',
            border: `1px solid ${color}40`
        }}>
            {icon}
            <span>{label}</span>
        </div>
    );
};

export default SubjectHealthBadges;
