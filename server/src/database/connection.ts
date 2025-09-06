import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../../data/ddlog.db');
const ENCRYPTION_KEY = process.env.DATABASE_ENCRYPTION_KEY || 'development-key-not-secure';

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000000');
db.pragma('temp_store = memory');

const schemaPath = join(__dirname, 'schema.sql');
const schema = readFileSync(schemaPath, 'utf8');

db.exec(schema);

// Run migrations
const runMigrations = () => {
  try {
    // Check if failed_attempts column exists
    const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
    const hasFailedAttempts = columns.some(col => col.name === 'failed_attempts');
    const hasLockedUntil = columns.some(col => col.name === 'locked_until');
    
    if (!hasFailedAttempts) {
      db.exec('ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0');
      console.log('✓ Added failed_attempts column to users table');
    }
    
    if (!hasLockedUntil) {
      db.exec('ALTER TABLE users ADD COLUMN locked_until DATETIME NULL');
      console.log('✓ Added locked_until column to users table');
    }
  } catch (error) {
    console.warn('Migration warning:', error);
  }
};

runMigrations();

export const initializeDatabase = () => {
  console.log('📊 Database initialized successfully');
  console.log(`📂 Database location: ${DB_PATH}`);
};

process.on('exit', () => {
  db.close();
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

export default db;