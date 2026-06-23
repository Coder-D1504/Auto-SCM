const { query } = require('./config/db');
const Vehicle = require('./models/Vehicle');
require('dotenv').config();

async function verifyLogic() {
    try {
        console.log('--- TESTING SEARCHABLE VEHICLES MAPPING ---');
        const models = await Vehicle.getSearchableVehicles();
        
        console.table(models.slice(0, 10).map(m => ({
            Model: m.name,
            Variant_ID: m.variant_id
        })));

        const xuv700 = models.find(m => m.name.includes('XUV700'));
        if (xuv700) {
            console.log(`\nFound Mahindra XUV700. Mapped Variant ID: ${xuv700.variant_id}`);
            
            // Check what this variant actually is
            const [variant] = await query(`
                SELECT m.name as model_name, b.name as brand_name 
                FROM variants v
                JOIN models m ON v.model_id = m.id
                JOIN brands b ON m.brand_id = b.id
                WHERE v.id = ?
            `, [xuv700.variant_id]);
            
            console.log(`Variant ID ${xuv700.variant_id} refers to: ${variant.brand_name} ${variant.model_name}`);
            
            if (variant.model_name.includes('XUV700')) {
                console.log('SUCCESS: ID mapping is correct!');
            } else {
                console.log('FAILURE: ID mapping still points to the wrong vehicle.');
            }
        } else {
            console.log('Mahindra XUV700 not found in searchable models.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Logic test failed:', err);
        process.exit(1);
    }
}

verifyLogic();
