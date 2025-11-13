// server/src/routes.dashboard.js
import { all } from "./db.js";

/**
 * Minimal dashboard API.
 * This won't break anything even if your frontend still calls /updates,
 * but it gives you a working /api/dashboard endpoint for later.
 */
export function dashboardRoutes(app) {
  app.get("/api/dashboard", async (_req, res, next) => {
    try {
      // Simple aggregated stats from existing tables
      const [projectsCountRow] = await all(
        "SELECT COUNT(*) AS c FROM projects"
      );
      const [tasksCountRow] = await all(
        "SELECT COUNT(*) AS c FROM tasks"
      );
      const [staffCountRow] = await all(
        "SELECT COUNT(*) AS c FROM staff"
      );

      res.json({
        stats: {
          totalProjects: projectsCountRow?.c ?? 0,
          totalTasks: tasksCountRow?.c ?? 0,
          totalStaff: staffCountRow?.c ?? 0,
        },
      });
    } catch (err) {
      next(err);
    }
  });
}
