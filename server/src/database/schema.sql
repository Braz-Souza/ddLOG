-- Users table with encrypted PIN storage
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  pin_hash TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  locked_until DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table with encrypted data
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  reminder_time TEXT,
  category TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
  AFTER UPDATE ON users
  BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp 
  AFTER UPDATE ON tasks
  BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Trigger to set completed_at when task is marked as completed
CREATE TRIGGER IF NOT EXISTS set_completed_at 
  AFTER UPDATE ON tasks
  WHEN NEW.completed = 1 AND OLD.completed = 0
  BEGIN
    UPDATE tasks SET completed_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Trigger to clear completed_at when task is marked as incomplete
CREATE TRIGGER IF NOT EXISTS clear_completed_at 
  AFTER UPDATE ON tasks
  WHEN NEW.completed = 0 AND OLD.completed = 1
  BEGIN
    UPDATE tasks SET completed_at = NULL WHERE id = NEW.id;
  END;

