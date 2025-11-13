// server/src/routes.updates.js
import { all, run } from "./db.js";
// import { requireAuth } from "./auth.js";

export function updatesRoutes(app) {
  app.get("/api/updates", async (_req, res) => {
    try {
      const rows = await all(
        `SELECT id, title, created_at
           FROM updates
          ORDER BY datetime(created_at) DESC
          LIMIT 50`
      );
      res.json(rows);
    } catch (e) {
      console.error("GET /api/updates:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  // Optional: quick way to add an update
  app.post("/api/updates", async (req, res) => {
    try {
      const { title } = req.body ?? {};
      if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "title is required" });
      }
      await run(`INSERT INTO updates (title) VALUES (?)`, [title.trim()]);
      res.status(201).json({ ok: true });
    } catch (e) {
      console.error("POST /api/updates:", e);
      res.status(500).json({ error: "DB error" });
    }
  });
}
