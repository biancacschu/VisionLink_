// server/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { ready } from "./db.js";
import { registerRoutes as registerAuthRoutes } from "./auth.js";
import { tasksRoutes } from "./routes.tasks.js";
import { projectsRoutes } from "./routes.projects.js"; // ⬅️ new
import { clientsRoutes } from "./routes.clients.js";   // ⬅️ new
import { updatesRoutes } from "./routes.updates.js";
import { eventsRoutes } from "./routes.events.js";
import { filesRoutes } from "./routes.files.js";
import { notificationsRoutes } from "./routes.notifications.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors({
  origin: [/^http:\/\/localhost:5173$/, /^http:\/\/localhost:5174$/],
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

await ready;                 // ensure tables exist (users/clients/projects/tasks/etc.)
registerAuthRoutes(app);     // /api/auth/*
tasksRoutes(app);            // /api/tasks*
projectsRoutes(app);         // /api/projects*
clientsRoutes(app);          // /api/clients*
updatesRoutes(app);
eventsRoutes(app);
filesRoutes(app);
notificationsRoutes(app);

app.get("/api/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use("/api", (_req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
