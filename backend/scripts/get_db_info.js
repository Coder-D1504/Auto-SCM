const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/db');

async function getInfo() {
  try {
    const types = await query('SELECT * FROM vehicle_types');
    console.log('Vehicle Types:', types);
    const columns = await query('SHOW COLUMNS FROM brands');
    console.log('Brands Columns:', columns.map(c => c.Field));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

getInfo();
