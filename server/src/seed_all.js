// seed_all.js
import { run, get, all } from "./db.js";
import bcrypt from "bcryptjs";

const adminEmail = "admin@visionlink.app";
const adminPass = "VisionLink123!";

const now = () => new Date().toISOString();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const toISODate = (y, m, d) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const hex = (len = 6) =>
  Array.from({ length: len }, () => "abcdef0123456789"[randInt(0, 15)]).join("");

try {
  await run("BEGIN");
  // Keep/ensure admin, nuke everything else to reseed consistently
  const adminRow = await get("SELECT id FROM users WHERE email = ?", [adminEmail]);
  let adminId = adminRow?.id;
  if (!adminId) {
    const hash = bcrypt.hashSync(adminPass, 10);
    const r = await run(
      "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?,?,?,?,?)",
      [adminEmail, hash, "Vision", "Admin", "Admin"]
    );
    adminId = r.lastID;
    console.log("Seeded admin user:", adminEmail, "password:", adminPass);
  }

  // Wipe in FK-safe order (tasks CASCADE on projects)
  await run("DELETE FROM notifications");
  await run("DELETE FROM files");
  await run("DELETE FROM events");
  await run("DELETE FROM updates");
  await run("DELETE FROM tasks");
  await run("DELETE FROM projects");
  await run("DELETE FROM clients");
  await run("DELETE FROM users WHERE id <> ?", [adminId]);
  // Reset autoincrement counters (optional)
  await run('DELETE FROM sqlite_sequence WHERE name IN ("notifications","files","events","updates","tasks","projects","clients","users")');

  // === Reseed (same model as seed.js) ===
  const demoPass = bcrypt.hashSync("demo123", 10);
  const userDefs = [
    { email: "alex.pm@demo.local", first: "Alex", last: "Pillay", role: "Project Manager" },
    { email: "zanele.pm@demo.local", first: "Zanele", last: "Mbatha", role: "Project Manager" },
    { email: "mia.designer@demo.local", first: "Mia", last: "Naidoo", role: "Designer" },
    { email: "thabo.designer@demo.local", first: "Thabo", last: "Dlamini", role: "Designer" },
    { email: "sarah.designer@demo.local", first: "Sarah", last: "Jacobs", role: "Designer" },
    { email: "pieter.draught@demo.local", first: "Pieter", last: "van Wyk", role: "Draughtsman" },
    { email: "claire.client@demo.local", first: "Claire", last: "Botha", role: "Client" },
  ];
  const staffNames = [];
  for (const u of userDefs) {
    const r = await run(
      "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?,?,?,?,?)",
      [u.email, demoPass, u.first, u.last, u.role]
    );
    if (["Project Manager", "Designer", "Draughtsman"].includes(u.role)) {
      staffNames.push(`${u.first} ${u.last}`);
    }
  }

  const clients = [
    { name: "Shoreline Developments", email: "info@shoreline.dev", phone: "+27 31 555 0101", city: "Ballito", addr: "12 Compensation Rd, Ballito, 4399, KZN" },
    { name: "Lighthouse Legal", email: "contact@lighthouse.legal", phone: "+27 31 555 0202", city: "Umhlanga", addr: "45 Lagoon Dr, Umhlanga, 4320, KZN" },
    { name: "Meadowbrook Estates", email: "hello@meadowbrook.est", phone: "+27 31 555 0303", city: "Hillcrest", addr: "7 Old Main Rd, Hillcrest, 3650, KZN" },
    { name: "Coastal Living Co.", email: "team@coastalliving.co", phone: "+27 31 555 0404", city: "Ballito", addr: "1 Sandra Rd, Ballito, 4420, KZN" },
  ];
  const clientIdByName = new Map();
  for (const c of clients) {
    const r = await run(
      "INSERT INTO clients (name, email, phone, status) VALUES (?,?,?,?)",
      [c.name, c.email, c.phone, "active"]
    );
    clientIdByName.set(c.name, r.lastID);
  }

  const projects = [
    { name: "Beachfront Apartment Refresh", client: "Shoreline Developments", status: "active", budget: 180000, start: toISODate(2025, 8, 15), end: toISODate(2025, 11, 30) },
    { name: "Umhlanga Office Fitout", client: "Lighthouse Legal", status: "planning", budget: 350000, start: toISODate(2025, 9, 1), end: toISODate(2025, 12, 15) },
    { name: "Hillcrest Family Home Remodel", client: "Meadowbrook Estates", status: "active", budget: 900000, start: toISODate(2025, 6, 10), end: toISODate(2025, 10, 5) },
    { name: "Ballito Boutique Store", client: "Coastal Living Co.", status: "on_hold", budget: 220000, start: toISODate(2025, 10, 1), end: toISODate(2026, 1, 31) },
    { name: "Umhlanga Penthouse Styling", client: "Shoreline Developments", status: "completed", budget: 140000, start: toISODate(2025, 5, 20), end: toISODate(2025, 9, 25) },
  ];
  const projectIdByName = new Map();
  for (const p of projects) {
    const r = await run(
      "INSERT INTO projects (name, client_id, status, budget, due_date, created_at) VALUES (?,?,?,?,?,?)",
      [p.name, clientIdByName.get(p.client), p.status, p.budget, p.end, p.start]
    );
    projectIdByName.set(p.name, r.lastID);
  }

  const statuses = ["todo", "in_progress", "blocked", "done"];
  const priorities = ["low", "medium", "high", "urgent"];
  const taskTitlePool = [
    "Mood board & concept",
    "Materials shortlist",
    "Contractor quote review",
    "Site measurement",
    "Electrical layout proposal",
    "Plumbing fixture list",
    "Flooring selection",
    "Lighting plan draft",
    "3D render pass",
    "Client feedback incorporation",
    "Joinery detail pack",
    "Paint & finish schedule",
    "Procurement checklist",
    "Delivery coordination",
    "Snag list prep",
  ];
  const perProjectTaskTarget = {
    "Beachfront Apartment Refresh": 12,
    "Umhlanga Office Fitout": 10,
    "Hillcrest Family Home Remodel": 14,
    "Ballito Boutique Store": 8,
    "Umhlanga Penthouse Styling": 8,
  };
  const taskIds = [];
  for (const p of projects) {
    const pid = projectIdByName.get(p.name);
    const n = perProjectTaskTarget[p.name] ?? 10;
    for (let i = 0; i < n; i++) {
      const title = `${pick(taskTitlePool)} ${i + 1}`;
      const status = pick(statuses);
      const priority = pick(priorities);
      const assignee = pick(staffNames);
      const end = new Date(p.end);
      const due = new Date(end.getTime());
      due.setDate(end.getDate() - randInt(0, 30));
      const r = await run(
        "INSERT INTO tasks (project_id, title, description, status, priority, assignee, due_date, created_at) VALUES (?,?,?,?,?,?,?,?)",
        [
          pid,
          title,
          `Auto-generated task for project: ${p.name}`,
          status,
          priority,
          assignee,
          toISODate(due.getFullYear(), due.getMonth() + 1, due.getDate()),
          p.start,
        ]
      );
      taskIds.push({ id: r.lastID, project: p.name, assignee, status });
    }
  }

  // Files (8–12) with versions
  const fileBase = [
    { base: "FloorPlan.pdf", ext: "pdf", versions: 2 },
    { base: "Moodboard.jpg", ext: "jpg", versions: 1 },
    { base: "ClientBrief.docx", ext: "docx", versions: 1 },
    { base: "LightingSchedule.xlsx", ext: "xlsx", versions: 2 },
  ];
  let totalFiles = 0;
  for (const p of projects) {
    if (totalFiles >= 12) break;
    const pid = projectIdByName.get(p.name);
    const subset = fileBase.slice(0, randInt(2, 4));
    for (const f of subset) {
      for (let v = 1; v <= f.versions; v++) {
        const stored = `${f.base.replace(/\.[^.]+$/, "")}-v${v}-${hex(6)}.${f.ext}`;
        await run(
          "INSERT INTO files (name, stored_name, size, version, project_id, uploaded_at) VALUES (?,?,?,?,?,?)",
          [f.base, stored, randInt(50_000, 1_500_000), v, pid, now()]
        );
        totalFiles++;
        if (totalFiles >= 12) break;
      }
      if (totalFiles >= 12) break;
    }
  }

  // Updates (include "comments" + client address notes)
  const commentPhrases = [
    "Looks good, proceed to next step.",
    "Please revise the color palette.",
    "Waiting on supplier confirmation.",
    "Client prefers matte finishes.",
    "Double-check measurements for bedroom 2.",
    "Align lighting with ceiling grid.",
  ];
  for (const c of clients) {
    await run("INSERT INTO updates (title) VALUES (?)", [
      `Client "${c.name}" address noted: ${c.addr}`,
    ]);
  }
  for (const t of taskIds.slice(0, 20)) {
    await run("INSERT INTO updates (title) VALUES (?)", [
      `Task #${t.id} assigned to ${t.assignee} on ${t.project}`,
    ]);
    const comments = randInt(1, 2);
    for (let k = 0; k < comments; k++) {
      await run("INSERT INTO updates (title) VALUES (?)", [
        `Comment on Task #${t.id}: ${pick(commentPhrases)}`,
      ]);
    }
  }

  // Events (6–10)
  const eventTitles = [
    "Daily stand-up",
    "Client design review",
    "Site visit",
    "Procurement check-in",
    "Handover prep",
    "Final snag review",
    "Deadline",
  ];
  let eventCount = 0;
  for (const p of projects) {
    const pid = projectIdByName.get(p.name);
    const howMany = randInt(1, 3);
    for (let i = 0; i < howMany; i++) {
      const d = new Date(p.start);
      d.setDate(d.getDate() + randInt(7, 90));
      await run(
        "INSERT INTO events (title, date, project_id, created_at) VALUES (?,?,?,?)",
        [
          `${pick(eventTitles)} — ${p.name}`,
          toISODate(d.getFullYear(), d.getMonth() + 1, d.getDate()),
          pid,
          now(),
        ]
      );
      eventCount++;
      if (eventCount >= 10) break;
    }
    if (eventCount >= 10) break;
  }

  // Notifications (5–7)
  const notifyUsers = await all(
    "SELECT id FROM users WHERE role IN ('Project Manager','Designer','Draughtsman') ORDER BY id LIMIT 7"
  );
  const someTasks = taskIds.slice(0, notifyUsers.length);
  for (let i = 0; i < notifyUsers.length; i++) {
    const u = notifyUsers[i];
    const t = someTasks[i];
    await run(
      "INSERT INTO notifications (user_id, message, level, read) VALUES (?,?,?,?)",
      [
        u.id,
        t ? `Task #${t.id} is due soon on ${t.project}` : "New project activity available.",
        pick(["info", "warning"]),
        0,
      ]
    );
  }

  await run("COMMIT");
  console.log("✅ Full reseed complete.");
  process.exit(0);
} catch (e) {
  await run("ROLLBACK");
  console.error("Seed failed:", e);
  process.exit(1);
}
