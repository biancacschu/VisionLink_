// server/src/routes.notifications.js
import { all, get, run } from "./db.js";
import { requireAuth } from "./auth.js";

/**
 * Notifications per-user
 * GET    /api/notifications                      (current user)
 * POST   /api/notifications                      { message, level? } -> creates for current user
 * PUT    /api/notifications/:id/read             -> mark read
 * DELETE /api/notifications/:id
 * POST   /api/notifications/mark-all-read        -> mark all read
 */
export function notificationsRoutes(app) {
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const rows = await all(
        `SELECT id, message, level, read, created_at
           FROM notifications
          WHERE user_id = ?
          ORDER BY datetime(created_at) DESC`,
        [req.user.id]
      );
      res.json(rows);
    } catch (e) {
      console.error("GET /api/notifications:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  app.post("/api/notifications", requireAuth, async (req, res) => {
    try {
      const { message, level = "info" } = req.body || {};
      if (!message) return res.status(400).json({ error: "message is required" });
      const out = await run(
        `INSERT INTO notifications (user_id, message, level, read) VALUES (?,?,?,0)`,
        [req.user.id, String(message), String(level)]
      );
      const row = await get(
        `SELECT id, message, level, read, created_at FROM notifications WHERE id = ?`,
        [out.lastID]
      );
      res.status(201).json(row);
    } catch (e) {
      console.error("POST /api/notifications:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await run(
        `UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?`,
        [id, req.user.id]
      );
      const row = await get(
        `SELECT id, message, level, read, created_at FROM notifications WHERE id = ? AND user_id = ?`,
        [id, req.user.id]
      );
      res.json(row ?? null);
    } catch (e) {
      console.error("PUT /api/notifications/:id/read:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await run(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, [id, req.user.id]);
      res.status(204).end();
    } catch (e) {
      console.error("DELETE /api/notifications/:id:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  app.post("/api/notifications/mark-all-read", requireAuth, async (req, res) => {
    try {
      await run(`UPDATE notifications SET read = 1 WHERE user_id = ?`, [req.user.id]);
      res.json({ ok: true });
    } catch (e) {
      console.error("POST /api/notifications/mark-all-read:", e);
      res.status(500).json({ error: "DB error" });
    }
  });
}
