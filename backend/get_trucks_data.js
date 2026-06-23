const { query } = require('./config/db');
require('dotenv').config();

async function getTruckData() {
    try {
        // vehicle_type_id for HeavyDuty is 3
        const brands = await query('SELECT id, name FROM brands WHERE vehicle_type_id = 3');
        console.log('--- HEAVY DUTY BRANDS ---');
        console.table(brands);
        
        const models = await query('SELECT id, name, brand_id FROM models WHERE brand_id IN (SELECT id FROM brands WHERE vehicle_type_id = 3)');
        console.log('--- EXISTING HEAVY DUTY MODELS ---');
        console.table(models);

        process.exit(0);
    } catch (err) {
        console.error('Failed to get truck data:', err);
        process.exit(1);
    }
}

getTruckData();
