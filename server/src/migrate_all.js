import { run } from "./db.js";

try {
  await run(`PRAGMA foreign_keys = ON`);
  await run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client_id INTEGER,
      status TEXT DEFAULT 'active',
      budget REAL,
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    )`);
  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'todo',
      project_id INTEGER,
      due_date TEXT,
      priority TEXT DEFAULT 'normal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )`);
  await run(`
    CREATE TABLE IF NOT EXISTS updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  console.log("? DB migrations complete");
  process.exit(0);
} catch (e) {
  console.error("Migration failed:", e);
  process.exit(1);
}
