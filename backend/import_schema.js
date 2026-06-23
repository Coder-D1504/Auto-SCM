const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function importSchema() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Importing schema...');
    
    // Execute all SQL statements
    await connection.query(sql);
    
    console.log('Schema imported successfully.');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Error importing schema:', err.message);
    process.exit(1);
  }
}

importSchema();
