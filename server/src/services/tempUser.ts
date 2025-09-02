import db from '../database/connection.js';

const TEMP_USER_ID = 'temp-user-for-us1';

export const ensureTempUser = () => {
  try {
    // Check if temp user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(TEMP_USER_ID);
    
    if (!existingUser) {
      // Create temporary user for US1 testing
      db.prepare(`
        INSERT INTO users (id, pin_hash) 
        VALUES (?, ?)
      `).run(TEMP_USER_ID, 'temp-hash-for-us1');
      
      console.log('📝 Temporary user created for US1 testing');
    }
  } catch (error) {
    console.error('Error creating temporary user:', error);
  }
};

export { TEMP_USER_ID };