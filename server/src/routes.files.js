// server/src/routes.files.js
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import multer from "multer";
import { all, get, run } from "./db.js";
import { requireAuth } from "./auth.js";

/**
 * Files listing + upload + delete
 * GET    /api/files
 * POST   /api/files (multipart/form-data; field "file")
 * GET    /api/files/:id/download   (streams the file)
 * DELETE /api/files/:id
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "uploads");
await fs.mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
    cb(null, `${ts}__${safe}`);
  },
});
const upload = multer({ storage });

export function filesRoutes(app) {
  // Serve downloads through an auth-protected endpoint (works via Vite proxy)
  app.get("/api/files/:id/download", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const row = await get(`SELECT * FROM files WHERE id = ?`, [id]);
      if (!row) return res.status(404).json({ error: "Not found" });
      const abs = path.join(uploadDir, row.stored_name);
      return res.sendFile(abs);
    } catch (e) {
      console.error("GET /api/files/:id/download:", e);
      res.status(500).json({ error: "Download failed" });
    }
  });

  // List files (adds a usable `url` for your frontend)
  app.get("/api/files", requireAuth, async (_req, res) => {
    try {
      const rows = await all(
        `SELECT id, name, stored_name, size, version, project_id, uploaded_at
           FROM files
          ORDER BY datetime(uploaded_at) DESC`
      );
      const mapped = rows.map((r) => ({
        id: r.id,
        name: r.name,
        size: r.size,
        version: r.version,
        project_id: r.project_id,
        uploaded_at: r.uploaded_at,
        url: `/api/files/${r.id}/download`,
      }));
      res.json(mapped);
    } catch (e) {
      console.error("GET /api/files:", e);
      res.status(500).json({ error: "DB error" });
    }
  });

  // Upload
  app.post("/api/files", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "file is required" });
      const { originalname, filename, size } = req.file;
      const { project_id = null } = req.body || {};
      const out = await run(
        `INSERT INTO files (name, stored_name, size, version, project_id)
         VALUES (?,?,?,?,?)`,
        [originalname, filename, size, 1, project_id || null]
      );
      const row = await get(
        `SELECT id, name, stored_name, size, version, project_id, uploaded_at FROM files WHERE id = ?`,
        [out.lastID]
      );
      res.status(201).json({
        id: row.id,
        name: row.name,
        size: row.size,
        version: row.version,
        project_id: row.project_id,
        uploaded_at: row.uploaded_at,
        url: `/api/files/${row.id}/download`,
      });
    } catch (e) {
      console.error("POST /api/files:", e);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Delete
  app.delete("/api/files/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const row = await get(`SELECT stored_name FROM files WHERE id = ?`, [id]);
      if (row?.stored_name) {
        const abs = path.join(uploadDir, row.stored_name);
        // best-effort unlink
        try { await fs.unlink(abs); } catch {}
      }
      await run(`DELETE FROM files WHERE id = ?`, [id]);
      res.status(204).end();
    } catch (e) {
      console.error("DELETE /api/files/:id:", e);
      res.status(500).json({ error: "Delete failed" });
    }
  });

  // (Optional) also expose static files for direct linking if you want:
  // app.use("/uploads", express.static(uploadDir));
  // Then return url as `/uploads/${stored_name}` instead. Using /api/files/:id/download is safer for auth.
}
