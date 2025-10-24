import express from "express";
import { all, run } from "./db.js";

const r = express.Router();

// Always return JSON arrays; never 500s for these list endpoints.
// If something fails, log and return [] so the UI stays up.

r.get("/updates", async (req, res) => {
  try {
    const rows = await all("SELECT id, title, created_at FROM updates ORDER BY created_at DESC LIMIT 50");
    res.json(rows);
  } catch (e) {
    console.error("DB GET /api/updates:", e);
    res.json([]);
  }
});

r.get("/tasks", async (req, res) => {
  try {
    const rows = await all(`
      SELECT t.id, t.title, t.status, t.project_id, t.due_date, t.priority, t.created_at,
             p.name AS project_name
        FROM tasks t LEFT JOIN projects p ON p.id=t.project_id
       ORDER BY t.created_at DESC`);
    res.json(rows);
  } catch (e) {
    console.error("DB GET /api/tasks:", e);
    res.json([]);
  }
});

r.get("/projects", async (req, res) => {
  try {
    const rows = await all(`
      SELECT p.id, p.name, p.status, p.budget, p.due_date, p.created_at,
             c.id AS client_id, c.name AS client_name
        FROM projects p LEFT JOIN clients c ON c.id=p.client_id
       ORDER BY p.created_at DESC`);
    res.json(rows);
  } catch (e) {
    console.error("DB GET /api/projects:", e);
    res.json([]);
  }
});

r.post("/projects", async (req, res) => {
  try {
    const { name, client_id = null, status = "active", budget = null, due_date = null } = req.body ?? {};
    if (!name) return res.status(400).json({ message: "name required" });
    const out = await run("INSERT INTO projects (name, client_id, status, budget, due_date) VALUES (?,?,?,?,?)",
      [name, client_id, status, budget, due_date]);
    const row = await all(`
      SELECT p.id, p.name, p.status, p.budget, p.due_date, p.created_at,
             c.id AS client_id, c.name AS client_name
        FROM projects p LEFT JOIN clients c ON c.id=p.client_id
       WHERE p.id=?`, [out.lastID]);
    res.status(201).json(row[0]);
  } catch (e) {
    console.error("DB POST /api/projects:", e);
    res.status(400).json({ message: "Could not create project" });
  }
});

// Clients: list/add/edit/delete
r.get("/clients", async (req, res) => {
  try {
    const rows = await all(`SELECT id, name, email, phone, status, created_at FROM clients ORDER BY created_at DESC`);
    res.json(rows);
  } catch (e) {
    console.error("DB GET /api/clients:", e);
    res.json([]);
  }
});

r.post("/clients", async (req, res) => {
  try {
    const { name, email = null, phone = null } = req.body ?? {};
    if (!name) return res.status(400).json({ message: "name required" });
    const out = await run("INSERT INTO clients (name, email, phone) VALUES (?,?,?)", [name, email, phone]);
    const row = await all("SELECT id, name, email, phone, status, created_at FROM clients WHERE id=?", [out.lastID]);
    res.status(201).json(row[0]);
  } catch (e) {
    console.error("DB POST /api/clients:", e);
    res.status(400).json({ message: "Could not create client" });
  }
});

r.put("/clients/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, phone, status } = req.body ?? {};
    await run(`
      UPDATE clients SET
        name=COALESCE(?,name), email=COALESCE(?,email), phone=COALESCE(?,phone), status=COALESCE(?,status)
      WHERE id=?`, [name ?? null, email ?? null, phone ?? null, status ?? null, id]);
    const row = await all("SELECT id, name, email, phone, status, created_at FROM clients WHERE id=?", [id]);
    res.json(row[0] ?? null);
  } catch (e) {
    console.error("DB PUT /api/clients/:id:", e);
    res.status(400).json({ message: "Could not update client" });
  }
});

r.delete("/clients/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await run("DELETE FROM clients WHERE id=?", [id]);
    res.status(204).end();
  } catch (e) {
    console.error("DB DELETE /api/clients/:id:", e);
    res.status(400).json({ message: "Could not delete client" });
  }
});

export default r;
