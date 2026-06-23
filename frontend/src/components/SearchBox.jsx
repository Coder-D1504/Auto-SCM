import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search } from 'lucide-react';

const SearchBox = ({ onSearch }) => {
    // Top-level tab: New Car, Used Car, etc. We map this to our vehicle types based on user instruction.
    const [activeTab, setActiveTab] = useState('Car'); 
    
    // Search mode: 'budget' or 'brand'
    const [searchMode, setSearchMode] = useState('budget');

    // Filter states
    const [budgetBucket, setBudgetBucket] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');

    const [metadata, setMetadata] = useState({ types: [], brands: [], models: [] });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await api.get('/vehicles/metadata');
                setMetadata(res.data);
            } catch (err) { }
        };
        fetchMetadata();
    }, []);

    const budgetBuckets = [
        { label: 'Under ₹5 Lakh', min: 0, max: 500000 },
        { label: '₹5 Lakh - ₹15 Lakh', min: 500000, max: 1500000 },
        { label: '₹15 Lakh - ₹25 Lakh', min: 1500000, max: 2500000 },
        { label: 'Over ₹25 Lakh', min: 2500000, max: 100000000 }
    ];

    const handleSearch = () => {
        // Construct the query object
        const query = {
            type: searchMode === 'budget' ? (selectedType === 'All' ? activeTab : selectedType) : activeTab
        };
        
        if (searchMode === 'budget' && budgetBucket) {
            const bucket = budgetBuckets.find(b => b.label === budgetBucket);
            if (bucket) {
                query.minPrice = bucket.min;
                query.maxPrice = bucket.max;
            }
        } else if (searchMode === 'brand') {
            if (selectedBrand) {
                // By selecting brand, we actually just want to text search the brand or pass down brand metadata.
                // The current API accepts `search` string. Passing the brand name into search works perfectly.
                const brandObj = metadata.brands.find(b => b.id.toString() === selectedBrand);
                const modelObj = metadata.models.find(m => m.id.toString() === selectedModel);
                query.search = `${brandObj ? brandObj.name : ''} ${modelObj ? modelObj.name : ''}`.trim();
            }
        }
        
        onSearch(query);
    };

    // Derived lists based on selection
    const filteredBrandsForTab = metadata.brands.filter(b => {
        return metadata.types.find(t => t.id === b.vehicle_type_id)?.name === activeTab;
    });

    const filteredModelsForBrand = metadata.models.filter(m => m.brand_id.toString() === selectedBrand);

    return (
        <div className="search-box-container bg-white shadow-lg position-relative" style={{ width: '380px', borderRadius: '16px', zIndex: 10 }}>
            <div className="p-4">
                <h3 className="fw-bolder mb-4 text-dark" style={{ letterSpacing: '-0.5px' }}>Find your right {activeTab.toLowerCase()}</h3>
                
                {/* Top Tabs */}
                <div className="d-flex mb-4 gap-2">
                    {['Car', 'Bike', 'HeavyDuty'].map(tab => {
                        const displayTab = tab === 'HeavyDuty' ? 'Heavy Duty' : `New ${tab}`;
                        return (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setSelectedBrand(''); setSelectedModel(''); }}
                                className={`btn position-relative fw-bold px-4 py-2 flex-grow-1 ${activeTab === tab ? 'bg-dark text-white border-0' : 'bg-transparent text-muted border'}`}
                                style={{ borderRadius: '8px', fontSize: '0.9rem', transition: 'none' }}
                            >
                                {displayTab}
                                {activeTab === tab && (
                                    <div className="position-absolute start-50 translate-middle-x" style={{ bottom: '-6px', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #212529' }} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Radio Toggles */}
                <div className="d-flex gap-4 mb-4 mt-1">
                    <label className="d-flex align-items-center gap-2 cursor-pointer small fw-bold" style={{ color: searchMode === 'budget' ? '#ff3e00' : '#6c757d' }}>
                        <input 
                            type="radio" 
                            checked={searchMode === 'budget'} 
                            onChange={() => setSearchMode('budget')} 
                            className="form-check-input mt-0" 
                            style={{ accentColor: '#ff3e00', borderColor: searchMode === 'budget' ? '#ff3e00' : '#dee2e6', width: '16px', height: '16px' }}
                        /> By Budget
                    </label>
                    <label className="d-flex align-items-center gap-2 cursor-pointer small fw-bold" style={{ color: searchMode === 'brand' ? '#ff3e00' : '#6c757d' }}>
                        <input 
                            type="radio" 
                            checked={searchMode === 'brand'} 
                            onChange={() => setSearchMode('brand')} 
                            className="form-check-input mt-0" 
                            style={{ accentColor: '#ff3e00', borderColor: searchMode === 'brand' ? '#ff3e00' : '#dee2e6', width: '16px', height: '16px' }}
                        /> By Brand
                    </label>
                </div>

                {/* Dropdowns logic */}
                {searchMode === 'budget' ? (
                    <div className="d-flex flex-column mb-4">
                        <select className="form-select form-select-lg bg-transparent text-dark fw-medium" style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none', border: '1px solid #ced4da' }} value={budgetBucket} onChange={e => setBudgetBucket(e.target.value)}>
                            <option value="">Select Budget</option>
                            {budgetBuckets.map(b => (
                                <option key={b.label} value={b.label}>{b.label}</option>
                            ))}
                        </select>
                        <select className="form-select form-select-lg bg-transparent text-dark fw-medium" style={{ borderRadius: '0 0 8px 8px', border: '1px solid #ced4da' }} value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                            <option value="All">All {activeTab} Types</option>
                        </select>
                    </div>
                ) : (
                    <div className="d-flex flex-column mb-4">
                        <select className="form-select form-select-lg bg-transparent text-dark fw-medium" style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none', border: '1px solid #ced4da' }} value={selectedBrand} onChange={e => { setSelectedBrand(e.target.value); setSelectedModel(''); }}>
                            <option value="">Select Brand</option>
                            {filteredBrandsForTab.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <select className="form-select form-select-lg bg-transparent text-dark fw-medium" style={{ borderRadius: '0 0 8px 8px', border: '1px solid #ced4da' }} value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedBrand}>
                            <option value="">Select Model</option>
                            {filteredModelsForBrand.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <button onClick={handleSearch} className="btn w-100 py-3 fw-bold rounded shadow-sm" style={{ backgroundColor: '#ff5722', color: 'white', letterSpacing: '0.5px' }}>
                    Search
                </button>
                
                <div className="text-end mt-3">
                    <span className="text-muted small cursor-pointer hover-primary" style={{ fontSize: '13px' }}>Advanced Search &rarr;</span>
                </div>
            </div>
        </div>
    );
};

export default SearchBox;
