import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type Task = {
  id: number;
  title: string;
  status: "todo" | "in_progress" | "done";
  project_id?: number | null;
  project_name?: string | null;
  due_date?: string | null;
  priority?: "low" | "normal" | "high";
};

type Project = { id: number; name: string };

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  // IMPORTANT: use a non-empty sentinel instead of ""
  const [projectId, setProjectId] = useState<string>("none");

  const load = async () => {
    try {
      const [t, p] = await Promise.all([
        apiGet<Task[]>("/tasks"),
        apiGet<Project[]>("/projects"),
      ]);
      setTasks(Array.isArray(t) ? t : []);
      setProjects(Array.isArray(p) ? p : []);
      setErr(null);
    } catch {
      setErr("Could not load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const project_id = projectId === "none" ? null : Number(projectId);
      await apiPost("/tasks", { title, project_id });
      setTitle("");
      setProjectId("none"); // reset to sentinel
      await load();
    } catch {
      alert("Failed to create task");
    }
  };

  const onToggle = async (task: Task) => {
    const next =
      task.status === "todo" ? "in_progress" :
      task.status === "in_progress" ? "done" : "todo";
    try {
      await apiPut(`/tasks/${task.id}`, { status: next });
      setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, status: next } : t)));
    } catch {
      alert("Failed to update task");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete task?")) return;
    try {
      await apiDelete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {
      alert("Failed to delete task");
    }
  };

  const grouped = useMemo(() => ({
    todo: tasks.filter(t => t.status === "todo"),
    in_progress: tasks.filter(t => t.status === "in_progress"),
    done: tasks.filter(t => t.status === "done"),
  }), [tasks]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New task…"
              />
            </div>

            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent>
                  {/* non-empty sentinel item */}
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {!loading && err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="grid md:grid-cols-3 gap-4">
          {(["todo","in_progress","done"] as const).map(col => (
            <Card key={col}>
              <CardHeader>
                <CardTitle className="capitalize">
                  {col.replace("_"," ")} ({grouped[col].length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[col].length === 0 && (
                  <div className="text-sm text-muted-foreground">No tasks</div>
                )}
                {grouped[col].map(t => (
                  <div key={t.id} className="flex items-center justify-between rounded border p-2">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.project_name ?? "No project"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onToggle(t)}>
                        {t.status === "done" ? "Reset" : "Advance"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(t.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
