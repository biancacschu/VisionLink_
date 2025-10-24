import { run } from "./db.js";
try {
  // insert a couple of rows only if table is empty (id 1 missing)
  await run("INSERT INTO clients (name, email, phone) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM clients WHERE id=1)",
    ["Sunset Homes", "hello@sunsethomes.example", "+27 21 555 1234"]);
  await run("INSERT INTO projects (name, client_id, status, budget, due_date) SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id=1)",
    ["Beach Apartment Revamp", 1, "active", 250000, "2025-12-20"]);
  await run("INSERT INTO tasks (title, status, project_id, due_date, priority) SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE id=1)",
    ["Mood board & concept", "done", 1, "2025-10-15", "high"]);
  await run("INSERT INTO tasks (title, status, project_id, due_date, priority) SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE id=2)",
    ["Material sourcing", "in_progress", 1, "2025-11-02", "normal"]);
  await run("INSERT INTO tasks (title, status, project_id, due_date, priority) SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE id=3)",
    ["Contractor coordination", "todo", 1, "2025-11-12", "high"]);
  await run("INSERT INTO updates (title) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM updates WHERE id=1)",
    ["Kickoff meeting scheduled"]);
  await run("INSERT INTO updates (title) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM updates WHERE id=2)",
    ["Client approved concept"]);
  console.log("? Seed complete");
  process.exit(0);
} catch (e) {
  console.error("Seed failed:", e);
  process.exit(1);
}
