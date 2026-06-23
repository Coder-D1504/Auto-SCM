const { query } = require('./config/db');
require('dotenv').config();
const User = require('./models/User');

async function testLogic() {
    try {
        const testEmail = `test_${Date.now()}@example.com`;
        console.log('--- Testing User.create with ADMIN role ---');
        await User.create('Test Admin', testEmail, 'password123', 'ADMIN');
        
        const user = await User.findByEmail(testEmail);
        console.log('Resulting User Role:', user.role);
        
        if (user.role === 'ADMIN') {
            console.log('SUCCESS: Role was correctly preserved in DB.');
        } else {
            console.log('FAILURE: Role mismatch.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testLogic();
