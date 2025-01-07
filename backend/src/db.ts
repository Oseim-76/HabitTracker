import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : undefined,
});

// Test the connection
pool.connect()
  .then(() => console.log('Database connection initialized'))
  .catch((err) => console.error('Error initializing database connection:', err)); 