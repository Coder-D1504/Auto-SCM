import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCompare } from '../context/CompareContext';
import {
    Search, Car, Bike, Truck, Zap, Fuel, Gauge, Users,
    ArrowRight, ChevronDown, SlidersHorizontal, X
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────── */
const budgetBuckets = [
    { label: 'Under ₹5 Lakh', min: 0, max: 500000 },
    { label: '₹5L – ₹15L', min: 500000, max: 1500000 },
    { label: '₹15L – ₹30L', min: 1500000, max: 3000000 },
    { label: '₹30L – ₹50L', min: 3000000, max: 5000000 },
    { label: 'Over ₹50 Lakh', min: 5000000, max: 1e9 },
];

const CATEGORIES = [
    { key: '', label: 'All Vehicles', Icon: SlidersHorizontal },
    { key: 'Car', label: 'Cars', Icon: Car },
    { key: 'Bike', label: 'Bikes', Icon: Bike },
    { key: 'HeavyDuty', label: 'Heavy Duty', Icon: Truck },
];

const fmt = (n) => n ? `₹${(n / 100000).toFixed(1)}L` : '—';

/* ── ImageResolver ───────────────────────────────── */
const PLACEHOLDERS = {
    'Car': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800',
    'Bike': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    'HeavyDuty': 'https://images.unsplash.com/photo-1591768793355-74d7c86911b7?auto=format&fit=crop&q=80&w=800'
};

const VehicleImage = ({ vehicle }) => {
    const imageUrl = vehicle.variant_image || vehicle.model_image || vehicle.brand_image;
    const fallback = PLACEHOLDERS[vehicle.type_name] || PLACEHOLDERS['Car'];

    return (
        <div className="vehicle-card-image">
            <img
                src={imageUrl || fallback}
                alt={`${vehicle.brand_name} ${vehicle.model_name}`}
                loading="lazy"
                onError={(e) => { e.target.src = fallback; }}
            />
            <div className="vehicle-card-image-overlay" />
        </div>
    );
};

/* ── VehicleCard (internal) ───────────────────────── */
const VCard = ({ vehicle }) => {
    const { addCompare, compareIds } = useCompare();
    const added = compareIds.includes(vehicle.id) || compareIds.includes(vehicle.id.toString());
    return (
        <div className="vehicle-card animate-fade-up">
            <VehicleImage vehicle={vehicle} />
            <div className="vehicle-card-body">
                <span className="vehicle-brand-badge">{vehicle.brand_name}</span>
                <div className="vehicle-name">{vehicle.model_name}</div>
                <div className="vehicle-type-tag">{vehicle.type_name} · {vehicle.transmission}</div>
                <div className="vehicle-price">{fmt(vehicle.price)}</div>
                <div className="vehicle-price-sub">Ex-showroom price onwards</div>
                <div className="vehicle-spec-grid">
                    <div className="vehicle-spec-item"><Fuel size={14} className="vehicle-spec-icon" />{vehicle.fuel_type}</div>
                    <div className="vehicle-spec-item"><Zap size={14} className="vehicle-spec-icon" />{vehicle.engine || 'N/A'}</div>
                    <div className="vehicle-spec-item"><Gauge size={14} className="vehicle-spec-icon" />{vehicle.mileage || '16.5 kmpl'}</div>
                    <div className="vehicle-spec-item"><Users size={14} className="vehicle-spec-icon" />{vehicle.seating_capacity} Seats</div>
                </div>
            </div>
            <div className="vehicle-card-actions">
                <Link to={`/vehicle/${vehicle.id}`} className="btn-view-details">View Details</Link>
                <button onClick={(e) => addCompare(vehicle.id.toString(), e)} disabled={added}
                    className={`btn-compare ${added ? 'added' : ''}`}>
                    {added ? '✓ Added' : '+ Compare'}
                </button>
            </div>
        </div>
    );
};

/* ── SkeletonCard ─────────────────────────────────── */
const SkeletonCard = () => (
    <div className="vehicle-card">
        <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
        <div className="vehicle-card-body" style={{ gap: 12 }}>
            <div className="skeleton" style={{ height: 16, width: '40%' }} />
            <div className="skeleton" style={{ height: 22, width: '80%' }} />
            <div className="skeleton" style={{ height: 14, width: '55%' }} />
            <div className="skeleton" style={{ height: 32, width: '50%', marginTop: 8 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 14 }} />)}
            </div>
        </div>
        <div className="vehicle-card-actions">
            <div className="skeleton" style={{ height: 38, flex: 1 }} />
            <div className="skeleton" style={{ height: 38, width: 90 }} />
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════ */
const Home = ({ type: defaultType }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState([]);
    const [activeBrand, setActiveBrand] = useState('');

    /* filters */
    const [search, setSearch] = useState('');
    const [type, setType] = useState(defaultType || '');
    const [fuel, setFuel] = useState('');
    const [transmission, setTransmission] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [seating, setSeating] = useState('');
    const [budget, setBudget] = useState('');

    const searchRef = useRef(null);

    /* sync default type */
    useEffect(() => { setType(defaultType || ''); }, [defaultType]);

    /* fetch brands for the pill row */
    useEffect(() => {
        api.get('/vehicles/metadata').then(r => setBrands(r.data.brands || [])).catch(() => { });
    }, []);

    /* fetch vehicles */
    useEffect(() => {
        const timer = setTimeout(async () => {
            setLoading(true);

            let mn = minPrice, mx = maxPrice;
            if (budget) {
                const b = budgetBuckets.find(x => x.label === budget);
                if (b) { mn = b.min; mx = b.max; }
            }
            const brandName = brands.find(b => b.id.toString() === activeBrand)?.name || '';

            try {
                const res = await api.get('/vehicles', {
                    params: {
                        search: search || brandName,
                        type: type === 'All' ? '' : type,
                        fuel, transmission, seating,
                        minPrice: mn, maxPrice: mx,
                    }
                });
                setVehicles(res.data);
            } catch { }
            finally { setLoading(false); }
        }, 300);
        return () => clearTimeout(timer);
    }, [search, type, fuel, minPrice, maxPrice, transmission, seating, budget, activeBrand, brands]);

    const clearFilters = () => {
        setFuel(''); setTransmission(''); setMinPrice(''); setMaxPrice('');
        setSeating(''); setBudget(''); setActiveBrand('');
    };
    const activeFilterCount = [fuel, transmission, budget, seating, activeBrand].filter(Boolean).length;

    /* brand pills visible for selected type */
    const visibleBrands = brands.filter(b => !type || true); // show all; could filter by type_id

    return (
        <>
            {/* ══ HERO SECTION ══════════════════════════════════════════════ */}
            <section className="hero-section">
                <div className="hero-gradient-bg" />
                <div className="hero-grid-overlay" />

                <div className="container position-relative" style={{ zIndex: 2, padding: '5rem 1rem' }}>
                    <div className="d-flex flex-column align-items-start" style={{ maxWidth: 680 }}>

                        {/* Badge */}
                        <div className="hero-badge mb-4 animate-fade-up">
                            <span className="hero-badge-dot" />
                            India's Smartest Vehicle Platform
                        </div>

                        {/* Title */}
                        <h1 className="hero-title mb-4 animate-fade-up animate-delay-1">
                            Search Your<br />
                            <span className="hero-title-accent">Dream Vehicle</span>
                        </h1>

                        <p className="hero-subtitle mb-5 animate-fade-up animate-delay-2">
                            Search, compare and discover the perfect car, bike or heavy-duty vehicle from 50+ models across every top brand in India.
                        </p>

                        {/* Inline Search */}
                        <div className="hero-search-bar animate-fade-up animate-delay-2 mb-5" style={{ maxWidth: 600, width: '100%' }}>
                            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search brand, model or keyword…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}>
                                    <X size={16} />
                                </button>
                            )}
                            <button className="hero-search-btn">
                                <Search size={16} /> Search
                            </button>
                        </div>

                        {/* Category Pills */}
                        <div className="d-flex flex-wrap gap-3 animate-fade-up animate-delay-3">
                            {CATEGORIES.map(({ key, label, Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => { setType(key); setActiveBrand(''); }}
                                    className={`category-pill ${type === key ? 'active' : ''}`}
                                >
                                    <Icon size={17} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="hero-stats-row mt-5 animate-fade-up animate-delay-4">
                            {[
                                { n: '50+', l: 'Models' },
                                { n: '40+', l: 'Brands' },
                                { n: '3', l: 'Categories' },
                                { n: '100%', l: 'Free' },
                            ].map(({ n, l }) => (
                                <div key={l}>
                                    <div className="hero-stat-number">{n}</div>
                                    <div className="hero-stat-label">{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* ══ MAIN CONTENT ══════════════════════════════════════════════ */}
            <div style={{ background: 'var(--bg-base)', padding: '3rem 0 5rem' }}>
                <div className="container">

                    {/* Brand Pills */}
                    {visibleBrands.length > 0 && (
                        <div className="mb-5">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <div className="section-label">Browse by Brand</div>
                                    <div className="section-line" />
                                </div>
                                {activeBrand && (
                                    <button onClick={() => setActiveBrand('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                                        <X size={14} /> Clear brand
                                    </button>
                                )}
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                {visibleBrands.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => setActiveBrand(prev => prev === b.id.toString() ? '' : b.id.toString())}
                                        className={`brand-chip ${activeBrand === b.id.toString() ? 'active' : ''}`}
                                    >
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filter Bar */}
                    <div className="filter-bar mb-4">
                        <SlidersHorizontal size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: 4 }}>
                            Filters {activeFilterCount > 0 && <span style={{ color: 'var(--primary)' }}>({activeFilterCount})</span>}
                        </span>
                        <div className="filter-divider" />

                        <select className="filter-select" value={budget} onChange={e => setBudget(e.target.value)}>
                            <option value="">Any Budget</option>
                            {budgetBuckets.map(b => <option key={b.label} value={b.label}>{b.label}</option>)}
                        </select>

                        <select className="filter-select" value={fuel} onChange={e => setFuel(e.target.value)}>
                            <option value="">Any Fuel</option>
                            <option>Petrol</option><option>Diesel</option><option>Electric</option>
                        </select>

                        <select className="filter-select" value={transmission} onChange={e => setTransmission(e.target.value)}>
                            <option value="">Transmission</option>
                            <option>Manual</option><option>Automatic</option>
                        </select>

                        <select className="filter-select" value={seating} onChange={e => setSeating(e.target.value)}>
                            <option value="">Seating</option>
                            <option value="2">2+</option><option value="4">4+</option>
                            <option value="5">5+</option><option value="7">7+</option>
                        </select>

                        {activeFilterCount > 0 && (
                            <button className="filter-clear-btn" onClick={clearFilters}>Clear All</button>
                        )}
                    </div>

                    {/* Results Header */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <span className="section-label">
                                {type ? `New ${type === 'HeavyDuty' ? 'Heavy Duty' : type}s` : 'All Vehicles'}
                            </span>
                            <div className="section-line" />
                        </div>
                        {!loading && (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {vehicles.length} result{vehicles.length !== 1 ? 's' : ''} found
                            </span>
                        )}
                    </div>

                    {/* Grid */}
                    <div className="row g-4">
                        {loading ? (
                            [...Array(9)].map((_, i) => (
                                <div key={i} className="col-12 col-md-6 col-lg-4">
                                    <SkeletonCard />
                                </div>
                            ))
                        ) : vehicles.length > 0 ? (
                            vehicles.map(v => (
                                <div key={v.id} className="col-12 col-md-6 col-lg-4">
                                    <VCard vehicle={v} />
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="empty-state">
                                    <div className="empty-state-icon">🔍</div>
                                    <div className="empty-state-title">No vehicles found</div>
                                    <p className="empty-state-text">Try adjusting your filters or search for a different term.</p>
                                    <button onClick={clearFilters} className="btn-primary-solid mt-3">Clear Filters</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Compare CTA */}
                    {vehicles.length > 0 && !loading && (
                        <div className="compare-cta mt-5 d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                    🔥 Compare vehicles side-by-side
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                    Add vehicles to compare and find the perfect match
                                </div>
                            </div>
                            <Link to="/compare" className="btn-primary-solid d-flex align-items-center gap-2" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                                Go to Comparison <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;
