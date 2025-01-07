import {pool} from '../config/database';
import fs from 'fs';
import path from 'path';

const initDb = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await pool.query(sql);
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export default initDb; 