// server/src/routes.projects.js
import { all, get, run } from "./db.js";

/**
 * Projects API
 *
 * DB schema (from db.js):
 *   projects (
 *     id INTEGER PRIMARY KEY AUTOINCREMENT,
 *     name TEXT NOT NULL,
 *     client_id INTEGER,
 *     status TEXT,
 *     budget REAL,
 *     due_date TEXT,
 *     start_date TEXT,
 *     location TEXT,
 *     description TEXT
 *   )
 *
 * Also uses:
 *   clients(id, name, ...)
 *   tasks(project_id, status, ...)
 */

function mapRowToProject(row) {
  const totalTasks = row.total_tasks || 0;
  const doneTasks = row.done_tasks || 0;
  const progress =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return {
    id: row.id,
    name: row.name,
    clientId: row.client_id,
    clientName: row.client_name || null,
    status: row.status || "Planning",
    budget: row.budget ?? null,
    dueDate: row.due_date ?? null,
    startDate: row.start_date ?? null,
    location: row.location ?? null,
    description: row.description ?? "",
    // derived
    totalTasks,
    doneTasks,
    progress,
  };
}

export function projectsRoutes(app) {
  // GET /api/projects
  app.get("/api/projects", async (_req, res, next) => {
    try {
      const rows = await all(
        `
        SELECT
          p.id,
          p.name,
          p.client_id,
          c.name AS client_name,
          p.status,
          p.budget,
          p.due_date,
          p.start_date,
          p.location,
          p.description,
          COUNT(t.id) AS total_tasks,
          SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS done_tasks
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN tasks t ON t.project_id = p.id
        GROUP BY p.id
        ORDER BY p.id ASC
        `
      );

      res.json(rows.map(mapRowToProject));
    } catch (err) {
      console.error("Error in GET /api/projects:", err);
      res.status(500).json({ error: "DB error" });
    }
  });

  // POST /api/projects
  app.post("/api/projects", async (req, res, next) => {
    try {
      const {
        name,
        clientId,
        clientName,
        status,
        budget,
        dueDate,
        startDate,
        location,
        description,
      } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: "name is required" });
      }

      // resolve client_id: prefer clientId, else find-or-create by clientName
      let resolvedClientId = clientId ?? null;

      if (!resolvedClientId && clientName) {
        const existing = await get(
          `SELECT id FROM clients WHERE name = ?`,
          [clientName]
        );
        if (existing) {
          resolvedClientId = existing.id;
        } else {
          const insertClient = await run(
            `INSERT INTO clients (name, status) VALUES (?, ?)`,
            [clientName, "active"]
          );
          resolvedClientId = insertClient.lastID;
        }
      }

      const numericBudget =
        typeof budget === "string"
          ? Number(budget.replace(/[^\d.]/g, "")) || null
          : typeof budget === "number"
          ? budget
          : null;

      const result = await run(
        `
        INSERT INTO projects
          (name, client_id, status, budget, due_date, start_date, location, description)
        VALUES (?,?,?,?,?,?,?,?)
        `,
        [
          name,
          resolvedClientId,
          status || "Planning",
          numericBudget,
          dueDate || null,
          startDate || null,
          location || null,
          description || "",
        ]
      );

      const row = await get(
        `
        SELECT
          p.id,
          p.name,
          p.client_id,
          c.name AS client_name,
          p.status,
          p.budget,
          p.due_date,
          p.start_date,
          p.location,
          p.description,
          0 AS total_tasks,
          0 AS done_tasks
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.id = ?
        `,
        [result.lastID]
      );

      res.status(201).json(mapRowToProject(row));
    } catch (err) {
      console.error("Error in POST /api/projects:", err);
      res.status(500).json({ error: "DB error" });
    }
  });

  // PUT /api/projects/:id
  app.put("/api/projects/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        name,
        clientId,
        clientName,
        status,
        budget,
        dueDate,
        startDate,
        location,
        description,
      } = req.body || {};

      const existing = await get(`SELECT * FROM projects WHERE id = ?`, [id]);
      if (!existing) {
        return res.status(404).json({ error: "Project not found" });
      }

      // resolve client_id if changed
      let resolvedClientId = existing.client_id;

      if (typeof clientId !== "undefined") {
        resolvedClientId = clientId;
      } else if (clientName) {
        const existingClient = await get(
          `SELECT id FROM clients WHERE name = ?`,
          [clientName]
        );
        if (existingClient) {
          resolvedClientId = existingClient.id;
        } else {
          const insertClient = await run(
            `INSERT INTO clients (name, status) VALUES (?, ?)`,
            [clientName, "active"]
          );
          resolvedClientId = insertClient.lastID;
        }
      }

      const numericBudget =
        typeof budget === "string"
          ? Number(budget.replace(/[^\d.]/g, "")) || existing.budget
          : typeof budget === "number"
          ? budget
          : existing.budget;

      const newName = name ?? existing.name;
      const newStatus = status ?? existing.status;
      const newDueDate = typeof dueDate !== "undefined" ? dueDate : existing.due_date;
      const newStartDate =
        typeof startDate !== "undefined" ? startDate : existing.start_date;
      const newLocation =
        typeof location !== "undefined" ? location : existing.location;
      const newDescription =
        typeof description !== "undefined" ? description : existing.description;

      await run(
        `
        UPDATE projects
        SET name = ?, client_id = ?, status = ?, budget = ?, due_date = ?, start_date = ?, location = ?, description = ?
        WHERE id = ?
        `,
        [
          newName,
          resolvedClientId,
          newStatus,
          numericBudget,
          newDueDate,
          newStartDate,
          newLocation,
          newDescription,
          id,
        ]
      );

      const row = await get(
        `
        SELECT
          p.id,
          p.name,
          p.client_id,
          c.name AS client_name,
          p.status,
          p.budget,
          p.due_date,
          p.start_date,
          p.location,
          p.description,
          COUNT(t.id) AS total_tasks,
          SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS done_tasks
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN tasks t ON t.project_id = p.id
        WHERE p.id = ?
        GROUP BY p.id
        `,
        [id]
      );

      res.json(mapRowToProject(row));
    } catch (err) {
      console.error("Error in PUT /api/projects/:id:", err);
      res.status(500).json({ error: "DB error" });
    }
  });

  // DELETE /api/projects/:id
  app.delete("/api/projects/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      await run(`DELETE FROM projects WHERE id = ?`, [id]);
      // tasks will be deleted automatically if FK ON DELETE CASCADE is set as in db.js
      res.status(204).end();
    } catch (err) {
      console.error("Error in DELETE /api/projects/:id:", err);
      res.status(500).json({ error: "DB error" });
    }
  });
}
