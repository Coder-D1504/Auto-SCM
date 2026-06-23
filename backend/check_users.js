const { query } = require('./config/db');
require('dotenv').config();

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
