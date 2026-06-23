const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection() {
  try {
    // First try connecting without database to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    console.log('Successfully connected to MySQL server.');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`Database ${process.env.DB_NAME} ensured/created.`);
    
    await connection.end();

    // Now test connection with the database
    const pool = require('./config/db').pool;
    pool.getConnection((err, conn) => {
      if (err) {
        console.error('Error connecting to pool:', err.message);
      } else {
        console.log('Successfully connected to the connection pool with the database.');
        conn.release();
      }
      process.exit();
    });

  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

testConnection();
