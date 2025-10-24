// server/src/routes.events.js
import { all, get, run } from "./db.js";
import { requireAuth } from "./auth.js";

const DEV = process.env.NODE_ENV !== "production";

async function ensureEventsTable() {
  await run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function eventsRoutes(app) {
  // Ensure table exists when this router is registered (no race)
  ensureEventsTable().catch((e) => console.error("ensureEventsTable:", e));

  app.get("/api/events", requireAuth, async (req, res) => {
    try {
      const { project_id } = req.query;
      const rows = await all(
        `SELECT id, title, "date", project_id
           FROM events
          ${project_id ? "WHERE project_id = ?" : ""}
          ORDER BY "date" ASC`,
        project_id ? [project_id] : []
      );
      res.json(rows);
    } catch (e) {
      console.error("GET /api/events:", e);
      res.status(500).json({ error: "DB error", detail: DEV ? String(e?.message || e) : undefined });
    }
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const { title, date, project_id = null } = req.body || {};
      if (!title || !date) return res.status(400).json({ error: "title and date required" });

      const out = await run(
        `INSERT INTO events (title, date, project_id) VALUES (?,?,?)`,
        [String(title).trim(), String(date), project_id]
      );
      const row = await get(`SELECT id, title, "date", project_id FROM events WHERE id = ?`, [out.lastID]);
      res.status(201).json(row);
    } catch (e) {
      console.error("POST /api/events:", e);
      res.status(500).json({ error: "DB error", detail: DEV ? String(e?.message || e) : undefined });
    }
  });

  app.put("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, date, project_id } = req.body || {};
      await run(
        `UPDATE events
            SET title = COALESCE(?, title),
                date = COALESCE(?, date),
                project_id = COALESCE(?, project_id)
          WHERE id = ?`,
        [title ?? null, date ?? null, project_id ?? null, id]
      );
      const row = await get(`SELECT id, title, "date", project_id FROM events WHERE id = ?`, [id]);
      res.json(row);
    } catch (e) {
      console.error("PUT /api/events/:id:", e);
      res.status(500).json({ error: "DB error", detail: DEV ? String(e?.message || e) : undefined });
    }
  });

  app.delete("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await run(`DELETE FROM events WHERE id = ?`, [id]);
      res.status(204).end();
    } catch (e) {
      console.error("DELETE /api/events/:id:", e);
      res.status(500).json({ error: "DB error", detail: DEV ? String(e?.message || e) : undefined });
    }
  });
}
