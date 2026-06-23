import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Car, User, LogOut, GitCompare, Menu, X, Sun, Moon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleLogout = async () => { await logout(); navigate('/login'); };
    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/cars',          label: 'Cars'       },
        { path: '/bikes',         label: 'Bikes'      },
        { path: '/heavy-duties',  label: 'Heavy Duty' },
        { path: '/compare',       label: 'Compare'    },
    ];

    return (
        <header
            className="app-navbar"
            style={{
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                transition: 'border-color 0.3s',
            }}
        >
            <div className="container d-flex align-items-center justify-content-between" style={{ height: 64 }}>

                {/* ── Logo ── */}
                <Link to="/" className="d-flex align-items-center gap-2" style={{ textDecoration: 'none' }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 16px rgba(249,115,22,0.4)',
                        flexShrink: 0,
                    }}>
                        <Car size={18} color="white" />
                    </div>
                    <span className="nav-logo-text">AutoSCM</span>
                </Link>

                {/* ── Desktop Nav Links ── */}
                <nav className="d-none d-lg-flex align-items-center gap-1" style={{ marginLeft: 32 }}>
                    {navLinks.map(({ path, label }) => (
                        <Link
                            key={path}
                            to={path}
                            style={{
                                padding: '0.45rem 1rem',
                                borderRadius: 8,
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: isActive(path) ? 'var(--primary)' : 'var(--text-secondary)',
                                background: isActive(path) ? 'rgba(249,115,22,0.08)' : 'transparent',
                                transition: 'all 0.2s',
                                textDecoration: 'none',
                            }}
                            onMouseEnter={e => { if (!isActive(path)) e.target.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { if (!isActive(path)) e.target.style.color = 'var(--text-secondary)'; }}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* ── Right Section ── */}
                <div className="d-none d-lg-flex align-items-center gap-3 ms-auto">

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`theme-toggle-btn ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark'
                            ? <Sun size={17} />
                            : <Moon size={17} />}
                    </button>

                    {/* Compare shortcut */}
                    <Link to="/compare" className="nav-icon-btn" title="Compare Vehicles" style={{ textDecoration: 'none' }}>
                        <GitCompare size={17} />
                    </Link>

                    {user ? (
                        <div className="d-flex align-items-center gap-3">
                            {user.role === 'ADMIN' && (
                                <Link to="/admin" style={{
                                    background: 'rgba(249,115,22,0.1)',
                                    border: '1px solid rgba(249,115,22,0.3)',
                                    color: 'var(--primary)',
                                    padding: '0.35rem 0.9rem',
                                    borderRadius: 6,
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                }}>Admin Panel</Link>
                            )}

                            <Link to="/dashboard" style={{
                                color: 'var(--text-primary)',
                                padding: '0.35rem 0.6rem',
                                borderRadius: 6,
                                fontSize: '0.88rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <User size={16} />
                                Dashboard
                            </Link>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #334155, #1e293b)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <User size={16} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {user.name}
                                </span>
                            </div>

                            <button onClick={handleLogout} className="nav-icon-btn" title="Logout">
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="btn-primary-solid" style={{ padding: '0.45rem 1.2rem', fontSize: '0.88rem' }}>
                            Login / Register
                        </button>
                    )}
                </div>

                {/* ── Mobile Menu Toggle ── */}
                <div className="d-lg-none d-flex align-items-center gap-2 ms-auto">
                    {/* Theme Toggle (mobile) */}
                    <button
                        onClick={toggleTheme}
                        className={`theme-toggle-btn ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}
                        title="Toggle theme"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
                    </button>
                    <button
                        className="nav-icon-btn"
                        onClick={() => setMobileOpen(o => !o)}
                    >
                        {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
                    </button>
                </div>
            </div>

            {/* ── Mobile Menu Drawer ── */}
            {mobileOpen && (
                <div style={{
                    position: 'absolute', top: 64, left: 0, right: 0,
                    background: 'rgba(10,13,20,0.98)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid var(--border)',
                    padding: '1rem',
                    zIndex: 999,
                }}>
                    {navLinks.map(({ path, label }) => (
                        <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={{
                            display: 'block',
                            padding: '0.75rem 1rem',
                            color: isActive(path) ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            borderRadius: 8,
                            background: isActive(path) ? 'rgba(249,115,22,0.08)' : 'transparent',
                            textDecoration: 'none',
                            marginBottom: 4,
                        }}>
                            {label}
                        </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
                                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => { navigate('/login'); setMobileOpen(false); }} className="btn-primary-solid w-100" style={{ fontSize: '0.9rem' }}>
                                Login / Register
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
