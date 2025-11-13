// src/components/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Update = { id: number; title: string; created_at?: string };
type Project = {
  id: number;
  name: string;
  status?: string | null;
  due_date?: string | null;
  client_name?: string | null;
};
type Task = {
  id: number;
  status: string;
  due_date?: string | null;
};
type Staff = {
  id: number;
  name: string;
  status?: string | null;
};

export function Dashboard() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const [u, p, t, s] = await Promise.all([
          apiGet<Update[]>("/updates"),
          apiGet<Project[]>("/projects"),
          apiGet<Task[]>("/tasks"),
          apiGet<Staff[]>("/staff").catch(() => [] as Staff[]),
        ]);

        setUpdates(Array.isArray(u) ? u : []);
        setProjects(Array.isArray(p) ? p : []);
        setTasks(Array.isArray(t) ? t : []);
        setStaff(Array.isArray(s) ? s : []);
      } catch {
        setErr("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const activeProjects = projects.filter(
      (p) => p.status === "Active"
    ).length;

    const reviewsDue = tasks.filter(
      (t) => t.status === "in_progress"
    ).length;

    const designTeam = staff.length;

    const totalTasks = tasks.length;

    return {
      activeProjects,
      reviewsDue,
      designTeam,
      totalTasks,
    };
  }, [projects, tasks, staff]);

  const upcomingProjects = useMemo(() => {
    return [...projects]
      .filter((p) => !!p.due_date)
      .sort((a, b) =>
        (a.due_date || "").localeCompare(b.due_date || "")
      )
      .slice(0, 5);
  }, [projects]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {loading && (
        <div className="text-sm text-muted-foreground">
          Loading…
        </div>
      )}
      {!loading && err && (
        <div className="text-sm text-red-600">{err}</div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeProjects}
            </div>
            <p className="text-xs text-muted-foreground">
              Projects currently marked as Active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Design Reviews Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.reviewsDue}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks in progress (review work)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Design Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.designTeam}
            </div>
            <p className="text-xs text-muted-foreground">
              Staff members in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              All tasks across projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Updates + Projects */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {updates.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No updates yet.
              </div>
            ) : (
              updates.map((u) => (
                <div
                  key={u.id}
                  className="rounded-md border p-3"
                >
                  <div className="font-medium">{u.title}</div>
                  {u.created_at && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(
                        u.created_at
                      ).toLocaleString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {upcomingProjects.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No projects with due dates.
              </div>
            ) : (
              upcomingProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded border px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.client_name ?? "No client"}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div>{p.status ?? "—"}</div>
                    {p.due_date && (
                      <div className="text-muted-foreground">
                        Due {p.due_date.substring(0, 10)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
