import { all } from "./db.js";
const tables = await all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log("Tables:", tables);
const sample = await all("SELECT id, title, created_at FROM updates ORDER BY created_at DESC LIMIT 5").catch(e => []);
console.log("Sample updates:", sample);
