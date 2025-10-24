import { run } from "./db.js";

try {
  await run(`
    CREATE TABLE IF NOT EXISTS updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("? updates table ready");
  process.exit(0);
} catch (e) {
  console.error("Migration failed", e);
  process.exit(1);
}
