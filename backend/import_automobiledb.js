const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function importAutomobileDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      // database: process.env.DB_NAME, // Not specifying here so we can drop and create it
      multipleStatements: true
    });

    await connection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\``);
    await connection.query(`CREATE DATABASE \`${process.env.DB_NAME}\``);
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    const schemaPath = path.join(__dirname, '..', 'automobiledb.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Importing automobiledb.sql...');
    
    // Execute all SQL statements
    await connection.query(sql);
    
    console.log('Database updated successfully from automobiledb.sql.');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Error importing automobiledb.sql:', err.message);
    process.exit(1);
  }
}

importAutomobileDb();
