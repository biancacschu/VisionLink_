// server/src/routes.events.js
import { all, run, get } from "./db.js";

/**
 * Events API
 * - GET    /api/events           -> list all events (joined with project name)
 * - POST   /api/events           -> create event
 * - PUT    /api/events/:id       -> update event
 * - DELETE /api/events/:id       -> delete event
 */
export function eventsRoutes(app) {
  // List all events
  app.get("/api/events", async (_req, res, next) => {
    try {
      const rows = await all(
        `
        SELECT 
          e.id,
          e.title,
          e.date,
          e.type,
          e.time,
          e.project_id,
          p.name AS project_name
        FROM events e
        LEFT JOIN projects p ON e.project_id = p.id
        ORDER BY e.date ASC, e.time ASC
        `
      );

      const events = rows.map((r) => ({
        id: r.id,
        title: r.title,
        date: r.date,              // "YYYY-MM-DD"
        type: r.type,              // meeting | review | planning | deadline | etc.
        time: r.time,              // "HH:MM"
        projectId: r.project_id,
        projectName: r.project_name || null,
        // convenience alias for UI that expects `project`
        project: r.project_name || null,
      }));

      res.json(events);
    } catch (err) {
      next(err);
    }
  });

  // Create a new event
  app.post("/api/events", async (req, res, next) => {
    try {
      const { title, date, time, type, projectId } = req.body || {};

      if (!title || !date) {
        return res.status(400).json({ error: "title and date are required" });
      }

      const result = await run(
        `
        INSERT INTO events (title, date, type, time, project_id)
        VALUES (?,?,?,?,?)
        `,
        [title, date, type || null, time || null, projectId ?? null]
      );

      const row = await get(
        `
        SELECT 
          e.id,
          e.title,
          e.date,
          e.type,
          e.time,
          e.project_id,
          p.name AS project_name
        FROM events e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE e.id = ?
        `,
        [result.lastID]
      );

      res.status(201).json({
        id: row.id,
        title: row.title,
        date: row.date,
        type: row.type,
        time: row.time,
        projectId: row.project_id,
        projectName: row.project_name || null,
        project: row.project_name || null,
      });
    } catch (err) {
      next(err);
    }
  });

  // Update an existing event
  app.put("/api/events/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, date, time, type, projectId } = req.body || {};

      // simple patch-style update
      const existing = await get("SELECT * FROM events WHERE id = ?", [id]);
      if (!existing) {
        return res.status(404).json({ error: "Event not found" });
      }

      const newTitle = title ?? existing.title;
      const newDate = date ?? existing.date;
      const newTime = time ?? existing.time;
      const newType = type ?? existing.type;
      const newProjectId =
        typeof projectId === "undefined" ? existing.project_id : projectId;

      await run(
        `
        UPDATE events
        SET title = ?, date = ?, time = ?, type = ?, project_id = ?
        WHERE id = ?
        `,
        [newTitle, newDate, newTime, newType, newProjectId, id]
      );

      const row = await get(
        `
        SELECT 
          e.id,
          e.title,
          e.date,
          e.type,
          e.time,
          e.project_id,
          p.name AS project_name
        FROM events e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE e.id = ?
        `,
        [id]
      );

      res.json({
        id: row.id,
        title: row.title,
        date: row.date,
        type: row.type,
        time: row.time,
        projectId: row.project_id,
        projectName: row.project_name || null,
        project: row.project_name || null,
      });
    } catch (err) {
      next(err);
    }
  });

  // Delete an event
  app.delete("/api/events/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      await run("DELETE FROM events WHERE id = ?", [id]);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });
}
