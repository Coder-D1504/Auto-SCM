const { query } = require('./config/db');
require('dotenv').config();
const User = require('./models/User');

async function createCreds() {
    try {
        console.log('--- CREATING TEST CREDENTIALS ---');
        
        // Admin
        const adminEmail = 'admin_test@example.com';
        const existingAdmin = await User.findByEmail(adminEmail);
        if (!existingAdmin) {
            await User.create('Test Admin', adminEmail, 'admin123', 'ADMIN');
            console.log('Created Admin: admin_test@example.com / admin123');
        } else {
            console.log('Admin admin_test@example.com already exists.');
        }

        // User
        const userEmail = 'user_test@example.com';
        const existingUser = await User.findByEmail(userEmail);
        if (!existingUser) {
            await User.create('Test User', userEmail, 'user123', 'USER');
            console.log('Created User: user_test@example.com / user123');
        } else {
            console.log('User user_test@example.com already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Failed to create credentials:', err);
        process.exit(1);
    }
}

createCreds();
