const { query } = require('./config/db');
require('dotenv').config();

const variants = [
    // Royal Enfield (13) - Models: Classic 350 (121), Himalayan (122)
    { model_id: 121, fuel_type: 'Petrol', price: 193000, engine: '349cc', mileage: '36.2 kmpl', seating_capacity: 2, description: 'Classic cruiser with retro styling.' },
    { model_id: 122, fuel_type: 'Petrol', price: 215000, engine: '411cc', mileage: '30.0 kmpl', seating_capacity: 2, description: 'Adventure-oriented off-road bike.' },
    
    // Yamaha (14) - Models: MT-15 (129), R15 (130)
    { model_id: 129, fuel_type: 'Petrol', price: 168000, engine: '155cc', mileage: '45.0 kmpl', seating_capacity: 2, description: 'Hyper-naked sport bike with aggressive looks.' },
    { model_id: 130, fuel_type: 'Petrol', price: 182000, engine: '155cc', mileage: '40.0 kmpl', seating_capacity: 2, description: 'Legendary track-focused sport bike.' },
    
    // KTM (15) - Models: Duke 390 (137), RC 200 (138)
    { model_id: 137, fuel_type: 'Petrol', price: 310000, engine: '373cc', mileage: '25.0 kmpl', seating_capacity: 2, description: 'Naked pocket rocket with massive power.' },
    { model_id: 138, fuel_type: 'Petrol', price: 215000, engine: '199cc', mileage: '35.0 kmpl', seating_capacity: 2, description: 'Entry-level supersport with sharp handling.' },
    
    // Hero MotoCorp (16) - Models: Splendor (145), Xpulse (146)
    { model_id: 145, fuel_type: 'Petrol', price: 75000, engine: '97cc', mileage: '65.0 kmpl', seating_capacity: 2, description: 'Indias most reliable commuter.' },
    { model_id: 146, fuel_type: 'Petrol', price: 145000, engine: '199cc', mileage: '40.0 kmpl', seating_capacity: 2, description: 'Versatile dual-purpose adventure bike.' },
    
    // Honda Two Wheelers (17) - Models: Activa (153), Shine (154)
    { model_id: 153, fuel_type: 'Petrol', price: 78000, engine: '109cc', mileage: '50.0 kmpl', seating_capacity: 2, description: 'The undisputed king of scooters.' },
    { model_id: 154, fuel_type: 'Petrol', price: 82000, engine: '124cc', mileage: '55.0 kmpl', seating_capacity: 2, description: 'Premium commuter with smooth performance.' },
    
    // TVS (18) - Models: Apache RTR (161), Jupiter (162)
    { model_id: 161, fuel_type: 'Petrol', price: 145000, engine: '159cc', mileage: '45.0 kmpl', seating_capacity: 2, description: 'Racing-derived street fighter.' },
    { model_id: 162, fuel_type: 'Petrol', price: 76000, engine: '109cc', mileage: '50.0 kmpl', seating_capacity: 2, description: 'Comfortable and practical family scooter.' },
    
    // Bajaj Auto (19) - Models: Pulsar (169), Dominar (170)
    { model_id: 169, fuel_type: 'Petrol', price: 155000, engine: '220cc', mileage: '40.0 kmpl', seating_capacity: 2, description: 'Iconic sports commuter for the youth.' },
    { model_id: 170, fuel_type: 'Petrol', price: 230000, engine: '373cc', mileage: '30.0 kmpl', seating_capacity: 2, description: 'Premium sports tourer for long roads.' },
    
    // Suzuki Motorcycle (20) - Models: Access (177), Gixxer (178)
    { model_id: 177, fuel_type: 'Petrol', price: 83000, engine: '124cc', mileage: '48.0 kmpl', seating_capacity: 2, description: 'Classic styled 125cc scooter.' },
    { model_id: 178, fuel_type: 'Petrol', price: 140000, engine: '155cc', mileage: '45.0 kmpl', seating_capacity: 2, description: 'Stylish street bike with great handling.' },
    
    // Ather Energy (21) - Models: 450X (185), Rizta (188)
    { model_id: 185, fuel_type: 'Electric', price: 145000, engine: '6kW Motor', mileage: '110 km Range', seating_capacity: 2, description: 'High-performance smart electric scooter.' },
    { model_id: 188, fuel_type: 'Electric', price: 110000, engine: '4kW Motor', mileage: '120 km Range', seating_capacity: 2, description: 'Practical and spacious family electric scooter.' },
    
    // Ola Electric (22) - Models: S1 Pro (193), S1 Air (194)
    { model_id: 193, fuel_type: 'Electric', price: 140000, engine: '11kW Motor', mileage: '195 km Range', seating_capacity: 2, description: 'Indias best selling electric scooter.' },
    { model_id: 194, fuel_type: 'Electric', price: 105000, engine: '6kW Motor', mileage: '150 km Range', seating_capacity: 2, description: 'Affordable and efficient electric commute.' },
    
    // Jawa (23) - Models: Jawa 42 (201), Jawa Perak (202)
    { model_id: 201, fuel_type: 'Petrol', price: 195000, engine: '293cc', mileage: '34.0 kmpl', seating_capacity: 2, description: 'Modern classic with neo-retro styling.' },
    { model_id: 202, fuel_type: 'Petrol', price: 215000, engine: '334cc', mileage: '30.0 kmpl', seating_capacity: 2, description: 'Gorgeous bobber with stealthy looks.' },
    
    // Yezdi (24) - Models: Scrambler (209), Roadster (211)
    { model_id: 209, fuel_type: 'Petrol', price: 210000, engine: '334cc', mileage: '32.0 kmpl', seating_capacity: 2, description: 'Rugged scrambler for urban adventures.' },
    { model_id: 211, fuel_type: 'Petrol', price: 205000, engine: '334cc', mileage: '33.0 kmpl', seating_capacity: 2, description: 'Classic roadster with modern performance.' }
];

async function insertVariants() {
    try {
        console.log('--- INSERTING BIKE VARIANTS ---');
        for (const v of variants) {
            const sql = `INSERT INTO variants (model_id, fuel_type, price, engine, mileage, seating_capacity, description) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
            await query(sql, [v.model_id, v.fuel_type, v.price, v.engine, v.mileage, v.seating_capacity, v.description]);
            console.log(`Successfully added variant for Model ID: ${v.model_id}`);
        }
        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to insert variants:', err);
        process.exit(1);
    }
}

insertVariants();
