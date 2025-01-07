import bcrypt from 'bcrypt';
import {pool} from '../config/database';

async function createTestUser() {
  try {
    // Create test password hash
    const password = 'test123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert or update test user
    const query = `
      INSERT INTO users (email, username, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = $3
      RETURNING id, email, username;
    `;

    const result = await pool.query(query, [
      'test@example.com',
      'testuser',
      passwordHash
    ]);

    console.log('Test user created:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser(); 