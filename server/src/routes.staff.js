// server/src/routes.staff.js
import express from "express";
import { all, get, run } from "./db.js";

export function staffRoutes(app) {
  const router = express.Router();

  // Helper: map DB row -> API shape used in the frontend
  function mapRow(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      department: row.department,
      status: row.status,
      joinDate: row.join_date,
      phone: row.phone,
      location: row.location,
      projectsActive: row.projects_active ?? 0,
      avatar: row.avatar_url ?? null,
    };
  }

  // GET /api/staff
  router.get("/", async (_req, res, next) => {
    try {
      const rows = await all(
        `SELECT id, name, email, role, department, status,
                join_date, phone, location, projects_active, avatar_url
         FROM staff`
      );
      res.json(rows.map(mapRow));
    } catch (err) {
      next(err);
    }
  });

  // POST /api/staff  (Add Staff Member)
  router.post("/", async (req, res, next) => {
    try {
      const {
        name,
        email,
        role,
        department,
        status,
        joinDate,
        phone,
        location,
        projectsActive,
      } = req.body;

      if (!name || !email || !role) {
        return res
          .status(400)
          .json({ error: "name, email and role are required" });
      }

      const join_date =
        joinDate || new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const dept = department ?? null;
      const stat = status ?? "active";
      const projActive =
        typeof projectsActive === "number" ? projectsActive : 0;

      const result = await run(
        `INSERT INTO staff
          (name, email, role, department, status, join_date, phone, location, projects_active, avatar_url)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          name,
          email,
          role,
          dept,
          stat,
          join_date,
          phone ?? null,
          location ?? null,
          projActive,
          null, // avatar_url
        ]
      );

      const created = await get(
        `SELECT id, name, email, role, department, status,
                join_date, phone, location, projects_active, avatar_url
         FROM staff WHERE id = ?`,
        [result.lastID]
      );

      res.status(201).json(mapRow(created));
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/staff/:id  (Update Staff Member)
  router.put("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const {
        name,
        email,
        role,
        department,
        status,
        joinDate,
        phone,
        location,
        projectsActive,
      } = req.body;

      const existing = await get("SELECT * FROM staff WHERE id = ?", [id]);
      if (!existing) {
        return res.status(404).json({ error: "Staff member not found" });
      }

      const join_date =
        joinDate || existing.join_date || new Date().toISOString().slice(0, 10);

      await run(
        `UPDATE staff
         SET name = ?, email = ?, role = ?, department = ?, status = ?,
             join_date = ?, phone = ?, location = ?, projects_active = ?
         WHERE id = ?`,
        [
          name ?? existing.name,
          email ?? existing.email,
          role ?? existing.role,
          department ?? existing.department,
          status ?? existing.status,
          join_date,
          phone ?? existing.phone,
          location ?? existing.location,
          typeof projectsActive === "number"
            ? projectsActive
            : existing.projects_active,
          id,
        ]
      );

      const updated = await get(
        `SELECT id, name, email, role, department, status,
                join_date, phone, location, projects_active, avatar_url
         FROM staff WHERE id = ?`,
        [id]
      );

      res.json(mapRow(updated));
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/staff/:id
  router.delete("/:id", async (req, res, next) => {
    try {
      await run("DELETE FROM staff WHERE id = ?", [req.params.id]);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  app.use("/api/staff", router);
}
