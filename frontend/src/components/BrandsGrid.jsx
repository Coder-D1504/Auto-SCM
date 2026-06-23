import React, { useState, useEffect } from 'react';
import api from '../services/api';

const backendUrl = "http://localhost:5000";

const BrandsGrid = () => {
    const [brands, setBrands] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await api.get('/vehicles/metadata');
                setBrands(res.data.brands || []);
            } catch (err) {
                console.error('Failed to fetch brands', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetadata();
    }, []);

    if (loading) return null;
    if (!brands.length) return null;

    const uniqueBrands = Array.from(new Map(brands.map(brand => [brand.name, brand])).values());
    
    // Sort so brands with valid images appear first
    const sortedBrands = [...uniqueBrands].sort((a, b) => {
        const hasA = a.image_url ? 1 : 0;
        const hasB = b.image_url ? 1 : 0;
        return hasB - hasA;
    });

    const visibleBrands = showAll ? sortedBrands : sortedBrands.slice(0, 12);

    const getImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith('/public') ? `${backendUrl}${url}` : url;
    };

    return (
        <div className="mb-5 mt-5">
            <h3 className="mb-4 fw-bold">All Brands</h3>
            <div className="card border shadow-sm rounded-4 overflow-hidden">
                <div className="brands-grid">
                    {visibleBrands.map((brand) => (
                        <div key={brand.id} className="brand-grid-item text-center p-3 d-flex flex-column justify-content-center align-items-center">
                            <div className="brand-logo-container mb-2">
                                {brand.image_url ? (
                                    <img 
                                        src={getImageUrl(brand.image_url)} 
                                        alt={brand.name} 
                                        className="brand-logo-img img-fluid"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                ) : (
                                    <div className="brand-logo-fallback fw-bold text-muted bg-light rounded-circle d-flex align-items-center justify-content-center">
                                        {brand.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="brand-logo-fallback fw-bold text-muted bg-light rounded-circle align-items-center justify-content-center" style={{ display: 'none' }}>
                                    {brand.name.substring(0, 2).toUpperCase()}
                                </div>
                            </div>
                            <span className="text-secondary small fw-medium">{brand.name}</span>
                        </div>
                    ))}
                </div>
                {sortedBrands.length > 12 && (
                    <button 
                        onClick={() => setShowAll(!showAll)} 
                        className="btn btn-link w-100 text-decoration-none text-muted py-3 border-top view-more-btn"
                    >
                        {showAll ? 'View Less Brands' : 'View More Brands'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default BrandsGrid;
