// server/src/routes.files.js
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { all, run, get } from "./db.js";

// Store uploads under server/uploads (for demo; you can tweak)
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({
  dest: UPLOAD_DIR,
});

/**
 * FILES API
 * - GET    /api/files?project_id=ID   -> list files (optionally filtered by project)
 * - POST   /api/files                 -> upload + create metadata row
 * - DELETE /api/files/:id             -> delete metadata row (and physical file if we know it)
 *
 * DB schema assumed (matches our seeding + FileManagement wiring):
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   project_id INTEGER,
 *   original_name TEXT NOT NULL,
 *   file_type TEXT,
 *   file_size INTEGER,
 *   notes TEXT,
 *   upload_date TEXT,
 *   version INTEGER DEFAULT 1,
 *   status TEXT
 */
export function filesRoutes(app) {
  // GET /api/files?project_id=...
  app.get("/api/files", async (req, res, next) => {
    try {
      const { project_id } = req.query;

      let rows;
      if (project_id) {
        rows = await all(
          `
          SELECT
            id,
            project_id,
            original_name,
            file_type,
            file_size,
            notes,
            upload_date,
            version,
            status
          FROM files
          WHERE project_id = ?
          ORDER BY upload_date DESC, id DESC
          `,
          [project_id]
        );
      } else {
        rows = await all(
          `
          SELECT
            id,
            project_id,
            original_name,
            file_type,
            file_size,
            notes,
            upload_date,
            version,
            status
          FROM files
          ORDER BY upload_date DESC, id DESC
          `
        );
      }

      // Shape data to match FileManagement.tsx `FileItem`
      const files = rows.map((r) => ({
        id: r.id,
        filename: r.original_name,          // used as display name
        original_name: r.original_name,
        mime_type: r.file_type || undefined,
        size: r.file_size ?? undefined,
        project_id: r.project_id ?? undefined,
        version: r.version ?? undefined,
        created_at: r.upload_date ?? undefined,
        notes: r.notes ?? undefined,
      }));

      res.json(files);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/files  (multipart form-data)
  app.post(
    "/api/files",
    upload.single("file"),
    async (req, res, next) => {
      try {
        const file = req.file;
        const { project_id, notes } = req.body || {};

        if (!file) {
          return res.status(400).json({ error: "file is required" });
        }
        if (!project_id) {
          return res.status(400).json({ error: "project_id is required" });
        }

        const nowIso = new Date().toISOString();

        const result = await run(
          `
          INSERT INTO files
            (project_id, original_name, file_type, file_size, notes, upload_date, version, status)
          VALUES (?,?,?,?,?,?,?,?)
          `,
          [
            Number(project_id),
            file.originalname,
            file.mimetype,
            file.size,
            notes || null,
            nowIso,
            1,
            "Latest",
          ]
        );

        const row = await get(
          `
          SELECT
            id,
            project_id,
            original_name,
            file_type,
            file_size,
            notes,
            upload_date,
            version,
            status
          FROM files
          WHERE id = ?
          `,
          [result.lastID]
        );

        const created = {
          id: row.id,
          filename: row.original_name,
          original_name: row.original_name,
          mime_type: row.file_type || undefined,
          size: row.file_size ?? undefined,
          project_id: row.project_id ?? undefined,
          version: row.version ?? undefined,
          created_at: row.upload_date ?? undefined,
          notes: row.notes ?? undefined,
        };

        res.status(201).json(created);
      } catch (err) {
        next(err);
      }
    }
  );

  // DELETE /api/files/:id
  app.delete("/api/files/:id", async (req, res, next) => {
    try {
      const { id } = req.params;

      // We only delete DB row; file deletion would require us to also store filepath.
      // If you later store the path, you can look it up here and fs.unlinkSync it.
      await run("DELETE FROM files WHERE id = ?", [id]);

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });
}
