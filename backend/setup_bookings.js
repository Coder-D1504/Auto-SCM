const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        variant_id INT,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE
      )
    `);
    console.log("Bookings table created");
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
}
run();
