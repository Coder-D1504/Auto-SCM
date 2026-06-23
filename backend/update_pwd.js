const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    const c = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Root@2026',
      database: 'automobiledb'
    });
    const hash = await bcrypt.hash('admin123', 10);
    await c.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'admin@autoscm.com']);
    console.log('Password updated successfully');
    await c.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}
updatePassword();
