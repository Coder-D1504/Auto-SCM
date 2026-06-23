import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import api from '../services/api';
import { io } from 'socket.io-client';
import { GitCompare, Plus, X, Search, ChevronRight } from 'lucide-react';

/* ─── spec row definitions ───────────────────────── */
const SPEC_ROWS = [
    { label: 'Type',         key: 'type_name'        },
    { label: 'Price',        key: 'price',            format: v => v ? `₹ ${Number(v).toLocaleString()}` : '—' },
    { label: 'Engine',       key: 'engine'            },
    { label: 'Mileage',      key: 'mileage'           },
    { label: 'Fuel Type',    key: 'fuel_type'         },
    { label: 'Transmission', key: 'transmission'      },
    { label: 'Seating',      key: 'seating_capacity', format: v => v ? `${v} Seats` : '—' },
];

/* ─── theme-aware inline styles ──────────────────── */
const S = {
    page:         { background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: '5rem', transition: 'background 0.3s' },
    breadcrumbBar:{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.6rem 0', marginBottom: '2rem' },
    breadcrumbLink:{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' },
    breadcrumbCurrent:{ color: 'var(--text-muted)', fontSize: '0.85rem' },
    title:        { color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', letterSpacing: '-0.5px' },
    subtitle:     { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 0 },
    searchWrap:   { position: 'relative', maxWidth: 500, zIndex: 100 },
    searchBox:    {
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 50, padding: '0.6rem 1.25rem',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    searchInput:  {
        background: 'transparent', border: 'none', outline: 'none',
        color: 'var(--text-primary)', fontFamily: 'inherit',
        fontSize: '0.95rem', width: '100%',
    },
    dropdown:     {
        position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 1000,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
    },
    dropdownItem: {
        width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
        padding: '0.75rem 1.25rem', textAlign: 'left', fontFamily: 'inherit',
        fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)',
        borderBottom: '1px solid var(--border)', transition: 'background 0.15s, color 0.15s',
        display: 'flex', alignItems: 'center', gap: 8,
    },
    noResult:     { padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' },
    tableWrap:    {
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    },
    table:        { width: '100%', borderCollapse: 'collapse' },
    thLabel:      {
        padding: '1.25rem 1.5rem', width: 210, verticalAlign: 'bottom',
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-card)',
    },
    thLabelText:  { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)' },
    thVehicle:    {
        padding: '1.25rem', textAlign: 'center',
        borderRight: '1px solid var(--border)', position: 'relative',
        verticalAlign: 'top', background: 'var(--bg-surface)',
    },
    thEmpty:      {
        padding: '1.25rem', textAlign: 'center', verticalAlign: 'middle',
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-card)', opacity: 0.5,
    },
    removeBtn:    {
        position: 'absolute', top: 10, right: 10,
        width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: 'rgba(239,68,68,0.1)', color: '#f87171',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
    },
    brandBadge:   { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--primary)', marginBottom: 4 },
    vehicleName:  { fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: 4 },
    fuelTag:      { fontSize: '0.72rem', fontWeight: 700, background: 'rgba(249,115,22,0.1)', color: 'var(--primary)', borderRadius: 50, padding: '2px 10px', display: 'inline-block' },
    specLabelCell:{ padding: '1rem 1.5rem', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', verticalAlign: 'middle' },
    specLabel:    { fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' },
    specValueCell:{ padding: '1rem 1.25rem', textAlign: 'center', borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.92rem' },
    specEmptyCell:{ padding: '1rem 1.25rem', textAlign: 'center', borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', opacity: 0.4, background: 'var(--bg-card)' },
    emptyState:   {
        textAlign: 'center', padding: '5rem 2rem',
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    },
    emptyIcon:    { color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1.25rem' },
    emptyTitle:   { fontWeight: 800, fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: 8 },
    emptyText:    { color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 360, margin: '0 auto 1.5rem' },
    addCircle:    {
        width: 52, height: 52, borderRadius: '50%', margin: '0 auto 8px',
        border: '2px dashed var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)',
    },
    addLabel:     { fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 },
};

/* ══════════════════════════════════════════════════
   COMPARISON PAGE
══════════════════════════════════════════════════ */
const Comparison = () => {
    const [, setSearchParams] = useSearchParams();
    const [vehicles,    setVehicles]    = useState([]);
    const [allMetadata, setAllMetadata] = useState({ types: [], brands: [], models: [] });
    const [searchTerm,  setSearchTerm]  = useState('');
    const [showDropdown,setShowDropdown]= useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);

    const { compareIds, setCompareIds } = useCompare();
    const ids       = compareIds.map(String);
    const idsString = ids.join(',');

    const socketRef    = React.useRef(null);
    const sessionIdRef = React.useRef(null);
    const searchRef    = React.useRef(null);

    /* WebSocket setup */
    useEffect(() => {
        let sessionId = localStorage.getItem('compareSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('compareSessionId', sessionId);
        }
        sessionIdRef.current = sessionId;
        socketRef.current = io('http://localhost:5000');
        socketRef.current.on('connect', () => socketRef.current.emit('join_session', sessionId));
        socketRef.current.on('compare_updated', (newIds) => setCompareIds(newIds));
        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, [setCompareIds]);

    /* Sync IDs → URL */
    useEffect(() => { setSearchParams({ ids: idsString }); }, [idsString, setSearchParams]);

    /* Fetch metadata */
    useEffect(() => {
        api.get('/vehicles/metadata').then(r => setAllMetadata(r.data)).catch(console.error);
    }, []);

    /* Fetch comparison data */
    useEffect(() => {
        if (!idsString) { setVehicles([]); return; }
        api.get('/vehicles/compare', { params: { ids: idsString } })
           .then(r => setVehicles(r.data)).catch(console.error);
    }, [idsString]);

    /* Close dropdown on outside click */
    useEffect(() => {
        const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const removeVehicle = (id) => {
        const newIds = ids.filter(v => v !== id.toString());
        setCompareIds(newIds);
        if (socketRef.current) socketRef.current.emit('update_compare', { sessionId: sessionIdRef.current, ids: newIds });
    };

    const addVehicle = (id) => {
        if (ids.includes(id.toString())) return;
        if (ids.length >= 4) { alert('Maximum 4 vehicles can be compared at once.'); return; }
        const newIds = [...ids, id.toString()];
        setCompareIds(newIds);
        if (socketRef.current) socketRef.current.emit('update_compare', { sessionId: sessionIdRef.current, ids: newIds });
        setSearchTerm(''); setShowDropdown(false);
    };

    const filteredModels = allMetadata.models.filter(m => {
        const brand = allMetadata.brands.find(b => b.id === m.brand_id);
        return `${brand?.name} ${m.name}`.toLowerCase().includes(searchTerm.toLowerCase());
    }).slice(0, 6);

    const emptySlots = Math.max(0, 4 - vehicles.length);

    return (
        <div style={S.page}>

            {/* Breadcrumb */}
            <div style={S.breadcrumbBar}>
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol style={{ display: 'flex', gap: 8, margin: 0, padding: 0, listStyle: 'none', alignItems: 'center' }}>
                            <li><Link to="/" style={S.breadcrumbLink}>Home</Link></li>
                            <li style={{ color: 'var(--border)' }}><ChevronRight size={14}/></li>
                            <li style={S.breadcrumbCurrent}>Compare Vehicles</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div className="section-label mb-2 animate-fade-up">Side-by-Side</div>
                    <h1 style={S.title} className="animate-fade-up animate-delay-1">Compare Vehicles</h1>
                    <p style={S.subtitle} className="animate-fade-up animate-delay-1">
                        Compare up to 4 vehicles on price, engine, mileage and more.
                    </p>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '2.5rem', position: 'relative', zIndex: 10 }} className="animate-fade-up animate-delay-2">
                    <div style={S.searchWrap} ref={searchRef}>
                        <div
                            style={S.searchBox}
                            className="search-focus-ring"
                            onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                            onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)';        e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <Search size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }}/>
                            <input
                                style={S.searchInput}
                                type="text"
                                placeholder={ids.length >= 4 ? 'Maximum 4 vehicles selected' : 'Search brand or model to add…'}
                                value={searchTerm}
                                disabled={ids.length >= 4}
                                onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                            />
                            {searchTerm && (
                                <button onClick={() => { setSearchTerm(''); setShowDropdown(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}>
                                    <X size={15}/>
                                </button>
                            )}
                        </div>

                        {showDropdown && searchTerm && (
                            <div style={S.dropdown}>
                                {filteredModels.length > 0 ? filteredModels.map(m => {
                                    const brand = allMetadata.brands.find(b => b.id === m.brand_id);
                                    const alreadyAdded = ids.includes(m.variant_id.toString());
                                    return (
                                        <button
                                            key={m.variant_id}
                                            onClick={() => addVehicle(m.variant_id)}
                                            disabled={alreadyAdded}
                                            style={{
                                                ...S.dropdownItem,
                                                background: hoveredItem === m.variant_id ? 'var(--bg-card-hover)' : 'transparent',
                                                color: alreadyAdded ? 'var(--text-muted)' : hoveredItem === m.variant_id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                cursor: alreadyAdded ? 'default' : 'pointer',
                                            }}
                                            onMouseEnter={() => setHoveredItem(m.variant_id)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                        >
                                            <Plus size={14} style={{ color: alreadyAdded ? 'var(--text-muted)' : 'var(--primary)', flexShrink: 0 }}/>
                                            <span style={{ fontWeight: 600 }}>{brand?.name} {m.name}</span>
                                            {alreadyAdded && <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Already added</span>}
                                        </button>
                                    );
                                }) : (
                                    <div style={S.noResult}>No matching vehicles found</div>
                                )}
                            </div>
                        )}
                    </div>

                    {ids.length > 0 && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {ids.length} of 4 vehicles selected
                            {ids.length >= 4 && <span style={{ color: 'var(--primary)', marginLeft: 6, fontWeight: 700 }}>· Maximum reached</span>}
                        </div>
                    )}
                </div>

                {/* Comparison Table or Empty State */}
                {ids.length > 0 ? (
                    <div style={S.tableWrap} className="animate-fade-up animate-delay-2">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={S.table}>
                                <thead>
                                    <tr>
                                        {/* Label column */}
                                        <th style={S.thLabel}>
                                            <span style={S.thLabelText}>Specification</span>
                                        </th>

                                        {/* Vehicle columns */}
                                        {vehicles.map(v => (
                                            <th key={v.id} style={S.thVehicle}>
                                                <button
                                                    onClick={() => removeVehicle(v.id)}
                                                    style={S.removeBtn}
                                                    title="Remove"
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.22)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                >
                                                    <X size={13}/>
                                                </button>
                                                <div style={S.brandBadge}>{v.brand_name}</div>
                                                <div style={S.vehicleName}>{v.model_name}</div>
                                                <span style={S.fuelTag}>{v.fuel_type}</span>
                                            </th>
                                        ))}

                                        {/* Empty slot columns */}
                                        {[...Array(emptySlots)].map((_, i) => (
                                            <th key={`e-${i}`} style={S.thEmpty}>
                                                <div style={S.addCircle}><Plus size={20}/></div>
                                                <div style={S.addLabel}>Add Vehicle</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {SPEC_ROWS.map(row => (
                                        <tr key={row.label}>
                                            <td style={S.specLabelCell}>
                                                <span style={S.specLabel}>{row.label}</span>
                                            </td>
                                            {vehicles.map(v => (
                                                <td key={v.id} style={{
                                                    ...S.specValueCell,
                                                    color: row.key === 'price' ? 'var(--primary)' : 'var(--text-primary)',
                                                    fontWeight: row.key === 'price' ? 800 : 600,
                                                }}>
                                                    {row.format ? row.format(v[row.key]) : (v[row.key] || '—')}
                                                </td>
                                            ))}
                                            {[...Array(emptySlots)].map((_, i) => (
                                                <td key={`ev-${i}`} style={S.specEmptyCell}>—</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={S.emptyState} className="animate-fade-up animate-delay-2">
                        <GitCompare size={52} style={S.emptyIcon}/>
                        <h4 style={S.emptyTitle}>Ready to Compare?</h4>
                        <p style={S.emptyText}>
                            Search for vehicles above and add up to 4 for a detailed side-by-side comparison.
                        </p>
                        <Link to="/" className="btn-primary-solid d-inline-flex align-items-center gap-2" style={{ textDecoration: 'none', padding: '0.7rem 1.75rem' }}>
                            Browse Vehicles
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comparison;
