const { query } = require('./config/db');
require('dotenv').config();

async function getBikeBrands() {
    try {
        // vehicle_type_id for Bike is 2 (from previous research)
        const brands = await query('SELECT id, name FROM brands WHERE vehicle_type_id = 2');
        console.log('--- BIKE BRANDS ---');
        console.table(brands);
        
        const models = await query('SELECT id, name, brand_id FROM models WHERE brand_id IN (SELECT id FROM brands WHERE vehicle_type_id = 2)');
        console.log('--- EXISTING BIKE MODELS ---');
        console.table(models);

        process.exit(0);
    } catch (err) {
        console.error('Failed to get bike brands:', err);
        process.exit(1);
    }
}

getBikeBrands();
