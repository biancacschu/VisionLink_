// server/index.js (ESM)
import "dotenv/config.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { registerRoutes as registerAuthRoutes } from "./auth.js";   // mounts /api/auth/*
import { tasksRoutes } from "./routes.tasks.js";                        // mounts /api/tasks* with requireAuth

const app = express();
const PORT = Number(process.env.PORT || 5000); // match vite proxy

app.use(cors({
  origin: [/^http:\/\/localhost:5173$/, /^http:\/\/localhost:5174$/],
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Auth + profile
registerAuthRoutes(app);

// Tasks, etc.
tasksRoutes(app);

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// 404 for unmatched /api
app.use("/api", (_req, res) => res.status(404).json({ error: "Not Found" }));

// Central error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
