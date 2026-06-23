import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
    LayoutDashboard, Car, Users, Plus, Edit, Trash2, ShieldCheck,
    BarChart3, Package, Fuel, Zap, X, Calendar, Eye, CheckCircle,
    Tag, Upload, RefreshCw, AlertTriangle, Check
} from 'lucide-react';

/* ── helpers ───────────────────────────────────────────── */
const fmt = (n) => n ? `₹${(n / 100000).toFixed(1)}L` : '—';

const BADGE_COLORS = {
    Car: 'rgba(99,102,241,0.15)',
    Bike: 'rgba(16,185,129,0.15)',
    HeavyDuty: 'rgba(245,158,11,0.15)',
};
const BADGE_TEXT = {
    Car: '#818cf8',
    Bike: '#34d399',
    HeavyDuty: '#fbbf24',
};

/* ── Dark-themed sub-components ──────────────────────── */
const Panel = ({ children, style = {} }) => (
    <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden', ...style
    }}>
        {children}
    </div>
);

const StatCard = ({ icon, value, label, color }) => (
    <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8
    }}>
        <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: `${color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {React.cloneElement(icon, { size: 20, style: { color } })}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
);

const SidebarBtn = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} style={{
        width: '100%', padding: '0.7rem 1rem', border: 'none', borderRadius: 10, cursor: 'pointer',
        fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
        background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--text-secondary)',
        borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
    }}>
        {React.cloneElement(icon, { size: 18 })} {label}
    </button>
);

/* Dark modal */
const Modal = ({ title, onClose, children }) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 20, width: '100%', maxWidth: 580,
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto'
        }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontWeight: 800, color: '#fff' }}>{title}</h4>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                    <X size={20} />
                </button>
            </div>
            <div style={{ padding: '2rem' }}>{children}</div>
        </div>
    </div>
);

/* Dark input */
const DarkInput = ({ label, required, ...props }) => (
    <div style={{ marginBottom: '1rem' }}>
        {label && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}{required && ' *'}</label>}
        <input required={required} {...props} style={{
            width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '0.7rem 1rem', color: '#fff', fontFamily: 'inherit',
            fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
            ...(props.style || {})
        }} onFocus={e => e.target.style.borderColor = 'var(--border-active)'}
           onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
    </div>
);

const DarkSelect = ({ label, required, children, ...props }) => (
    <div style={{ marginBottom: '1rem' }}>
        {label && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}{required && ' *'}</label>}
        <select required={required} {...props} style={{
            width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '0.7rem 1rem', color: '#fff', fontFamily: 'inherit',
            fontSize: '0.9rem', outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s',
        }} onFocus={e => e.target.style.borderColor = 'var(--border-active)'}
           onBlur={e  => e.target.style.borderColor = 'var(--border)'}>
            {children}
        </select>
    </div>
);

const SubmitBtn = ({ label, loading, disabled }) => (
    <button type="submit" disabled={loading || disabled} className="btn-primary-solid" style={{
        width: '100%', padding: '0.85rem', fontSize: '0.95rem', borderRadius: 10,
        opacity: loading ? 0.7 : 1,
    }}>
        {loading ? 'Saving…' : label}
    </button>
);

/* ══════════════════════════════════════════════════════
   BRAND CRUD PANEL
══════════════════════════════════════════════════════ */
const BrandPanel = ({ vehicleTypes }) => {
    const [brands,        setBrands]        = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [showModal,     setShowModal]     = useState(false);
    const [editTarget,    setEditTarget]    = useState(null); // null = create
    const [saving,        setSaving]        = useState(false);
    const [uploadingId,   setUploadingId]   = useState(null);
    const [toast,         setToast]         = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [form, setForm] = useState({ name: '', vehicle_type_id: '' });

    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchBrands = useCallback(async () => {
        setLoading(true);
        try { setBrands((await api.get('/brands')).data); }
        catch { showToast('Failed to load brands', false); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchBrands(); }, [fetchBrands]);

    const openCreate = () => {
        setEditTarget(null);
        setForm({ name: '', vehicle_type_id: vehicleTypes[0]?.id || '' });
        setShowModal(true);
    };

    const openEdit = (b) => {
        setEditTarget(b);
        setForm({ name: b.name, vehicle_type_id: b.vehicle_type_id });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editTarget) {
                await api.put(`/brands/${editTarget.id}`, form);
                showToast('Brand updated!');
            } else {
                await api.post('/brands', form);
                showToast('Brand created!');
            }
            setShowModal(false);
            fetchBrands();
        } catch (err) {
            showToast(err.response?.data?.message || 'Save failed', false);
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/brands/${id}`);
            showToast('Brand deleted');
            fetchBrands();
        } catch (err) {
            showToast(err.response?.data?.message || 'Delete failed', false);
        } finally { setConfirmDelete(null); }
    };

    const handleLogoUpload = async (e, brandId) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingId(brandId);
        const fd = new FormData();
        fd.append('brand_logo', file);
        try {
            await api.post(`/brands/${brandId}/uploadLogo`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast('Logo updated!');
            fetchBrands();
        } catch { showToast('Logo upload failed', false); }
        finally { setUploadingId(null); }
    };

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 2000,
                    background: toast.ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    border: `1px solid ${toast.ok ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                    color: toast.ok ? '#4ade80' : '#f87171',
                    borderRadius: 10, padding: '0.75rem 1.25rem',
                    fontWeight: 600, fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                    {toast.ok ? <Check size={16}/> : <AlertTriangle size={16}/>} {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <div className="section-label">Brand Management</div>
                    <h2 style={{ color: '#fff', fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.5px' }}>
                        Vehicle Brands
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={fetchBrands} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
                        padding: '0.55rem 1rem', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600,
                    }}>
                        <RefreshCw size={15}/> Refresh
                    </button>
                    <button onClick={openCreate} className="btn-primary-solid" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Plus size={16}/> Add Brand
                    </button>
                </div>
            </div>

            {/* Brand table */}
            <Panel>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading brands…</div>
                ) : brands.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No brands yet. Click "Add Brand" to create one.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Logo', 'Brand Name', 'Category', 'Actions'].map((h, i) => (
                                    <th key={h} style={{
                                        padding: '1rem 1.25rem', fontSize: '0.72rem', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.8px',
                                        color: 'var(--text-muted)', textAlign: i === 3 ? 'right' : 'left'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {brands.map((b, idx) => (
                                <tr key={b.id} style={{
                                    borderBottom: idx < brands.length - 1 ? '1px solid var(--border)' : 'none',
                                    transition: 'background 0.15s',
                                }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    {/* Logo */}
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{
                                            width: 56, height: 40, borderRadius: 8,
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid var(--border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                        }}>
                                            {b.logo ? (
                                                <img
                                                    src={b.logo.startsWith('/public') ? `http://localhost:5000${b.logo}` : b.logo}
                                                    alt={b.name}
                                                    style={{ maxHeight: 36, maxWidth: 52, objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>NO IMG</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Name */}
                                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                                        {b.name}
                                    </td>

                                    {/* Type badge */}
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px',
                                            borderRadius: 50, background: BADGE_COLORS[b.type] || 'rgba(255,255,255,0.08)',
                                            color: BADGE_TEXT[b.type] || 'var(--text-secondary)',
                                        }}>
                                            {b.type}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                            {/* Logo Upload */}
                                            <label style={{
                                                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                                borderRadius: 7, padding: '0.4rem 0.85rem', cursor: 'pointer',
                                                fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)',
                                                display: 'flex', alignItems: 'center', gap: 5,
                                                opacity: uploadingId === b.id ? 0.5 : 1,
                                            }}>
                                                <Upload size={13}/>
                                                {uploadingId === b.id ? 'Uploading…' : 'Logo'}
                                                <input type="file" accept="image/*" hidden disabled={!!uploadingId}
                                                    onChange={e => handleLogoUpload(e, b.id)} />
                                            </label>

                                            {/* Edit */}
                                            <button onClick={() => openEdit(b)} style={{
                                                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                                                borderRadius: 7, padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#818cf8',
                                                display: 'flex', alignItems: 'center',
                                            }}>
                                                <Edit size={14}/>
                                            </button>

                                            {/* Delete */}
                                            <button onClick={() => setConfirmDelete(b)} style={{
                                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                                borderRadius: 7, padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#f87171',
                                                display: 'flex', alignItems: 'center',
                                            }}>
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Panel>

            {/* Create / Edit Modal */}
            {showModal && (
                <Modal title={editTarget ? `Edit — ${editTarget.name}` : 'Create New Brand'} onClose={() => setShowModal(false)}>
                    <form onSubmit={handleSave}>
                        <DarkInput label="Brand Name" required placeholder="e.g. Toyota" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} />

                        <DarkSelect label="Vehicle Category" required value={form.vehicle_type_id}
                            onChange={e => setForm({ ...form, vehicle_type_id: e.target.value })}>
                            <option value="">Select category</option>
                            {vehicleTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </DarkSelect>

                        <div style={{ marginTop: '1.5rem' }}>
                            <SubmitBtn label={editTarget ? 'Save Changes' : 'Create Brand'} loading={saving} />
                        </div>
                    </form>
                </Modal>
            )}

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <Modal title="Delete Brand" onClose={() => setConfirmDelete(null)}>
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.25)', margin: '0 auto 1.25rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <AlertTriangle size={24} style={{ color: '#f87171' }}/>
                        </div>
                        <h4 style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>Delete "{confirmDelete.name}"?</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
                            This will permanently delete the brand and its logo image. All linked models and vehicles may be affected.
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setConfirmDelete(null)} style={{
                                flex: 1, padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 10, color: 'var(--text-secondary)', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer'
                            }}>
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(confirmDelete.id)} style={{
                                flex: 1, padding: '0.75rem', background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, color: '#f87171',
                                fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer'
                            }}>
                                Delete Brand
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   ADMIN DASHBOARD (main)
══════════════════════════════════════════════════════ */
const AdminDashboard = () => {
    const [activeTab, setActiveTab]   = useState('dashboard');
    const [stats,     setStats]       = useState({ users: 0, vehicles: 0, categories: [], mostViewed: [], mostCompared: [], mostBooked: [] });
    const [users,     setUsers]       = useState([]);
    const [vehicles,  setVehicles]    = useState([]);
    const [bookings,  setBookings]    = useState([]);
    const [metadata,  setMetadata]    = useState({ types: [], brands: [], models: [] });

    const [showVModal, setShowVModal] = useState(false);
    const [editMode,   setEditMode]   = useState(false);
    const [currentId,  setCurrentId]  = useState(null);
    const [uploading,  setUploading]  = useState(false);
    const [saving,     setSaving]     = useState(false);
    const [formData,   setFormData]   = useState({
        model_id: '', fuel_type: '', price: '', engine: '',
        mileage: '', transmission: '', seating_capacity: '', description: '', image_url: ''
    });

    useEffect(() => {
        api.get('/vehicles/dashboard/stats').then(r => setStats(r.data)).catch(() => {});
        api.get('/vehicles/metadata').then(r => setMetadata(r.data)).catch(() => {});
        api.get('/users').then(r => setUsers(r.data)).catch(() => {});
        api.get('/vehicles').then(r => setVehicles(r.data)).catch(() => {});
        api.get('/bookings').then(r => setBookings(r.data)).catch(() => {});
    }, []);

    const refreshVehicles = () => {
        api.get('/vehicles').then(r => setVehicles(r.data)).catch(() => {});
        api.get('/vehicles/dashboard/stats').then(r => setStats(r.data)).catch(() => {});
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this vehicle variant?')) return;
        api.delete(`/vehicles/${id}`).then(refreshVehicles).catch(console.error);
    };

    const handleEdit = (v) => {
        setFormData({ model_id: v.model_id, fuel_type: v.fuel_type, price: v.price, engine: v.engine, mileage: v.mileage, transmission: v.transmission, seating_capacity: v.seating_capacity, description: v.description, image_url: v.variant_image || '' });
        setEditMode(true); setCurrentId(v.id); setShowVModal(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('image', file);
        try {
            const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormData(prev => ({ ...prev, image_url: `http://localhost:5000${res.data.url}` }));
        } catch {}
        finally { setUploading(false); }
    };

    const handleVSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editMode) await api.put(`/vehicles/${currentId}`, formData);
            else          await api.post('/vehicles', formData);
            setShowVModal(false); refreshVehicles();
            setFormData({ model_id: '', fuel_type: '', price: '', engine: '', mileage: '', transmission: '', seating_capacity: '', description: '', image_url: '' });
            setEditMode(false); setCurrentId(null);
        } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleBookingStatus = (id, status) =>
        api.put(`/bookings/${id}/status`, { status })
           .then(() => api.get('/bookings').then(r => setBookings(r.data)));

    const TABS = [
        { key: 'dashboard', label: 'Dashboard',   icon: <LayoutDashboard/> },
        { key: 'vehicles',  label: 'Vehicles',     icon: <Car/>             },
        { key: 'brands',    label: 'Brands',       icon: <Tag/>             },
        { key: 'users',     label: 'Users',        icon: <Users/>           },
        { key: 'bookings',  label: 'Bookings',     icon: <Calendar/>        },
    ];

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', padding: '2rem 0' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

                    {/* ── Sidebar ───────────────────────────────── */}
                    <div style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 16, padding: '1.25rem', position: 'sticky', top: 80
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem', padding: '0.25rem 0.5rem' }}>
                            <ShieldCheck size={20} style={{ color: 'var(--primary)' }}/>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Admin Panel</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {TABS.map(({ key, label, icon }) => (
                                <SidebarBtn key={key} active={activeTab === key} icon={icon} label={label} onClick={() => setActiveTab(key)} />
                            ))}
                        </div>
                    </div>

                    {/* ── Content ──────────────────────────────── */}
                    <div>

                        {/* === DASHBOARD === */}
                        {activeTab === 'dashboard' && (
                            <div>
                                <div className="section-label mb-1">Overview</div>
                                <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Dashboard</h2>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                    <StatCard icon={<Users/>}   value={stats.users}    label="Total Users"    color="#818cf8" />
                                    <StatCard icon={<Package/>} value={stats.vehicles} label="Vehicles"       color="#34d399" />
                                    <StatCard icon={<Tag/>}     value={stats.categories?.length || 0} label="Categories" color="var(--primary)" />
                                </div>

                                <Panel style={{ marginBottom: '2rem' }}>
                                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 700, color: '#fff' }}>Category Breakdown</div>
                                    <div style={{ padding: '1.5rem' }}>
                                        {stats.categories?.map(cat => (
                                            <div key={cat.name} style={{ marginBottom: '1.25rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                                                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cat.name}</span>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{cat.count} Units</span>
                                                </div>
                                                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%', borderRadius: 3,
                                                        background: 'linear-gradient(90deg, var(--primary), #fb923c)',
                                                        width: `${(cat.count / Math.max(1, stats.vehicles)) * 100}%`,
                                                        transition: 'width 0.6s ease'
                                                    }}/>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Panel>

                                {/* Top performers */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    {[
                                        { title: 'Most Viewed',   data: stats.mostViewed,   suffix: 'views',    icon: <Eye/>,        color: '#818cf8' },
                                        { title: 'Most Compared', data: stats.mostCompared, suffix: 'compares', icon: <BarChart3/>,  color: '#fbbf24' },
                                        { title: 'Most Booked',   data: stats.mostBooked,   suffix: 'bookings', icon: <CheckCircle/>,color: '#34d399'  },
                                    ].map(({ title, data, suffix, icon, color }) => (
                                        <Panel key={title}>
                                            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {React.cloneElement(icon, { size: 16, style: { color } })}
                                                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>{title}</span>
                                            </div>
                                            <div style={{ padding: '1rem 1.25rem' }}>
                                                {data?.length > 0 ? data.map((v, i) => (
                                                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 10 }}>
                                                        <span style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '0.8rem', width: 20 }}>#{i+1}</span>
                                                        <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.brand_name} {v.model_name}</span>
                                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, background: `${color}20`, color, borderRadius: 50, padding: '2px 8px', whiteSpace: 'nowrap' }}>{v.action_count} {suffix}</span>
                                                    </div>
                                                )) : <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No data yet</div>}
                                            </div>
                                        </Panel>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* === VEHICLES === */}
                        {activeTab === 'vehicles' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div className="section-label mb-1">Vehicle Management</div>
                                        <h2 style={{ color: '#fff', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Vehicles</h2>
                                    </div>
                                    <button onClick={() => { setEditMode(false); setCurrentId(null); setShowVModal(true); }} className="btn-primary-solid" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Plus size={16}/> Add Vehicle
                                    </button>
                                </div>

                                <Panel>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                {['Model & Brand', 'Fuel', 'Price', 'Engine', 'Actions'].map((h, i) => (
                                                    <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehicles.map((v, idx) => (
                                                <tr key={v.id} style={{ borderBottom: idx < vehicles.length-1 ? '1px solid var(--border)' : 'none' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '1rem 1.25rem' }}>
                                                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{v.brand_name}</div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.model_name}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.25rem' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(249,115,22,0.12)', color: 'var(--primary)', borderRadius: 50, padding: '3px 10px' }}>{v.fuel_type}</span>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{fmt(v.price)}</td>
                                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{v.engine || '—'}</td>
                                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                            <button onClick={() => handleEdit(v)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 7, padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center' }}><Edit size={14}/></button>
                                                            <button onClick={() => handleDelete(v.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center' }}><Trash2 size={14}/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Panel>
                            </div>
                        )}

                        {/* === BRANDS === */}
                        {activeTab === 'brands' && (
                            <BrandPanel vehicleTypes={metadata.types} />
                        )}

                        {/* === USERS === */}
                        {activeTab === 'users' && (
                            <div>
                                <div className="section-label mb-1">User Management</div>
                                <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Registered Users</h2>
                                <Panel>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                {['Name', 'Email', 'Role', 'Joined'].map((h, i) => (
                                                    <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u, idx) => (
                                                <tr key={u.id} style={{ borderBottom: idx < users.length-1 ? '1px solid var(--border)' : 'none' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#fff' }}>{u.name}</td>
                                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                                                    <td style={{ padding: '1rem 1.25rem' }}>
                                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: u.role === 'ADMIN' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.1)', color: u.role === 'ADMIN' ? '#f87171' : '#4ade80' }}>{u.role}</span>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Panel>
                            </div>
                        )}

                        {/* === BOOKINGS === */}
                        {activeTab === 'bookings' && (
                            <div>
                                <div className="section-label mb-1">Booking Management</div>
                                <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Manage Bookings</h2>
                                <Panel>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                {['Customer', 'Vehicle', 'Date', 'Status', 'Update'].map((h, i) => (
                                                    <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((b, idx) => (
                                                <tr key={b.id} style={{ borderBottom: idx < bookings.length-1 ? '1px solid var(--border)' : 'none' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '1rem 1.25rem' }}>
                                                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{b.user_name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user_email}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{b.brand_name} {b.model_name}</td>
                                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(b.booking_date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '1rem 1.25rem' }}>
                                                        <span style={{
                                                            fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50,
                                                            background: b.status === 'CONFIRMED' ? 'rgba(34,197,94,0.1)' : b.status === 'CANCELLED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                                            color: b.status === 'CONFIRMED' ? '#4ade80' : b.status === 'CANCELLED' ? '#f87171' : '#fbbf24',
                                                        }}>{b.status}</span>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                                        <select value={b.status} onChange={e => handleBookingStatus(b.id, e.target.value)} style={{
                                                            background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                                                            borderRadius: 7, padding: '0.35rem 0.65rem', fontFamily: 'inherit', fontSize: '0.78rem', cursor: 'pointer', outline: 'none'
                                                        }}>
                                                            <option value="PENDING">Pending</option>
                                                            <option value="CONFIRMED">Confirm</option>
                                                            <option value="CANCELLED">Cancel</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Panel>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Vehicle Add/Edit Modal */}
            {showVModal && (
                <Modal title={editMode ? 'Edit Vehicle Variant' : 'Add New Vehicle'} onClose={() => setShowVModal(false)}>
                    <form onSubmit={handleVSubmit}>
                        <DarkSelect label="Model" required value={formData.model_id} onChange={e => setFormData({ ...formData, model_id: e.target.value })}>
                            <option value="">Select model</option>
                            {metadata.models.map(m => (
                                <option key={m.id} value={m.id}>
                                    {metadata.brands.find(b => b.id === m.brand_id)?.name} {m.name}
                                </option>
                            ))}
                        </DarkSelect>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                            <DarkInput label="Fuel Type"  required placeholder="e.g. Petrol" value={formData.fuel_type} onChange={e => setFormData({ ...formData, fuel_type: e.target.value })} />
                            <DarkInput label="Price (₹)" type="number" required placeholder="e.g. 1500000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            <DarkInput label="Engine"    required placeholder="e.g. 1.5L VTEC" value={formData.engine} onChange={e => setFormData({ ...formData, engine: e.target.value })} />
                            <DarkInput label="Mileage"   required placeholder="e.g. 18.5 km/l" value={formData.mileage} onChange={e => setFormData({ ...formData, mileage: e.target.value })} />
                            <DarkInput label="Seating"   type="number" required placeholder="e.g. 5" value={formData.seating_capacity} onChange={e => setFormData({ ...formData, seating_capacity: e.target.value })} />
                            <DarkSelect label="Transmission" required value={formData.transmission} onChange={e => setFormData({ ...formData, transmission: e.target.value })}>
                                <option value="">Select</option>
                                <option>Manual</option><option>Automatic</option>
                            </DarkSelect>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehicle Image</label>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 8,
                                padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600,
                            }}>
                                <Upload size={16}/> {uploading ? 'Uploading…' : 'Choose image to upload'}
                                <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                            </label>
                            {formData.image_url && (
                                <img src={formData.image_url} alt="Preview" style={{ height: 80, borderRadius: 8, marginTop: 8, objectFit: 'cover' }} />
                            )}
                        </div>

                        <DarkInput label="Description" placeholder="Vehicle details…" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

                        <div style={{ marginTop: '1rem' }}>
                            <SubmitBtn label={editMode ? 'Update Vehicle' : 'Save Vehicle'} loading={saving || uploading} />
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboard;
