import { run } from "./db.js";

try {
  await run("INSERT INTO updates (title) VALUES (?)", ["Kickoff meeting scheduled"]);
  await run("INSERT INTO updates (title) VALUES (?)", ["Client approved concept"]);
  console.log("? updates seeded");
  process.exit(0);
} catch (e) {
  console.error("Seed failed", e);
  process.exit(1);
}
