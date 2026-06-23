const axios = require('axios');

async function verifyMetadata() {
    try {
        const res = await axios.get('http://localhost:5000/api/vehicles/metadata');
        const models = res.data.models;
        
        console.log('--- METADATA MODELS CHECK ---');
        models.slice(0, 5).forEach(m => {
            console.log(`Model: ${m.name}, Variant ID: ${m.variant_id}`);
        });

        const hasVariantId = models.every(m => m.variant_id !== undefined);
        if (hasVariantId) {
            console.log('\nSUCCESS: All models now have a pre-resolved variant_id.');
        } else {
            console.log('\nFAILURE: Some models are missing variant_id.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err.message);
        process.exit(1);
    }
}

verifyMetadata();
