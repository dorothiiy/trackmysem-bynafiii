import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [density, setDensity] = useState(() => localStorage.getItem('density') || 'comfortable');
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.dataset.density = density;
        localStorage.setItem('density', density);
    }, [density]);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // Fetch user profile when token is set
            fetchUserProfile();
        } else {
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const fetchUserProfile = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                // Token invalid, clear it
                setToken(null);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        theme, setTheme,
        density, setDensity,
        user, setUser,
        token, setToken,
        loading,
        refreshUser: fetchUserProfile
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
