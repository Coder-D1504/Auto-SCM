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
      CREATE TABLE IF NOT EXISTS user_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        action ENUM('VIEW_VEHICLE', 'COMPARE_VEHICLES', 'BOOK_TEST_DRIVE') NOT NULL,
        entity_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (entity_id) REFERENCES variants(id) ON DELETE CASCADE
      )
    `);
    console.log("Analytics table created");
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
}
run();
