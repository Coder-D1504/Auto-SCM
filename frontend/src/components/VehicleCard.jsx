import { Fuel, Gauge, Users, Zap } from 'lucide-react';

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

const VehicleCard = ({ vehicle }) => {
    const { addCompare, compareIds } = useCompare();
    const isCompared = compareIds.includes(vehicle.id) || compareIds.includes(vehicle.id.toString());

    const fmt = (n) => n ? `₹${(n / 100000).toFixed(1)}L` : '—';

    return (
        <div className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="vehicle-card h-100">
                <VehicleImage vehicle={vehicle} />
                <div className="vehicle-card-body">
                    <span className="vehicle-brand-badge">{vehicle.brand_name}</span>
                    <div className="vehicle-name">{vehicle.model_name}</div>
                    <div className="vehicle-type-tag">{vehicle.type_name} · {vehicle.transmission}</div>
                    <div className="vehicle-price">{fmt(vehicle.price)}</div>
                    <div className="vehicle-price-sub">Ex-showroom price onwards</div>
                    <div className="vehicle-spec-grid">
                        <div className="vehicle-spec-item"><Fuel size={14} className="vehicle-spec-icon"/>{vehicle.fuel_type}</div>
                        <div className="vehicle-spec-item"><Zap  size={14} className="vehicle-spec-icon"/>{vehicle.engine || 'N/A'}</div>
                        <div className="vehicle-spec-item"><Gauge size={14} className="vehicle-spec-icon"/>{vehicle.mileage || '16.5 kmpl'}</div>
                        <div className="vehicle-spec-item"><Users size={14} className="vehicle-spec-icon"/>{vehicle.seating_capacity} Seats</div>
                    </div>
                </div>
                <div className="vehicle-card-actions">
                    <Link to={`/vehicle/${vehicle.id}`} className="btn-view-details">
                        View Details
                    </Link>
                    <button
                        onClick={(e) => addCompare(vehicle.id.toString(), e)}
                        disabled={isCompared}
                        className={`btn-compare ${isCompared ? 'added' : ''}`}
                    >
                        {isCompared ? '✓ Added' : '+ Compare'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;
