import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Fuel, Gauge, Users, Zap, MapPin, ChevronRight, CheckCircle2, Car, Star } from 'lucide-react';

/* ── ImageResolver ───────────────────────────────── */
const PLACEHOLDERS = {
    'Car': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1200',
    'Bike': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200',
    'HeavyDuty': 'https://images.unsplash.com/photo-1591768793355-74d7c86911b7?auto=format&fit=crop&q=80&w=1200'
};

const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        const fetchVehicle = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/vehicles/${id}`);
                setVehicle(res.data);
                setSelectedVariant(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id]);

    const handleBookTestDrive = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        try {
            await api.post('/bookings', { variant_id: selectedVariant.id });
            alert('Test drive booked successfully! Check My Bookings.');
        } catch (err) {
            alert(err.response?.data?.message || 'Error booking test drive');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    if (!vehicle) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <h3>Vehicle not found.</h3>
        </div>
    );

    const imageUrl = selectedVariant.variant_image || vehicle.model_image || vehicle.brand_image;
    const fallback = PLACEHOLDERS[vehicle.type_name] || PLACEHOLDERS['Car'];

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Breadcrumb Area */}
            <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.6rem 0' }}>
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0 small" style={{ fontWeight: 600 }}>
                            <li className="breadcrumb-item"><Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link></li>
                            <li className="breadcrumb-item"><Link to={`/${vehicle.type_name.toLowerCase()}s`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{vehicle.type_name}s</Link></li>
                            <li className="breadcrumb-item active" style={{ color: 'var(--text-muted)' }} aria-current="page">{vehicle.model_name}</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container mt-4">
                {/* Hero Section */}
                <div className="vehicle-detail-hero">
                    <img 
                        src={imageUrl || fallback} 
                        alt={`${vehicle.brand_name} ${vehicle.model_name}`}
                        onError={(e) => { e.target.src = fallback; }}
                    />
                </div>

                <div className="row g-5">
                    {/* Left Column - Details */}
                    <div className="col-lg-7">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="badge" style={{ background: 'rgba(249,115,22,0.1)', color: 'var(--primary)', border: '1px solid var(--border-active)' }}>{vehicle.type_name}</span>
                        </div>
                        <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                            {vehicle.brand_name} {vehicle.model_name}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '1rem' }}>
                            Variant: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedVariant.fuel_type}</span>
                        </p>
                        
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <div className="d-flex" style={{ color: '#fbbf24' }}>
                                <Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} />
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>(124 Verified Reviews)</span>
                        </div>

                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', marginBottom: '2rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Ex-Showroom Price</p>
                            <h2 style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '3rem', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                                ₹ {selectedVariant.price?.toLocaleString()}
                            </h2>
                            <div className="d-flex flex-wrap gap-3">
                                <button className="btn-primary-solid" style={{ padding: '0.8rem 2rem', fontSize: '1rem', borderRadius: 10 }}>Check On-Road Price</button>
                                <button 
                                    onClick={handleBookTestDrive} 
                                    disabled={bookingLoading}
                                    style={{ 
                                        padding: '0.8rem 1.5rem', 
                                        fontSize: '1rem', 
                                        borderRadius: 10,
                                        background: 'transparent',
                                        border: '2px solid var(--border-active)',
                                        color: 'var(--text-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}>
                                    <Car size={20} /> 
                                    {bookingLoading ? 'Booking...' : 'Book Test Drive'}
                                </button>
                            </div>
                        </div>

                        {/* Variants Selection */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h5 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '1rem' }}>Select Variant</h5>
                            <div className="d-flex flex-wrap gap-2">
                                {vehicle.variants?.map((v) => (
                                    <Link
                                        key={v.id}
                                        to={`/vehicle/${v.id}`}
                                        style={{
                                            padding: '0.6rem 1.25rem',
                                            borderRadius: 8,
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            background: parseInt(id) === v.id ? 'var(--primary)' : 'var(--bg-card)',
                                            color: parseInt(id) === v.id ? '#fff' : 'var(--text-secondary)',
                                            border: '1px solid var(--border)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {v.fuel_type}
                                    </Link>
                                ))}
                                {(!vehicle.variants || vehicle.variants.length === 0) && (
                                    <span style={{ 
                                        padding: '0.6rem 1.25rem', 
                                        borderRadius: 8, 
                                        background: 'var(--primary)', 
                                        color: '#fff', 
                                        fontWeight: 600 
                                    }}>
                                        {vehicle.fuel_type} (Base)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Specs */}
                    <div className="col-lg-5">
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', height: '100%' }}>
                            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '2rem' }}>Key Specifications</h4>
                            
                            <div className="row g-4">
                                <div className="col-6">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
                                        <Fuel size={18} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Fuel Type</span>
                                    </div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginLeft: 28 }}>{selectedVariant.fuel_type}</div>
                                </div>
                                <div className="col-6">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
                                        <Zap size={18} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Engine</span>
                                    </div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginLeft: 28 }}>{selectedVariant.engine || '1.5L i-VTEC'}</div>
                                </div>
                                <div className="col-6">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
                                        <Gauge size={18} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Mileage</span>
                                    </div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginLeft: 28 }}>{selectedVariant.mileage || '16.5 kmpl'}</div>
                                </div>
                                <div className="col-6">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
                                        <Users size={18} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Seating</span>
                                    </div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginLeft: 28 }}>{selectedVariant.seating_capacity} Seats</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                                <h5 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '1.5rem' }}>Popular Features</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Advanced Airbag System
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> ABS with EBD
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Smart Infotainment
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetail;
