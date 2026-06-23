const { query } = require('./config/db');
require('dotenv').config();

const variants = [
    // Ashok Leyland (25) - Dost (217), Ecomet (218)
    { model_id: 217, fuel_type: 'Diesel', price: 750000, engine: '1.5L TDCR', mileage: '19.6 kmpl', seating_capacity: 3, description: 'Versatile mini truck for last-mile delivery.' },
    { model_id: 218, fuel_type: 'Diesel', price: 1850000, engine: 'H-Series 4C', mileage: '12.0 kmpl', seating_capacity: 3, description: 'Reliable intermediate commercial vehicle.' },
    
    // BharatBenz (26) - 1923C (222), 2823R (223)
    { model_id: 222, fuel_type: 'Diesel', price: 2600000, engine: 'OM926', mileage: '6.5 kmpl', seating_capacity: 2, description: 'High-performance tipper for mining and construction.' },
    { model_id: 223, fuel_type: 'Diesel', price: 3200000, engine: 'OM926', mileage: '5.8 kmpl', seating_capacity: 2, description: 'Heavy-duty haulage truck for long distances.' },
    
    // Tata Motors Commercial (27) - Signa (227), Prima (228)
    { model_id: 227, fuel_type: 'Diesel', price: 3500000, engine: 'Cummins ISBe 6.7L', mileage: '4.5 kmpl', seating_capacity: 2, description: 'Advanced heavy truck with superior cabin comfort.' },
    { model_id: 228, fuel_type: 'Diesel', price: 4500000, engine: 'Cummins ISBe 6.7L', mileage: '4.0 kmpl', seating_capacity: 2, description: 'Premium world-class truck for global standards.' },
    
    // Eicher Motors (28) - Pro 2000 (232), Pro 3000 (233)
    { model_id: 232, fuel_type: 'Diesel', price: 1550000, engine: 'E483', mileage: '14.0 kmpl', seating_capacity: 3, description: 'Modern light truck with best-in-class payload.' },
    { model_id: 233, fuel_type: 'Diesel', price: 2100000, engine: 'E494', mileage: '11.0 kmpl', seating_capacity: 3, description: 'Efficient mid-range truck for distribution.' },
    
    // Mahindra Commercial (29) - Bolero Pik-Up (237), Furio (238)
    { model_id: 237, fuel_type: 'Diesel', price: 950000, engine: 'm2DiCR', mileage: '14.3 kmpl', seating_capacity: 2, description: 'Rugged and reliable pickup for small businesses.' },
    { model_id: 238, fuel_type: 'Diesel', price: 2250000, engine: 'mDiTech', mileage: '9.5 kmpl', seating_capacity: 3, description: 'Next-gen truck with focus on driver safety.' },
    
    // Volvo Trucks (30) - FMX (242), FH (243)
    { model_id: 242, fuel_type: 'Diesel', price: 9500000, engine: 'Volvo D13A', mileage: '2.5 kmpl', seating_capacity: 2, description: 'Undisputed champion for mining and heavy duty haulage.' },
    { model_id: 243, fuel_type: 'Diesel', price: 12000000, engine: 'Volvo D13C', mileage: '2.0 kmpl', seating_capacity: 2, description: 'Ultra-premium long haul truck with high safety.' },
    
    // Scania (31) - R-Series (247), G-Series (248)
    { model_id: 247, fuel_type: 'Diesel', price: 8500000, engine: 'DC13', mileage: '3.0 kmpl', seating_capacity: 2, description: 'Scandinavian precision and efficiency in heavy logistics.' },
    { model_id: 248, fuel_type: 'Diesel', price: 7500000, engine: 'DC13', mileage: '3.5 kmpl', seating_capacity: 2, description: 'Versatile heavy truck for various industrial applications.' },
    
    // Force Motors (32) - Traveller (252), Urbania (253)
    { model_id: 252, fuel_type: 'Diesel', price: 1600000, engine: 'FM 2.6 CR', mileage: '11.5 kmpl', seating_capacity: 17, description: 'Popular multi-seat passenger carrier for tours.' },
    { model_id: 253, fuel_type: 'Diesel', price: 2950000, engine: 'FM 2.6 CR', mileage: '10.0 kmpl', seating_capacity: 13, description: 'Next-gen luxury van with car-like comfort.' },
    
    // SML Isuzu (33) - Samrat (257), Sartaj (258)
    { model_id: 257, fuel_type: 'Diesel', price: 1750000, engine: 'SLT6', mileage: '12.5 kmpl', seating_capacity: 3, description: 'Durable and heavy-duty cargo truck.' },
    { model_id: 258, fuel_type: 'Diesel', price: 1350000, engine: 'SLT6', mileage: '15.0 kmpl', seating_capacity: 3, description: 'The most trustable light commercial vehicle.' },
    
    // MAN Trucks (34) - CLA (262), TGS (263)
    { model_id: 262, fuel_type: 'Diesel', price: 3800000, engine: 'D0836', mileage: '5.0 kmpl', seating_capacity: 2, description: 'German engineered truck for infrastructure projects.' },
    { model_id: 263, fuel_type: 'Diesel', price: 4200000, engine: 'D2066', mileage: '4.5 kmpl', seating_capacity: 2, description: 'Heavy-duty tractor head for massive loads.' },
    
    // AMW Motors (35) - 2518 (267), 3118 (268)
    { model_id: 267, fuel_type: 'Diesel', price: 2400000, engine: 'Cummins 6BT', mileage: '6.0 kmpl', seating_capacity: 2, description: 'Standard heavy-duty tipper for construction.' },
    { model_id: 268, fuel_type: 'Diesel', price: 2800000, engine: 'Cummins 6BT', mileage: '5.5 kmpl', seating_capacity: 2, description: 'Reliable multi-axle truck for industrial haulage.' },
    
    // Kamaz Motors (36) - 6540 (272), 6520 (273)
    { model_id: 272, fuel_type: 'Diesel', price: 4100000, engine: 'Kamaz 740', mileage: '4.0 kmpl', seating_capacity: 2, description: 'Russian multi-axle heavy-duty tipper.' },
    { model_id: 273, fuel_type: 'Diesel', price: 3600000, engine: 'Kamaz 740', mileage: '4.2 kmpl', seating_capacity: 2, description: 'Powerful 6x4 truck for off-road environments.' }
];

async function insertTrucks() {
    try {
        console.log('--- INSERTING HEAVY DUTY VARIANTS ---');
        for (const v of variants) {
            const sql = `INSERT INTO variants (model_id, fuel_type, price, engine, mileage, seating_capacity, description) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
            await query(sql, [v.model_id, v.fuel_type, v.price, v.engine, v.mileage, v.seating_capacity, v.description]);
            console.log(`Successfully added variant for Model ID: ${v.model_id}`);
        }
        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to insert trucks:', err);
        process.exit(1);
    }
}

insertTrucks();
