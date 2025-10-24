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
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT DEFAULT 'User',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // CLIENTS
  await run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // PROJECTS
  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'active',
      budget REAL,
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
      date TEXT NOT NULL,               -- ISO YYYY-MM-DD
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // FILES
  await run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      size INTEGER,
      version INTEGER DEFAULT 1,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // NOTIFICATIONS
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

  // UPDATES
  await run(`
    CREATE TABLE IF NOT EXISTS updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// single promise to await in index.js
export const ready = init();
