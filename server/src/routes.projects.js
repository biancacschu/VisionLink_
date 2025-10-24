// server/src/routes.projects.js
import { all, get, run } from "./db.js";
import { requireAuth } from "./auth.js";

export function projectsRoutes(app) {
  // List projects (with client name)
  app.get("/api/projects", requireAuth, async (_req, res) => {
    try {
      const rows = await all(
        `SELECT p.id, p.name, p.status, p.budget, p.due_date, p.created_at,
                c.id AS client_id, c.name AS client_name
           FROM projects p
           LEFT JOIN clients c ON c.id = p.client_id
          ORDER BY p.created_at DESC`
      );
      res.json(rows);
    } catch (e) {
      console.error("GET /api/projects:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  // Create a project
  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const { name, client_id = null, status = "active", budget = null, due_date = null } = req.body ?? {};
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "name required" });
      }
      const out = await run(
        `INSERT INTO projects (name, client_id, status, budget, due_date) VALUES (?,?,?,?,?)`,
        [name.trim(), client_id, status, budget, due_date]
      );
      const row = await get(
        `SELECT p.id, p.name, p.status, p.budget, p.due_date, p.created_at,
                c.id AS client_id, c.name AS client_name
           FROM projects p
           LEFT JOIN clients c ON c.id = p.client_id
          WHERE p.id = ?`,
        [out.lastID]
      );
      res.status(201).json(row);
    } catch (e) {
      console.error("POST /api/projects:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  // Update a project
  app.put("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name, client_id, status, budget, due_date } = req.body ?? {};
      await run(
        `UPDATE projects
            SET name      = COALESCE(?, name),
                client_id = COALESCE(?, client_id),
                status    = COALESCE(?, status),
                budget    = COALESCE(?, budget),
                due_date  = COALESCE(?, due_date)
          WHERE id = ?`,
        [name ?? null, client_id ?? null, status ?? null, budget ?? null, due_date ?? null, id]
      );
      const row = await get(
        `SELECT p.id, p.name, p.status, p.budget, p.due_date, p.created_at,
                c.id AS client_id, c.name AS client_name
           FROM projects p
           LEFT JOIN clients c ON c.id = p.client_id
          WHERE p.id = ?`,
        [id]
      );
      res.json(row);
    } catch (e) {
      console.error("PUT /api/projects/:id:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  // Delete a project
  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await run(`DELETE FROM projects WHERE id = ?`, [id]);
      res.status(204).end();
    } catch (e) {
      console.error("DELETE /api/projects/:id:", e);
      res.status(500).json({ error: "DB error" });
    }
  });
}
