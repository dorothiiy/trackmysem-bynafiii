import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './AppContext';

const SubjectContext = createContext();

export const useSubjects = () => useContext(SubjectContext);

export const SubjectProvider = ({ children }) => {
    const { user, token } = useApp();
    const [subjects, setSubjects] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE = 'http://localhost:3001/api';

    // Fetch subjects for a specific semester
    const fetchSubjects = async (semester) => {
        if (!user?.programmeSlug || !token) {
            return [];
        }

        const cacheKey = `${user.programmeSlug}-${semester}`;
        if (subjects[cacheKey]) {
            return subjects[cacheKey];
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE}/subjects?programme=${user.programmeSlug}&semester=${semester}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch subjects');
            }

            const data = await response.json();
            setSubjects(prev => ({ ...prev, [cacheKey]: data }));
            setLoading(false);
            return data;
        } catch (err) {
            console.error('Error fetching subjects:', err);
            setError(err.message);
            setLoading(false);
            return [];
        }
    };

    // Fetch available subjects (not in plan) for a semester
    const fetchAvailableSubjects = async (semester) => {
        if (!user?.programmeSlug || !token) {
            return [];
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE}/subjects/available?programme=${user.programmeSlug}&semester=${semester}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch available subjects');
            }

            const data = await response.json();
            setLoading(false);
            return data;
        } catch (err) {
            console.error('Error fetching available subjects:', err);
            setError(err.message);
            setLoading(false);
            return [];
        }
    };

    // Fetch all subjects for the user's programme
    const fetchAllSubjects = async () => {
        if (!user?.programmeSlug || !token) {
            return [];
        }

        const cacheKey = `${user.programmeSlug}-all`;
        if (subjects[cacheKey]) {
            return subjects[cacheKey];
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE}/subjects/by-programme/${user.programmeSlug}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch all subjects');
            }

            const data = await response.json();
            setSubjects(prev => ({ ...prev, [cacheKey]: data }));
            setLoading(false);
            return data;
        } catch (err) {
            console.error('Error fetching all subjects:', err);
            setError(err.message);
            setLoading(false);
            return [];
        }
    };

    // Clear cache
    const clearCache = () => {
        setSubjects({});
    };

    const value = {
        subjects,
        loading,
        error,
        fetchSubjects,
        fetchAvailableSubjects,
        fetchAllSubjects,
        clearCache
    };

    return <SubjectContext.Provider value={value}>{children}</SubjectContext.Provider>;
};
