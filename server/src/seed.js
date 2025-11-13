// server/src/seed.js

import bcrypt from "bcryptjs";
import { db, run, all, get, ready } from "./db.js";
import {
  SEED_STAFF,
  SEED_CLIENTS,
  SEED_CLIENT_PROJECT_HISTORY,
  SEED_CLIENT_COMMUNICATIONS,
  SEED_PROJECTS,
  SEED_TASKS,
  SEED_EVENTS,
  SEED_FILES,
  SEED_MESSAGE_CHANNELS,
  SEED_MESSAGES,
} from "./seed-data/demoSeed.js";

const adminEmail = "admin@visionlink.app";
const adminPass = "VisionLink123!";

function mapProjectStatus(rawStatus) {
  switch (rawStatus) {
    case "In Progress":
      return "Active"; // VisionLink_: Planning | Active | On Hold | Completed
    case "Design Phase":
      return "Planning";
    case "Material Selection":
      return "Active";
    case "Planning":
      return "Planning";
    case "Completed":
      return "Completed";
    default:
      return "Planning";
  }
}

function parseBudget(budgetString) {
  if (!budgetString) return null;
  const numeric = budgetString.replace(/[^\d.]/g, "");
  return numeric ? Number(numeric) : null;
}

function mapTaskStatus(rawStatus) {
  switch (rawStatus) {
    case "In Progress":
      return "in_progress";

    case "Todo":
    case "Pending":
    case "Not Started":
      return "todo";

    case "In Review":
      return "in_progress";

    case "Done":
    case "Completed":
      return "done";

    default:
      return "todo";
  }
}

function mapPriority(rawPriority) {
  switch (rawPriority) {
    case "High":
      return "high";
    case "Low":
      return "low";
    case "Medium":
    default:
      return "normal";
  }
}

function mapClientStatus(status) {
  if (!status) return "active";
  switch (status) {
    case "Active":
      return "active";
    case "Completed":
      return "completed";
    case "Prospect":
      return "prospect";
    case "On Hold":
      return "on_hold";
    default:
      return "active";
  }
}

// ✅ CRITICAL: wait for init() before touching the DB
async function ensureAdminUser() {
  await ready;

  const existing = await get("SELECT * FROM users WHERE email = ?", [
    adminEmail,
  ]);
  if (!existing) {
    const hash = bcrypt.hashSync(adminPass, 10);
    await run(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES (?,?,?,?,?)`,
      [adminEmail, hash, "Vision", "Admin", "Admin"]
    );
    console.log("Seeded admin user:", adminEmail, "password:", adminPass);
  } else {
    console.log("Admin user already exists");
  }
}

async function seedDomainData() {
  await ready; // ensure all tables exist

  // Count existing rows
  const [{ c: clientCount }] = await all(
    "SELECT COUNT(*) AS c FROM clients"
  );
  const [{ c: projectCount }] = await all(
    "SELECT COUNT(*) AS c FROM projects"
  );
  const [{ c: taskCount }] = await all("SELECT COUNT(*) AS c FROM tasks");
  const [{ c: staffCount }] = await all("SELECT COUNT(*) AS c FROM staff");
  const [{ c: eventCount }] = await all("SELECT COUNT(*) AS c FROM events");
  const [{ c: fileCount }] = await all("SELECT COUNT(*) AS c FROM files");
  const [{ c: channelCount }] = await all(
    "SELECT COUNT(*) AS c FROM message_channels"
  );
  const [{ c: messageCount }] = await all(
    "SELECT COUNT(*) AS c FROM messages"
  );

  const clientNameToId = new Map();
  const projectNameToId = new Map();

  // --- Seed clients ---
  if (clientCount === 0) {
    console.log("Seeding Clients");
    for (const c of SEED_CLIENTS) {
      const res = await run(
        `INSERT INTO clients (name, email, phone, status)
         VALUES (?,?,?,?)`,
        [c.name, c.email ?? null, c.phone ?? null, mapClientStatus(c.status)]
      );
      // ✅ fix: use res.lastID (not "result")
      clientNameToId.set(c.name, res.lastID);
    }
  } else {
    const rows = await all(`SELECT id, name FROM clients`);
    rows.forEach((row) => clientNameToId.set(row.name, row.id));
  }

  // --- Seed projects ---
  if (projectCount === 0) {
    console.log("Seeding Projects");
    for (const p of SEED_PROJECTS) {
      const client_id = clientNameToId.get(p.clientName) ?? null;

      const res = await run(
        `INSERT INTO projects (name, client_id, status, budget, due_date, start_date, location, description)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          p.name,
          client_id,
          mapProjectStatus(p.rawStatus),
          parseBudget(p.budgetString),
          p.end_date ?? null,
          p.start_date ?? null,
          p.location ?? null,
          p.description ?? "",
        ]
      );

      projectNameToId.set(p.name, res.lastID);
    }
  } else {
    const rows = await all("SELECT id, name FROM projects");
    rows.forEach((row) => projectNameToId.set(row.name, row.id));
  }

  // --- Seed tasks ---
  if (taskCount === 0) {
    console.log("Seeding Tasks");
    for (const t of SEED_TASKS) {
      const project_id = projectNameToId.get(t.projectName) ?? null;

      await run(
        `INSERT INTO tasks (project_id, title, description, status, priority, assignee, due_date)
         VALUES (?,?,?,?,?,?,?)`,
        [
          project_id,
          t.title,
          t.description ?? "",
          mapTaskStatus(t.rawStatus),
          mapPriority(t.rawPriority),
          t.assignee ?? "",
          t.due_date ?? null,
        ]
      );
    }
  } else {
    console.log("Tasks already exist, skipping Design-Studio seed.");
  }

  // --- Seed staff ---
  if (staffCount === 0 && Array.isArray(SEED_STAFF) && SEED_STAFF.length > 0) {
    console.log("Seeding staff members from Design-Studio StaffManager…");
    for (const s of SEED_STAFF) {
      await run(
        `INSERT INTO staff
          (name, email, role, department, status, join_date, phone, location, projects_active, avatar_url)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          s.name,
          s.email,
          s.role,
          s.department,
          s.status,
          s.join_date,
          s.phone,
          s.location,
          s.projects_active,
          s.avatar_url ?? null,
        ]
      );
    }
  } else {
    console.log("Staff already exist, skipping staff seed.");
  }

  // --- Events ---
  if (eventCount === 0 && Array.isArray(SEED_EVENTS) && SEED_EVENTS.length > 0) {
    console.log("Seeding events from Design-Studio CalendarView…");
    for (const e of SEED_EVENTS) {
      const project_id = projectNameToId.get(e.projectName) ?? null;

      await run(
        `INSERT INTO events (title, date, type, project_id, time)
         VALUES (?,?,?,?,?)`,
        [e.title, e.date, e.type, project_id, e.time ?? null]
      );
    }
  } else {
    console.log("Events already exist, skipping events seed.");
  }

  // --- Files ---
if (fileCount === 0 && Array.isArray(SEED_FILES) && SEED_FILES.length > 0) {
  console.log("Seeding files metadata from Design-Studio FileManagement…");
  for (const f of SEED_FILES) {
    const project_id = projectNameToId.get(f.projectName) ?? null;

    await run(
      `INSERT INTO files
        (project_id, original_name, file_type, file_size, notes, upload_date, version, status)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        project_id,
        f.name,                         // original_name
        f.type,                         // design / document / video / archive
        Math.round(f.sizeBytes),        // numeric size in bytes
        f.description ?? null,          // notes
        f.uploadDate ?? null,           // upload_date
        Number.parseInt(f.version, 10) || 1,
        f.status ?? "Latest",
      ]
    );
  }
} else {
  console.log("Files already exist, skipping files seed.");
}



  // --- Message channels ---
  if (channelCount === 0 && Array.isArray(SEED_MESSAGE_CHANNELS)) {
    console.log("Seeding message channels from Design-Studio Messages…");
    for (const ch of SEED_MESSAGE_CHANNELS) {
      await run(
        `INSERT INTO message_channels (name, type, description, unread_count, last_message, last_activity)
         VALUES (?,?,?,?,?,?)`,
        [
          ch.name,
          ch.type,
          ch.description,
          ch.unreadCount,
          ch.lastMessage,
          ch.lastActivity,
        ]
      );
    }
  }

  // Build map from channel name to id
  const channelNameToId = new Map();
  const channelRows = await all("SELECT id, name FROM message_channels");
  channelRows.forEach((row) => channelNameToId.set(row.name, row.id));

  // --- Messages ---
  if (messageCount === 0 && Array.isArray(SEED_MESSAGES)) {
    console.log("Seeding messages from Design-Studio Messages…");
    for (const m of SEED_MESSAGES) {
      const channel_id = m.channelId; // we seeded channels in same order

      await run(
        `INSERT INTO messages (channel_id, user_name, body, timestamp_label, date_label, is_own)
         VALUES (?,?,?,?,?,?)`,
        [
          channel_id,
          m.user,
          m.message,
          m.timestamp,
          m.date,
          m.isOwn ? 1 : 0,
        ]
      );
    }
  }

  console.log("✅ Domain seed complete.");
}

async function main() {
  try {
    // ✅ Ensure DB + tables are created first
    await ready;
    await ensureAdminUser();
    await seedDomainData();
  } catch (err) {
    console.error("Error while seeding DB:", err);
  } finally {
    // Only close DB after all of the above has finished
    db.close();
  }
}

main();
