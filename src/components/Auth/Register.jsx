import React, { useState } from 'react';
import { UserPlus, ArrowRight, GraduationCap, ChevronLeft } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import CourseSelection from './CourseSelection';

const Register = ({ onAuthClick }) => {
    const { setToken, setUser } = useApp();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        programmeType: 'Engineering Programmes',
        courseName: '',
        programmeSlug: ''
    });

    // Helper to generate slug from programme name
    const generateSlug = (programmeName) => {
        return programmeName
            .toLowerCase()
            .replace(/[–—]/g, '-')
            .replace(/\s+/g, '_')
            .replace(/[()]/g, '')
            .replace(/&/g, 'and')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .substring(0, 50);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
        }
    };

    const handleCourseSelect = async (data) => {
        const slug = generateSlug(data.courseName);
        const registrationData = {
            ...formData,
            ...data,
            programmeSlug: slug
        };

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            });

            if (response.ok) {
                const { token, user } = await response.json();
                setToken(token);
                setUser(user);
            } else {
                const error = await response.json();
                alert(error.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: step === 2 ? '#f8fafc' : 'var(--bg-primary)' }}>
            <div className={step === 2 ? '' : 'widget-card'} style={{ width: '100%', maxWidth: step === 1 ? '440px' : '100%', padding: step === 1 ? '40px' : '0', transition: 'all 0.4s ease' }}>
                {step === 1 && (
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ background: 'var(--accent-purple)', color: 'white', padding: '12px', borderRadius: '16px', display: 'inline-flex', marginBottom: '16px' }}>
                            <UserPlus size={32} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Create Account</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Join TrackMySem to start your journey.</p>
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '52px' }} disabled={loading}>
                                {loading ? 'Creating...' : 'Continue'} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </form>
                ) : (
                    <CourseSelection
                        initialType={formData.programmeType}
                        currentSelection={formData.courseName}
                        onBack={() => setStep(1)}
                        onSelect={handleCourseSelect}
                    />
                )}

                {step === 1 && (
                    <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
                        <button
                            style={{ color: 'var(--accent-blue)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => onAuthClick('login')}
                        >
                            Sign in
                        </button>
                    </div>
                )}
            </div>

            {step === 2 && (
                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
                    <button
                        style={{ color: 'var(--accent-blue)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => onAuthClick('login')}
                    >
                        Sign in
                    </button>
                </div>
            )}
        </div>
    );
};

export default Register;
