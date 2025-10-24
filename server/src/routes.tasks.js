// server/src/routes.tasks.js
import { all, get, run } from "./db.js";      // adjust to '../db.js' if needed
import { requireAuth } from "./auth.js";

export function tasksRoutes(app) {
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const { project_id } = req.query;
      const sql = project_id
        ? `SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC`
        : `SELECT * FROM tasks ORDER BY created_at DESC`;
      const rows = await all(sql, project_id ? [project_id] : []);
      res.json(rows);
    } catch (e) {
      console.error("GET /api/tasks:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const { project_id, title, description, status, priority, assignee, due_date } = req.body || {};
      if (!project_id || !title) return res.status(400).json({ error: "project_id and title required" });

      const out = await run(
        `INSERT INTO tasks (project_id, title, description, status, priority, assignee, due_date)
         VALUES (?,?,?,?,?,?,?)`,
        [project_id, title, description || "", status || "todo", priority || "medium", assignee || "", due_date || null]
      );
      const row = await get(`SELECT * FROM tasks WHERE id = ?`, [out.lastID]);
      res.status(201).json(row);
    } catch (e) {
      console.error("POST /api/tasks:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  app.put("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, description, status, priority, assignee, due_date } = req.body || {};
      await run(
        `UPDATE tasks SET title=?, description=?, status=?, priority=?, assignee=?, due_date=? WHERE id=?`,
        [title, description || "", status || "todo", priority || "medium", assignee || "", due_date || null, id]
      );
      const row = await get(`SELECT * FROM tasks WHERE id = ?`, [id]);
      res.json(row);
    } catch (e) {
      console.error("PUT /api/tasks/:id:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await run(`DELETE FROM tasks WHERE id = ?`, [id]);
      res.json({ ok: true });
    } catch (e) {
      console.error("DELETE /api/tasks/:id:", e);
      res.status(500).json({ error: "DB error" });
    }
  });
}
