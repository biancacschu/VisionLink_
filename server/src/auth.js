// server/src/auth.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "./db.js"; // if your db.js is in ../db.js, change this import accordingly

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function registerRoutes(app) {
  // Optional: seed a demo user so login works immediately
  db.get(`SELECT id FROM users WHERE email = ?`, ["sarah.designer@designstudio.com"], (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync("demo123", 10);
      db.run(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES (?,?,?,?,?)`,
        ["sarah.designer@designstudio.com", hash, "Sarah", "Designer", "User"]
      );
      console.log("Seeded demo user: sarah.designer@designstudio.com / demo123");
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, first_name, last_name, role } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const hash = bcrypt.hashSync(password, 10);
    db.run(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?,?,?,?,?)`,
      [email, hash, first_name || "", last_name || "", role || "User"],
      function (err2) {
        if (err2) return res.status(400).json({ error: "Email already exists" });
        return res.json({ id: this.lastID, email, first_name, last_name, role: role || "User" });
      }
    );
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
      if (err || !row) return res.status(401).json({ error: "Invalid credentials" });
      const ok = bcrypt.compareSync(password, row.password_hash);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });
      const token = jwt.sign({ id: row.id, email: row.email, role: row.role }, JWT_SECRET, { expiresIn: "8h" });
      res.json({
        token,
        user: { id: row.id, email: row.email, first_name: row.first_name, last_name: row.last_name, role: row.role },
      });
    });
  });

  app.get("/api/profile/me", requireAuth, (req, res) => {
    db.get(
      `SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?`,
      [req.user.id],
      (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Not found" });
        res.json(row);
      }
    );
  });
}
