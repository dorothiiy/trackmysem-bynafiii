import React, { useState } from 'react';
import { LogIn, ArrowRight, GraduationCap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Login = ({ onAuthClick }) => {
    const { setToken, setUser } = useApp();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call for now since server is being restarted
        setTimeout(() => {
            setToken('mock-token');
            setUser({ name: 'Test User', email: formData.email });
            setLoading(false);
        }, 1000);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="widget-card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '12px', borderRadius: '16px', display: 'inline-flex', marginBottom: '16px' }}>
                        <GraduationCap size={32} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to access your dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', marginTop: '12px' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
                    <button
                        style={{ color: 'var(--accent-blue)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => onAuthClick('register')}
                    >
                        Create one
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
