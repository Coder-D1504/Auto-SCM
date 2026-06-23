const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/db');

async function migrate() {
  try {
    console.log('Starting migration with .env from:', path.join(__dirname, '../.env'));

    // 1. Add logo_url and status columns if they don't exist
    // Check if columns exist first to avoid errors in some MySQL versions
    const columns = await query('SHOW COLUMNS FROM brands');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('image_url')) {
      await query('ALTER TABLE brands ADD COLUMN image_url VARCHAR(255)');
      console.log('Added image_url column.');
    }
    
    if (!columnNames.includes('status')) {
      await query("ALTER TABLE brands ADD COLUMN status ENUM('current', 'upcoming', 'expired') DEFAULT 'current'");
      console.log('Added status column.');
    }

    // 2. Define the brand data with logos and status
    const brandsData = [
      { name: 'Maruti Suzuki', logo: 'https://www.carlogos.org/car-logos/suzuki-logo.png', status: 'current' },
      { name: 'Tata Motors', logo: 'https://www.carlogos.org/car-logos/tata-logo.png', status: 'current' },
      { name: 'Mahindra & Mahindra', logo: 'https://www.carlogos.org/car-logos/mahindra-logo.png', status: 'current' },
      { name: 'Hyundai', logo: 'https://www.carlogos.org/car-logos/hyundai-logo.png', status: 'current' },
      { name: 'Toyota', logo: 'https://www.carlogos.org/car-logos/toyota-logo.png', status: 'current' },
      { name: 'Kia', logo: 'https://www.carlogos.org/car-logos/kia-logo.png', status: 'current' },
      { name: 'Honda Cars', logo: 'https://www.carlogos.org/car-logos/honda-logo.png', status: 'upcoming' },
      { name: 'MG Motor', logo: 'https://www.carlogos.org/car-logos/mg-logo.png', status: 'current' },
      { name: 'Skoda', logo: 'https://www.carlogos.org/car-logos/skoda-logo.png', status: 'current' },
      { name: 'Renault', logo: 'https://www.carlogos.org/car-logos/renault-logo.png', status: 'current' },
      { name: 'Nissan', logo: 'https://www.carlogos.org/car-logos/nissan-logo.png', status: 'expired' },
      { name: 'Volkswagen', logo: 'https://www.carlogos.org/car-logos/volkswagen-logo.png', status: 'current' },
      { name: 'Hero MotoCorp', logo: 'https://www.carlogos.org/logo/Hero-MotoCorp-logo.png', status: 'current' },
      { name: 'Honda', logo: 'https://www.carlogos.org/car-logos/honda-logo.png', status: 'current' },
      { name: 'TVS', logo: 'https://www.carlogos.org/logo/TVS-Motor-logo.png', status: 'current' },
      { name: 'Bajaj', logo: 'https://www.carlogos.org/logo/Bajaj-Auto-logo.png', status: 'current' },
      { name: 'Royal Enfield', logo: 'https://www.carlogos.org/logo/Royal-Enfield-logo.png', status: 'current' },
      { name: 'Yamaha', logo: 'https://www.carlogos.org/logo/Yamaha-motor-logo.png', status: 'current' },
      { name: 'KTM', logo: 'https://www.carlogos.org/logo/KTM-logo.png', status: 'upcoming' },
      { name: 'Suzuki', logo: 'https://www.carlogos.org/car-logos/suzuki-logo.png', status: 'current' }
    ];

    // 3. Update existing brands
    for (const b of brandsData) {
      await query(`
        UPDATE brands 
        SET image_url = ?, status = ? 
        WHERE name = ?
      `, [b.logo, b.status, b.name]);
    }
    console.log('Updated brand metadata.');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
