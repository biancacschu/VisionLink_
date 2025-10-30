// seed.js
import { db, run, get, all } from "./db.js";
import bcrypt from "bcryptjs";

/**
 * This script:
 * 1) Ensures the admin user exists (email/password unchanged).
 * 2) If the DB has no projects yet, seeds a full demo dataset:
 *    - Users (PMs, Designers, Draughtsman, Client)
 *    - Clients (KZN-based companies; addresses reflected in updates/events text due to schema)
 *    - Projects (4–6) with varied statuses, budgets, start(=created_at)/end(=due_date)
 *    - Tasks (~50) across projects with varied statuses/priorities/assignees
 *    - Files (8–12) with simple versioning (multiple rows, incremented `version`)
 *    - Updates (activity feed) including “comments”
 *    - Events (calendar)
 *    - Notifications (for several users)
 */

const adminEmail = "admin@visionlink.app";
const adminPass = "VisionLink123!";

// Helpers
const now = () => new Date().toISOString();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const toISODate = (y, m, d) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const hex = (len = 6) =>
  Array.from({ length: len }, () => "abcdef0123456789"[randInt(0, 15)]).join("");

// Main
(async function seed() {
  await run("BEGIN");
  try {
    // 1) Ensure admin
    let admin = await get("SELECT id FROM users WHERE email = ?", [adminEmail]);
    if (!admin) {
      const hash = bcrypt.hashSync(adminPass, 10);
      const r = await run(
        "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?,?,?,?,?)",
        [adminEmail, hash, "Vision", "Admin", "Admin"]
      );
      admin = { id: r.lastID };
      console.log("Seeded admin user:", adminEmail, "password:", adminPass);
    } else {
      console.log("Admin user already exists");
    }

    // Short-circuit if already seeded (projects present)
    const projCount = await get("SELECT COUNT(*) AS c FROM projects");
    if (projCount.c > 0) {
      await run("COMMIT");
      console.log("Projects already present → skipping demo seed.");
      return;
    }

    // 2) Users
    const demoPass = bcrypt.hashSync("demo123", 10);
    const userDefs = [
      // 2 x PMs
      { email: "alex.pm@demo.local", first: "Alex", last: "Pillay", role: "Project Manager" },
      { email: "zanele.pm@demo.local", first: "Zanele", last: "Mbatha", role: "Project Manager" },
      // 3 x Designers
      { email: "mia.designer@demo.local", first: "Mia", last: "Naidoo", role: "Designer" },
      { email: "thabo.designer@demo.local", first: "Thabo", last: "Dlamini", role: "Designer" },
      { email: "sarah.designer@demo.local", first: "Sarah", last: "Jacobs", role: "Designer" },
      // 1 x Draughtsman
      { email: "pieter.draught@demo.local", first: "Pieter", last: "van Wyk", role: "Draughtsman" },
      // 1 x Client user
      { email: "claire.client@demo.local", first: "Claire", last: "Botha", role: "Client" },
    ];
    const userIdsByName = new Map(); // "First Last" -> id

    for (const u of userDefs) {
      const exists = await get("SELECT id FROM users WHERE email = ?", [u.email]);
      if (!exists) {
        const r = await run(
          "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?,?,?,?,?)",
          [u.email, demoPass, u.first, u.last, u.role]
        );
        userIdsByName.set(`${u.first} ${u.last}`, r.lastID);
      } else {
        userIdsByName.set(`${u.first} ${u.last}`, exists.id);
      }
    }
    // Map for convenience
    const allUsers = await all("SELECT id, first_name || ' ' || last_name AS name, role FROM users");
    const nameById = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));
    const staffAssignees = allUsers
      .filter((u) => ["Project Manager", "Designer", "Draughtsman"].includes(u.role))
      .map((u) => u.name);

    // 3) Clients (addresses represented in updates/events text due to schema)
    const clients = [
      { name: "Shoreline Developments", email: "info@shoreline.dev", phone: "+27 31 555 0101", city: "Ballito", addr: "12 Compensation Rd, Ballito, 4399, KZN" },
      { name: "Lighthouse Legal", email: "contact@lighthouse.legal", phone: "+27 31 555 0202", city: "Umhlanga", addr: "45 Lagoon Dr, Umhlanga, 4320, KZN" },
      { name: "Meadowbrook Estates", email: "hello@meadowbrook.est", phone: "+27 31 555 0303", city: "Hillcrest", addr: "7 Old Main Rd, Hillcrest, 3650, KZN" },
      { name: "Coastal Living Co.", email: "team@coastalliving.co", phone: "+27 31 555 0404", city: "Ballito", addr: "1 Sandra Rd, Ballito, 4420, KZN" },
    ];
    const clientIdByName = new Map();
    for (const c of clients) {
      let row = await get("SELECT id FROM clients WHERE name = ?", [c.name]);
      if (!row) {
        const r = await run(
          "INSERT INTO clients (name, email, phone, status) VALUES (?,?,?,?)",
          [c.name, c.email, c.phone, "active"]
        );
        row = { id: r.lastID };
      }
      clientIdByName.set(c.name, row.id);
    }

    // 4) Projects (use created_at as "start date")
    const projects = [
      {
        name: "Beachfront Apartment Refresh",
        client: "Shoreline Developments",
        status: "active",
        budget: 180000,
        start: toISODate(2025, 8, 15),
        end: toISODate(2025, 11, 30),
      },
      {
        name: "Umhlanga Office Fitout",
        client: "Lighthouse Legal",
        status: "planning",
        budget: 350000,
        start: toISODate(2025, 9, 1),
        end: toISODate(2025, 12, 15),
      },
      {
        name: "Hillcrest Family Home Remodel",
        client: "Meadowbrook Estates",
        status: "active",
        budget: 900000,
        start: toISODate(2025, 6, 10),
        end: toISODate(2025, 10, 5),
      },
      {
        name: "Ballito Boutique Store",
        client: "Coastal Living Co.",
        status: "on_hold",
        budget: 220000,
        start: toISODate(2025, 10, 1),
        end: toISODate(2026, 1, 31),
      },
      {
        name: "Umhlanga Penthouse Styling",
        client: "Shoreline Developments",
        status: "completed",
        budget: 140000,
        start: toISODate(2025, 5, 20),
        end: toISODate(2025, 9, 25),
      },
    ];
    const projectIdByName = new Map();
    for (const p of projects) {
      let row = await get("SELECT id FROM projects WHERE name = ?", [p.name]);
      if (!row) {
        const r = await run(
          "INSERT INTO projects (name, client_id, status, budget, due_date, created_at) VALUES (?,?,?,?,?,?)",
          [p.name, clientIdByName.get(p.client), p.status, p.budget, p.end, p.start]
        );
        row = { id: r.lastID };
      }
      projectIdByName.set(p.name, row.id);
    }

    // 5) Tasks (~50)
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
        const assignee = pick(staffAssignees);
        // Due date distributed around project end
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

    // 6) Files (8–12) with versions
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

    // 7) Updates (15–25) — include “comments” & client address notes
    let updatesCount = 0;
    const commentPhrases = [
      "Looks good, proceed to next step.",
      "Please revise the color palette.",
      "Waiting on supplier confirmation.",
      "Client prefers matte finishes.",
      "Double-check measurements for bedroom 2.",
      "Align lighting with ceiling grid.",
    ];
    // Client address notes
    for (const c of clients) {
      await run("INSERT INTO updates (title) VALUES (?)", [
        `Client "${c.name}" address noted: ${c.addr}`,
      ]);
      updatesCount++;
    }
    // Task-related updates/comments
    for (const t of taskIds.slice(0, 20)) {
      await run("INSERT INTO updates (title) VALUES (?)", [
        `Task #${t.id} assigned to ${t.assignee} on ${t.project}`,
      ]);
      updatesCount++;
      const comments = randInt(1, 2);
      for (let k = 0; k < comments; k++) {
        await run("INSERT INTO updates (title) VALUES (?)", [
          `Comment on Task #${t.id}: ${pick(commentPhrases)}`,
        ]);
        updatesCount++;
      }
      if (updatesCount >= 25) break;
    }

    // 8) Events (6–10)
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

    // 9) Notifications (5–7)
    const notifyUsers = await all(
      "SELECT id FROM users WHERE role IN ('Project Manager','Designer','Draughtsman') ORDER BY id LIMIT 6"
    );
    const someTasks = taskIds.slice(0, notifyUsers.length);
    for (let i = 0; i < notifyUsers.length; i++) {
      const u = notifyUsers[i];
      const t = someTasks[i];
      await run(
        "INSERT INTO notifications (user_id, message, level, read) VALUES (?,?,?,?)",
        [
          u.id,
          t
            ? `You were assigned Task #${t.id} on ${t.project}`
            : "New project activity available.",
          pick(["info", "warning"]),
          0,
        ]
      );
    }

    await run("COMMIT");
    console.log("✅ Demo seed complete.");
  } catch (err) {
    await run("ROLLBACK");
    console.error("Seed failed:", err);
    process.exit(1);
  }
})();
