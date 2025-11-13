// server/src/db.js
import sqlite3 from "sqlite3";
import { fileURLToPath } from "node:url";
import path from "node:path";

sqlite3.verbose();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "data.sqlite"); // DB lives in server/src
export const db = new sqlite3.Database(dbPath);

// Promise helpers
export const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this); // { lastID, changes }
    });
  });

export const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

export const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

export async function init() {
  await run("PRAGMA foreign_keys = ON;");

  // USERS 
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT DEFAULT 'User',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // STAFF 
  await run(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      role TEXT,
      department TEXT,
      status TEXT CHECK(status IN ('active','inactive','pending')) DEFAULT 'active',
      join_date TEXT,
      phone TEXT,
      location TEXT,
      projects_active INTEGER DEFAULT 0,
      avatar_url TEXT
    );
  `);

  // CLIENTS
  await run(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    company TEXT,
    status TEXT DEFAULT 'active',
    total_projects INTEGER DEFAULT 0,
    current_projects INTEGER DEFAULT 0,
    total_value TEXT,
    join_date TEXT,
    last_contact TEXT,
    notes TEXT,
    industry TEXT,
    website TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

  await run(`
  CREATE TABLE IF NOT EXISTS client_project_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT,
    value TEXT,
    start_date TEXT,
    end_date TEXT,
    description TEXT
  );
`);

await run(`
  CREATE TABLE IF NOT EXISTS client_communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT,
    subject TEXT,
    date TEXT,
    summary TEXT
  );
`);


  // PROJECTS
  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client_id INTEGER,
      status TEXT,
      budget REAL,
      due_date TEXT,
      start_date TEXT,
      location TEXT,
      description TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );
  `);

  // TASKS
  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      assignee TEXT DEFAULT '',
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await run(`CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);`);

  // EVENTS
  await run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,    -- ISO date string
      type TEXT,             -- meeting / review / planning / deadline / etc.
      time TEXT,             -- "HH:MM" 24h
      project_id INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);

  // FILES 
  await run(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    original_name TEXT NOT NULL,
    stored_name TEXT,          
    file_type TEXT,
    file_size INTEGER,
    notes TEXT,
    upload_date TEXT,
    version TEXT,
    status TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);


  // NOTIFICATIONS (optional, used by backend later)
  await run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      level TEXT DEFAULT 'info',
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // UPDATES (for announcements / changelog)
  await run(`
    CREATE TABLE IF NOT EXISTS updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MESSAGE CHANNELS
  await run(`
    CREATE TABLE IF NOT EXISTS message_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT,               -- public | project | team
      description TEXT,
      unread_count INTEGER DEFAULT 0,
      last_message TEXT,
      last_activity TEXT
    );
  `);

  // MESSAGES
  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      body TEXT NOT NULL,
      timestamp_label TEXT,    -- "10:30 AM"
      date_label TEXT,         -- "Today"
      is_own INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (channel_id) REFERENCES message_channels(id)
    );
  `);
}

// single promise to await in index.js
export const ready = init();
