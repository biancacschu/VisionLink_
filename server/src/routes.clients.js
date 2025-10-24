// server/src/routes.clients.js
import { all, get, run } from "./db.js";
import { requireAuth } from "./auth.js";

export function clientsRoutes(app) {
  // List clients
  app.get("/api/clients", requireAuth, async (_req, res) => {
    try {
      const rows = await all(
        `SELECT id, name, email, phone, status, created_at
           FROM clients
          ORDER BY created_at DESC`
      );
      res.json(rows);
    } catch (e) {
      console.error("GET /api/clients:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  // Create client
  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const { name, email = null, phone = null } = req.body ?? {};
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "name required" });
      }
      const out = await run(
        `INSERT INTO clients (name, email, phone) VALUES (?,?,?)`,
        [name.trim(), email, phone]
      );
      const row = await get(`SELECT * FROM clients WHERE id = ?`, [out.lastID]);
      res.status(201).json(row);
    } catch (e) {
      console.error("POST /api/clients:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  // Update client
  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name, email, phone, status } = req.body ?? {};
      await run(
        `UPDATE clients
            SET name  = COALESCE(?, name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                status= COALESCE(?, status)
          WHERE id = ?`,
        [name ?? null, email ?? null, phone ?? null, status ?? null, id]
      );
      const row = await get(`SELECT * FROM clients WHERE id = ?`, [id]);
      res.json(row ?? null);
    } catch (e) {
      console.error("PUT /api/clients/:id:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  // Delete client
  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await run(`DELETE FROM clients WHERE id = ?`, [id]);
      res.status(204).end();
    } catch (e) {
      console.error("DELETE /api/clients/:id:", e);
      res.status(500).json({ error: "DB error" });
    }
  });
}
