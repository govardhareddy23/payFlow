import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'payflow',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

// Seed Users corresponding to the React mockup
const seedData = [
  {
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul@demo.com',
    address: '123 MG Road, Bangalore',
    dob: '1995-06-15',
    account: 'ACC20240001',
    ifsc: 'PYFL0123456',
    upi: 'rahulsharma9876@payflow',
    pin: '123456',
    balance: 50000.00
  },
  {
    name: 'Priya Patel',
    mobile: '8765432109',
    email: 'priya@demo.com',
    address: '45 Park Street, Mumbai',
    dob: '1998-03-22',
    account: 'ACC20240002',
    ifsc: 'UPIB0654321',
    upi: 'priyapatel8765@payflow',
    pin: '123456',
    balance: 75000.00
  }
];

async function seedDb() {
  try {
    console.log('Connecting to database for seeding...');
    const client = await pool.connect();
    
    // Check if seeded
    const { rows } = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(rows[0].count) > 0) {
      console.log('Database already has users, skipping seed.');
      client.release();
      return;
    }

    console.log('Inserting seed data...');
    
    for (const data of seedData) {
      const salt = await bcrypt.genSalt(10);
      const pinHash = await bcrypt.hash(data.pin, salt);

      const { rows: userRows } = await client.query(
        `INSERT INTO users (full_name, mobile, email, address, dob, is_verified) 
         VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
        [data.name, data.mobile, data.email, data.address, data.dob]
      );

      const userId = userRows[0].id;

      await client.query(
        `INSERT INTO bank_accounts (user_id, account_number, ifsc_code, upi_id, pin_hash, balance) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, data.account, data.ifsc, data.upi, pinHash, data.balance]
      );
    }
    
    console.log('Database seeded successfully! You can login with:');
    seedData.forEach(d => console.log(`- ${d.mobile} (PIN: ${d.pin})`));
    
    client.release();
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    pool.end();
  }
}

seedDb();
