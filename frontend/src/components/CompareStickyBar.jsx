import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { X, GitCompare } from 'lucide-react';
import api from '../services/api';

const CompareStickyBar = () => {
    const { compareIds, removeCompare, clearCompare } = useCompare();
    const [vehicles, setVehicles] = useState([]);
    const location = useLocation();

    useEffect(() => {
        const fetchCompareVehicles = async () => {
            if (compareIds.length === 0) {
                setVehicles([]);
                return;
            }
            try {
                const res = await api.get('/vehicles/compare', { params: { ids: compareIds.join(',') } });
                setVehicles(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCompareVehicles();
    }, [compareIds]);

    // Hide sticky bar if we are on the comparison page itself or if no items are selected
    if (compareIds.length === 0 || location.pathname === '/compare') return null;

    return (
        <div className="position-fixed bottom-0 start-0 w-100 bg-white border-top shadow-lg animate-in slide-up" style={{ zIndex: 1050, padding: '15px 0' }}>
            <div className="container">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-4 flex-grow-1 overflow-auto pe-3" style={{ whiteSpace: 'nowrap' }}>
                        <div className="fw-bold text-dark pe-3 border-end">
                            <span className="badge bg-primary rounded-pill me-2">{compareIds.length}/4</span>
                            Compared Vehicles
                        </div>
                        {vehicles.map(v => (
                            <div key={v.id} className="d-inline-flex align-items-center bg-light border rounded px-3 py-2 position-relative hover-primary-border">
                                <span className="small fw-bold text-dark me-3">{v.brand_name} {v.model_name}</span>
                                <button 
                                    onClick={(e) => removeCompare(v.id, e)} 
                                    className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                                >
                                    <X size={16}/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="d-flex gap-2 flex-shrink-0">
                        <button onClick={clearCompare} className="btn btn-light fw-medium">Clear All</button>
                        <Link 
                            to={`/compare?ids=${compareIds.join(',')}`} 
                            className="btn btn-primary fw-bold px-4 shadow-sm d-flex align-items-center gap-2"
                        >
                            <GitCompare size={18}/> Compare Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompareStickyBar;
