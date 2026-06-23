import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import { 
    LayoutDashboard, 
    Calendar, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Settings, 
    Sparkles, 
    User as UserIcon,
    ArrowRight,
    Search,
    Heart,
    Eye
} from 'lucide-react';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [summary, setSummary] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingPrefs, setSavingPrefs] = useState(false);
    const [prefs, setPrefs] = useState({ preferred_fuel: '', budget_limit: '' });
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [summaryRes, bookingsRes, recRes] = await Promise.all([
                api.get('/users/dashboard-summary').catch(() => ({ data: null })),
                api.get('/bookings/my-bookings').catch(() => ({ data: [] })),
                api.get('/vehicles/recommendations').catch(() => ({ data: [] }))
            ]);
            
            setSummary(summaryRes.data);
            setBookings(bookingsRes.data);
            setRecommendations(recRes.data);
            if (summaryRes.data?.preferences) {
                setPrefs(summaryRes.data.preferences);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePreferences = async (e) => {
        e.preventDefault();
        setSavingPrefs(true);
        try {
            await api.put('/users/preferences', prefs);
            const recRes = await api.get('/vehicles/recommendations');
            setRecommendations(recRes.data);
            // Refresh summary to reflect changes
            const summaryRes = await api.get('/users/dashboard-summary');
            setSummary(summaryRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setSavingPrefs(false);
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'CONFIRMED': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: <CheckCircle size={14}/> };
            case 'CANCELLED': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: <XCircle size={14}/> };
            default: return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <Clock size={14}/> };
        }
    };

    if (loading) {
        return (
            <div className="container py-5 mt-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                <p className="text-muted fw-bold">Loading your personal dashboard...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { id: 'bookings', label: 'My Bookings', icon: <Calendar size={18} /> },
        { id: 'activity', label: 'Recent Activity', icon: <Eye size={18} /> },
        { id: 'preferences', label: 'Preferences', icon: <Settings size={18} /> },
    ];

    return (
        <div className="container py-5 animate-in fade-in">
            {/* ── Header ── */}
            <div className="row mb-5 align-items-end">
                <div className="col-md-8">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2 px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                        USER PORTAL
                    </span>
                    <h1 className="fw-800 display-5 mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                        My <span className="text-gradient">Dashboard</span>
                    </h1>
                    <p className="lead fw-medium mb-0" style={{ color: 'var(--text-secondary)' }}>Manage your bookings, track activity, and personalize your experience.</p>
                </div>
                <div className="col-md-4 text-md-end mt-4 mt-md-0">
                    <div className="d-inline-flex align-items-center gap-3 p-2 rounded-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <UserIcon color="white" size={24} />
                        </div>
                        <div className="text-start pe-3">
                            <p className="small fw-bold mb-0" style={{ color: 'var(--text-muted)' }}>Welcome back,</p>
                            <p className="fw-700 mb-0" style={{ color: 'var(--text-primary)' }}>User Account</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs Navigation ── */}
            <div className="d-flex flex-wrap gap-2 mb-4 p-2 rounded-4 border d-inline-flex sticky-top shadow-sm" style={{ top: '80px', zIndex: 100, backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn d-flex align-items-center gap-2 px-4 py-2 border-0 rounded-3 transition-all ${activeTab === tab.id ? 'btn-dark shadow-sm' : 'fw-bold'}`}
                        style={{ 
                            fontSize: '0.9rem', 
                            backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            <div className="row g-4">
                {/* ── Overview Tab ── */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards */}
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm p-4 rounded-4 bg-gradient-primary text-white position-relative overflow-hidden">
                                <div className="position-relative z-1">
                                    <p className="fw-bold small opacity-75 mb-1">TOTAL BOOKINGS</p>
                                    <h2 className="display-4 fw-800 mb-0">{summary?.stats?.totalBookings || 0}</h2>
                                    <div className="mt-4 pt-3 border-top border-white border-opacity-25 d-flex align-items-center gap-2 small fw-bold">
                                        <CheckCircle size={16} /> {summary?.stats?.confirmedBookings || 0} Confirmed
                                    </div>
                                </div>
                                <Calendar className="position-absolute opacity-10" size={140} style={{ right: -20, bottom: -20 }} />
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm p-4 rounded-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <div className="d-flex justify-content-between mb-4">
                                    <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                        <Sparkles size={24} />
                                    </div>
                                    <span className="badge h-fit px-2 py-1 rounded-pill fw-bold" style={{ fontSize: '0.65rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>ACTIVE PREFS</span>
                                </div>
                                <p className="fw-bold small mb-1" style={{ color: 'var(--text-muted)' }}>PREFERRED FUEL</p>
                                <h3 className="fw-800 mb-3" style={{ color: 'var(--text-primary)' }}>{summary?.preferences?.preferred_fuel || 'Not Set'}</h3>
                                <p className="small mb-0" style={{ color: 'var(--text-muted)' }}>
                                    Budget Limit: <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>₹ {summary?.preferences?.budget_limit?.toLocaleString() || 'Any'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm p-4 rounded-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <div className="d-flex justify-content-between mb-4">
                                    <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                                        <Eye size={24} />
                                    </div>
                                    <span className="badge h-fit px-2 py-1 rounded-pill fw-bold" style={{ fontSize: '0.65rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>HISTORY</span>
                                </div>
                                <p className="fw-bold small mb-1" style={{ color: 'var(--text-muted)' }}>RECENT ACTIVITY</p>
                                <h3 className="fw-800 mb-3" style={{ color: 'var(--text-primary)' }}>{summary?.recentActivity?.length || 0} <span className="small fw-600" style={{ color: 'var(--text-muted)' }}>Items</span></h3>
                                <button onClick={() => setActiveTab('activity')} className="btn btn-link p-0 text-decoration-none fw-bold small d-flex align-items-center gap-1" style={{ color: 'var(--primary)' }}>
                                    View Timeline <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Summary Lists */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <div className="card-header p-4 border-0 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Recent Bookings</h4>
                                    <button onClick={() => setActiveTab('bookings')} className="btn btn-sm px-3 py-1 rounded-3 fw-bold small" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>View All</button>
                                </div>
                                <div className="card-body p-0">
                                    {bookings.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="small" style={{ color: 'var(--text-muted)' }}>No recent bookings found.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0 align-middle">
                                                <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                                    <tr>
                                                        <th className="px-4 py-3 border-0 small fw-bold" style={{ color: 'var(--text-muted)' }}>VEHICLE</th>
                                                        <th className="px-4 py-3 border-0 small fw-bold" style={{ color: 'var(--text-muted)' }}>DATE</th>
                                                        <th className="px-4 py-3 border-0 small fw-bold text-end" style={{ color: 'var(--text-muted)' }}>STATUS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bookings.slice(0, 4).map(b => (
                                                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td className="px-4 py-3 border-0">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div className="rounded-3 overflow-hidden" style={{ width: 44, height: 32, backgroundColor: 'var(--bg-surface)' }}>
                                                                        {/* Vehicle miniature would go here */}
                                                                    </div>
                                                                    <div>
                                                                        <p className="fw-bold mb-0 text-truncate" style={{ maxWidth: 150, color: 'var(--text-primary)' }}>{b.brand_name} {b.model_name}</p>
                                                                        <span className="small" style={{ color: 'var(--text-muted)' }}>{b.fuel_type}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 border-0 small fw-medium" style={{ color: 'var(--text-secondary)' }}>
                                                                {new Date(b.booking_date).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-4 py-3 border-0 text-end">
                                                                <span 
                                                                    className="px-3 py-1 rounded-pill small fw-bold" 
                                                                    style={{ 
                                                                        backgroundColor: getStatusStyle(b.status).bg, 
                                                                        color: getStatusStyle(b.status).color 
                                                                    }}
                                                                >
                                                                    {b.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recommendations Sidebar */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <div className="card-body p-4">
                                    <h4 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                        <Sparkles size={20} className="text-warning" /> New Picks
                                    </h4>
                                    <div className="d-flex flex-column gap-3">
                                        {recommendations.slice(0, 3).map(v => (
                                            <div key={v.id} className="p-3 rounded-4 border shadow-sm transition-all hover-translate-y" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                                <p className="small fw-bold mb-1" style={{ color: 'var(--text-muted)' }}>{v.brand_name}</p>
                                                <h6 className="fw-700 mb-2" style={{ color: 'var(--text-primary)' }}>{v.model_name}</h6>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold" style={{ color: 'var(--primary)' }}>₹ {v.price?.toLocaleString()}</span>
                                                    <button onClick={() => window.location.href=`/vehicle/${v.id}`} className="btn btn-sm btn-dark rounded-circle p-1" style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                                                        <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {recommendations.length === 0 && <p className="small" style={{ color: 'var(--text-muted)' }}>Update preferences for better matches!</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Bookings Tab ── */}
                {activeTab === 'bookings' && (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>My Test Drive Bookings</h4>
                                <div className="position-relative">
                                    <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: 'var(--text-muted)' }} />
                                    <input type="text" className="form-control ps-5 rounded-pill small" placeholder="Search bookings..." style={{ width: 250, backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                </div>
                            </div>

                            {bookings.length === 0 ? (
                                <div className="text-center py-5">
                                    <Calendar size={48} className="mb-3 opacity-25" style={{ color: 'var(--text-muted)' }} />
                                    <h5 style={{ color: 'var(--text-primary)' }}>No bookings yet</h5>
                                    <p style={{ color: 'var(--text-secondary)' }}>Start by exploring our vehicle catalog!</p>
                                </div>
                            ) : (
                                <div className="row g-4">
                                    {bookings.map(b => (
                                        <div key={b.id} className="col-lg-4 col-md-6">
                                            <div className="card h-100 shadow-sm rounded-4 p-4 transition-all hover-primary-border" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="rounded-3 p-3 text-center" style={{ width: 64, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                                        <Calendar size={24} style={{ color: 'var(--text-primary)' }} />
                                                    </div>
                                                    <span 
                                                        className="px-3 py-1 rounded-pill small fw-800 border d-flex align-items-center gap-1"
                                                        style={{ 
                                                            backgroundColor: getStatusStyle(b.status).bg, 
                                                            color: getStatusStyle(b.status).color,
                                                            borderColor: getStatusStyle(b.status).color + '33'
                                                        }}
                                                    >
                                                        {getStatusStyle(b.status).icon} {b.status}
                                                    </span>
                                                </div>
                                                <p className="small fw-bold mb-1" style={{ color: 'var(--text-muted)' }}>#{b.id} • {b.fuel_type}</p>
                                                <h5 className="fw-800 mb-3" style={{ color: 'var(--text-primary)' }}>{b.brand_name} {b.model_name}</h5>
                                                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border)' }}>
                                                    <span className="fw-bold fs-5" style={{ color: 'var(--text-primary)' }}>₹ {b.price?.toLocaleString()}</span>
                                                    <button onClick={() => window.location.href=`/vehicle/${b.variant_id}`} className="btn btn-sm rounded-3 px-3 fw-bold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Details</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Activity Tab ── */}
                {activeTab === 'activity' && (
                    <div className="col-lg-8 mx-auto">
                        <div className="card border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h4>
                            {summary?.recentActivity?.length === 0 ? (
                                <p className="text-center py-5" style={{ color: 'var(--text-muted)' }}>No activity recorded yet.</p>
                            ) : (
                                <div className="timeline">
                                    {summary?.recentActivity?.map((act, idx) => (
                                        <div key={idx} className="d-flex gap-4 mb-4 position-relative timeline-item">
                                            <div className="timeline-icon d-flex flex-column align-items-center">
                                                <div className={`p-2 rounded-circle ${act.action === 'BOOK_TEST_DRIVE' ? 'bg-success' : 'bg-primary'} text-white z-1 shadow-sm`}>
                                                    {act.action === 'BOOK_TEST_DRIVE' ? <Calendar size={16} /> : <Eye size={16} />}
                                                </div>
                                                {idx < summary.recentActivity.length - 1 && <div className="timeline-line h-100" style={{ width: 2, marginTop: 4, backgroundColor: 'var(--border)' }}></div>}
                                            </div>
                                            <div className="flex-grow-1 pb-4">
                                                <p className="small fw-bold mb-0" style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(act.created_at).toLocaleDateString()} • {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className="p-3 rounded-4 mt-2 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                                    <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                                        {act.action === 'BOOK_TEST_DRIVE' ? 'Requested Test Drive' : 'Viewed Vehicle'}
                                                    </h6>
                                                    <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>{act.brand_name} {act.model_name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Preferences Tab ── */}
                {activeTab === 'preferences' && (
                    <div className="col-lg-6 mx-auto">
                        <div className="card border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <div className="text-center mb-4">
                                <div className="bg-primary-subtle text-primary p-3 rounded-circle d-inline-block mb-3">
                                    <Settings size={32} />
                                </div>
                                <h4 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Experience Preferences</h4>
                                <p className="small" style={{ color: 'var(--text-secondary)' }}>We'll use these to customize your recommendations.</p>
                            </div>

                            <form onSubmit={handleSavePreferences}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold small" style={{ color: 'var(--text-muted)' }}>PREFERRED FUEL TYPE</label>
                                    <div className="row g-2">
                                        {['Petrol', 'Diesel', 'Electric', 'CNG'].map(fuel => (
                                            <div className="col-6 col-md-3" key={fuel}>
                                                <input 
                                                    type="radio" 
                                                    className="btn-check" 
                                                    name="fuel-pref" 
                                                    id={`fuel-${fuel}`} 
                                                    checked={prefs.preferred_fuel === fuel}
                                                    onChange={() => setPrefs({...prefs, preferred_fuel: fuel})}
                                                />
                                                <label className="btn btn-outline-dark w-100 py-2 rounded-3 fw-bold small" style={{ borderColor: 'var(--border)', color: prefs.preferred_fuel === fuel ? '#fff' : 'var(--text-secondary)', backgroundColor: prefs.preferred_fuel === fuel ? 'var(--primary)' : 'transparent' }} htmlFor={`fuel-${fuel}`}>{fuel}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold small" style={{ color: 'var(--text-muted)' }}>MAXIMUM BUDGET (₹)</label>
                                    <div className="input-group">
                                        <span className="input-group-text border-end-0 fw-bold" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>₹</span>
                                        <input 
                                            type="number" 
                                            className="form-control border-start-0 ps-0 fw-bold" 
                                            placeholder="Enter amount"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                            value={prefs.budget_limit}
                                            onChange={e => setPrefs({...prefs, budget_limit: e.target.value})}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-between mt-2 px-1">
                                        <span className="small fw-bold" style={{ color: 'var(--text-muted)' }}>Current: ₹ {prefs.budget_limit || 'Any'}</span>
                                    </div>
                                </div>

                                <button type="submit" disabled={savingPrefs} className="btn w-100 py-3 rounded-4 fw-800 shadow-sm transition-all hover-translate-y" style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none' }}>
                                    {savingPrefs ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span> Saving...</>
                                    ) : (
                                        'Update Preferences'
                                    )}
                                </button>
                                
                                <div className="mt-3 text-center">
                                    <small className="fw-medium d-flex align-items-center justify-content-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                        <Sparkles size={12} className="text-warning" /> New recommendations will be generated instantly.
                                    </small>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                .text-gradient {
                    background: linear-gradient(135deg, var(--primary) 0%, #f97316 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .bg-gradient-primary {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                }
                .transition-all {
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hover-translate-y:hover {
                    transform: translateY(-4px);
                }
                .hover-primary-border:hover {
                    border-color: var(--primary) !important;
                    box-shadow: 0 10px 25px rgba(249, 115, 22, 0.08) !important;
                }
                .h-fit {
                    height: fit-content;
                }
                .fw-800 { font-weight: 800; }
                .fw-700 { font-weight: 700; }
                .fw-600 { font-weight: 600; }
                .timeline-item:last-child .timeline-line {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
