import React, { useState, useEffect } from 'react';
import BrandCard from './BrandCard';

// Using consistent API fetching structure
const BrandsTabs = () => {
    const [brands, setBrands] = useState([]);
    const [activeTab, setActiveTab] = useState('Car');
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/brands?type=${activeTab.replace('-', '')}`);
                const data = await res.json();
                setBrands(data);
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, [activeTab]);

    const visibleBrands = expanded ? brands : brands.slice(0, 10);
    const tabs = [
        { id: 'Car', label: 'Cars' },
        { id: 'Bike', label: 'Bikes' },
        { id: 'Heavy-Duty', label: 'Heavy Duty' }
    ];

    return (
        <div className="py-5">
            {/* Main Panel */}
            <div className="bg-white border rounded-4 shadow-sm p-4 p-md-5 mx-auto">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 pb-3 border-bottom">
                    <div>
                        <h3 className="fw-bold text-dark mb-0 fs-3">
                            Browse by <span className="text-danger">{activeTab}</span> Brands
                        </h3>
                    </div>

                    {/* Tabs UI moved to the right */}
                    <div className="mt-3 mt-md-0">
                        <div className="bg-light p-1 rounded-pill d-inline-flex border">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setExpanded(false);
                                    }}
                                    className={`btn rounded-pill fw-medium fs-6 px-4 py-2 border-0 ${activeTab === tab.id
                                            ? 'btn-danger text-white shadow-sm'
                                            : 'text-muted hover-primary bg-transparent'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <p className="text-muted fw-medium placeholder-glow">
                            <span className="placeholder col-4 col-md-2"></span>
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="row g-3 g-md-4">
                            {visibleBrands.length > 0 ? (
                                visibleBrands.map((brand) => (
                                    <div className="col-4 col-md-3 col-lg-2" key={brand.id}>
                                        <BrandCard brand={brand} />
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 py-5 text-center">
                                    <p className="text-muted">No brands found for this category.</p>
                                </div>
                            )}
                        </div>

                        {brands.length > 10 && (
                            <div className="mt-5 text-center">
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="btn btn-outline-secondary fw-bold px-5 py-2 rounded-pill hover-primary"
                                    style={{ color: 'var(--text-dark)', borderColor: '#d1d5db' }}
                                >
                                    {expanded ? "Show Less" : "View All Brands"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BrandsTabs;
