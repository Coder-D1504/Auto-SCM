const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyAuth() {
    try {
        console.log('--- TEST 1: Register User ---');
        const regUser = await axios.post(`${API_URL}/auth/register`, {
            name: 'Test User',
            email: `testuser_${Date.now()}@example.com`,
            password: 'password123',
            role: 'USER'
        });
        console.log('User Registration:', regUser.data.message);

        console.log('\n--- TEST 2: Register Admin ---');
        const emailAdmin = `testadmin_${Date.now()}@example.com`;
        const regAdmin = await axios.post(`${API_URL}/auth/register`, {
            name: 'Test Admin',
            email: emailAdmin,
            password: 'password123',
            role: 'ADMIN'
        });
        console.log('Admin Registration:', regAdmin.data.message);

        console.log('\n--- TEST 3: Login Admin (Smart Redirect Check) ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: emailAdmin,
            password: 'password123',
            role: 'USER' // Intentionally sending USER to check if server returns ADMIN
        });
        console.log('Login Response Role:', loginRes.data.user.role);
        if (loginRes.data.user.role === 'ADMIN') {
            console.log('SUCCESS: Server correctly identified Admin role despite UI toggle!');
        } else {
            console.log('FAILURE: Role mismatch.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Verification Failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

verifyAuth();
