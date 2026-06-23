const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
const { query } = require('../backend/config/db');

async function checkUsers() {
    try {
        const users = await query('SELECT id, name, email, role FROM users');
        console.log('--- USERS IN DATABASE ---');
        console.table(users);
        process.exit(0);
    } catch (err) {
        console.error('Error querying users:', err);
        process.exit(1);
    }
}

checkUsers();
