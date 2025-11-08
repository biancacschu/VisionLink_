// server/src/routes.tasks.js
import { all, get, run } from "./db.js";        // adjust to '../db.js' if needed
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

  // server/src/routes.tasks.js

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      // Destructure ONLY the values you are using (title, project_id, status, priority, due_date)
      const { project_id, title, status, priority, due_date } = req.body || {};
      
      // CORRECT VALIDATION: ONLY check for title
      if (!title) {
        return res.status(400).json({ error: "Title is required to create a task" });
      }

      // Prepare the final values array
      // Convert project_id to SQL NULL if it is undefined or null from the request.
      const final_project_id = project_id || null;
      const values = [
        final_project_id,
        title,
        status || "todo",
        priority || "medium",
        due_date || null
      ];

      // Note: The SQL INSERT statement must have 5 columns and 5 placeholders!
      const out = await run(
        `INSERT INTO tasks (project_id, title, status, priority, due_date)
          VALUES (?,?,?,?,?)`,
        values
      );
      
      const row = await get(`SELECT * FROM tasks WHERE id = ?`, [out.lastID]);
      res.status(201).json(row);
      
    } catch (e) {
      // This catches actual DB errors (like NOT NULL violations if the schema were wrong)
      console.error("POST /api/tasks:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  app.put("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body || {};

    // 1. Filter out unwanted fields and ensure `null` values are kept
      const fields = ['title', 'status', 'priority', 'due_date', 'project_id']; 
      const validUpdates = {};
      
      // Use the fields array to only consider columns that exist in the DB
      fields.forEach(field => {
        // 💥 FIX: Use Object.prototype.hasOwnProperty.call to check for key existence.
        // This ensures that fields with a value of `null` (like unassigning a project)
        // are correctly included in the `validUpdates` object.
        if (Object.prototype.hasOwnProperty.call(updates, field)) {
          validUpdates[field] = updates[field];
        }
      });
      
      // 2. Build the dynamic SQL query
      const keys = Object.keys(validUpdates);

      // If no valid fields were provided, return a 400 early
      if (keys.length === 0) {
        return res.status(400).json({ error: "No fields provided for update." });
      }

      // Build the "SET key = ?" string dynamically
      const setClauses = keys.map(key => `${key} = ?`).join(', ');
      const sql = `UPDATE tasks SET ${setClauses} WHERE id=?`;
      
      // 3. Prepare values for the statement
      const values = keys.map(key => validUpdates[key]);
      values.push(id); // Add the ID to the end for the WHERE clause

      // 4. Run the query
      await run(sql, values);

      // 5. Respond with the updated row
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