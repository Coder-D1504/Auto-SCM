import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, ShieldCheck, Mail, Lock, Car } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'USER' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const res = await login(formData.email, formData.password, formData.role);
            // Smart Redirect: Use the ACTUAL role from the server response
            navigate(res.user.role === 'ADMIN' ? '/admin' : '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally { setLoading(false); }
    };

    const inputStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        color: 'var(--text-primary)',
        padding: '0.7rem 1rem',
        width: '100%',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            position: 'relative',
        }}>
            {/* Background accent */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 70%)',
            }} />

            <div style={{
                width: '100%', maxWidth: 460, position: 'relative', zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 10,
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(249,115,22,0.4)',
                        }}>
                            <Car size={20} color="white" />
                        </div>
                        <span className="nav-logo-text" style={{ fontSize: '1.6rem' }}>AutoSCM</span>
                    </Link>
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '2.5rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>
                        Welcome back
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                        Sign in to access your vehicle dashboard
                    </p>

                    {/* Role Switcher */}
                    <div style={{
                        display: 'flex', background: 'var(--bg-card)',
                        border: '1px solid var(--border)', borderRadius: 10, padding: 4,
                        marginBottom: '1.5rem',
                    }}>
                        {[
                            { role: 'USER',  label: 'User',  Icon: User        },
                            { role: 'ADMIN', label: 'Admin', Icon: ShieldCheck  },
                        ].map(({ role, label, Icon }) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setFormData({ ...formData, role })}
                                style={{
                                    flex: 1, border: 'none', cursor: 'pointer',
                                    borderRadius: 7, padding: '0.6rem',
                                    fontWeight: 700, fontSize: '0.875rem',
                                    fontFamily: 'inherit',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all 0.2s',
                                    background: formData.role === role ? 'var(--primary)' : 'transparent',
                                    color: formData.role === role ? '#fff' : 'var(--text-secondary)',
                                    boxShadow: formData.role === role ? '0 4px 12px rgba(249,115,22,0.35)' : 'none',
                                }}
                            >
                                <Icon size={15}/> {label}
                            </button>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: 8, padding: '0.7rem 1rem', marginBottom: '1.25rem',
                            color: '#f87171', fontSize: '0.85rem', fontWeight: 500,
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input
                                    type="email" required
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--border-active)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)'; }}
                                    onBlur={e  => { e.target.style.borderColor = 'var(--border)';        e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input
                                    type="password" required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--border-active)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)'; }}
                                    onBlur={e  => { e.target.style.borderColor = 'var(--border)';        e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary-solid"
                            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', opacity: loading ? 0.7 : 1, borderRadius: 10 }}
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
