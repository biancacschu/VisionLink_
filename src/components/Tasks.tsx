// src/components/Tasks.tsx
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "normal" | "high" | "medium";

type Task = {
  id: number;
  title: string;
  status: TaskStatus;
  project_id?: number | null;
  project_name?: string | null;
  due_date?: string | null;
  priority?: TaskPriority | null;
};

type Project = { id: number; name: string };

const TASK_PRIORITIES: TaskPriority[] = ["low", "normal", "high", "medium"];

function priorityLabel(p: TaskPriority) {
  switch (p) {
    case "low":
      return "Low";
    case "normal":
      return "Normal";
    case "medium":
      return "Medium";
    case "high":
      return "High";
  }
}

function formatToDateInput(isoString: string | null | undefined): string {
  if (!isoString) return "";
  try {
    return isoString.substring(0, 10);
  } catch {
    return "";
  }
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // CREATE form
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>("none");

  // EDIT state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editProjectId, setEditProjectId] = useState<string>("none");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState<TaskPriority>("normal");

  const load = async () => {
    try {
      setLoading(true);
      const [t, p] = await Promise.all([
        apiGet<Task[]>("/tasks"),
        apiGet<Project[]>("/projects"),
      ]);

      const projectList = Array.isArray(p) ? p : [];
      const projectsMap = new Map(
        projectList.map((project) => [project.id, project.name])
      );

      const enhancedTasks = (Array.isArray(t) ? t : []).map((task) => ({
        ...task,
        project_name: task.project_id
          ? projectsMap.get(task.project_id) ?? null
          : null,
      }));

      setTasks(enhancedTasks);
      setProjects(projectList);
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

  // CREATE
  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const project_id = projectId === "none" ? null : Number(projectId);
      await apiPost("/tasks", { title: title.trim(), project_id });
      setTitle("");
      setProjectId("none");
      await load();
    } catch {
      alert("Failed to create task");
    }
  };

  // STATUS TOGGLE
  const onToggle = async (task: Task) => {
    const next: TaskStatus =
      task.status === "todo"
        ? "in_progress"
        : task.status === "in_progress"
        ? "done"
        : "todo";
    try {
      await apiPut(`/tasks/${task.id}`, { status: next });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: next } : t
        )
      );
    } catch {
      alert("Failed to update task");
    }
  };

  // DELETE
  const onDelete = async (id: number) => {
    if (!confirm("Delete task?")) return;
    try {
      await apiDelete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete task");
    }
  };

  // START EDIT
  const onEditStart = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditProjectId(String(task.project_id ?? "none"));
    setEditDueDate(formatToDateInput(task.due_date));
    setEditPriority(task.priority ?? "normal");
  };

  // SUBMIT EDIT
  const onEditSubmit = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const originalTask = tasks.find((t) => t.id === id);
    if (!originalTask) return;

    const updates: Partial<Task> = {};

    if (editTitle.trim() !== originalTask.title) {
      updates.title = editTitle.trim();
    }

    const newProjectApiValue =
      editProjectId === "none" ? null : Number(editProjectId);
    const originalProjectApiValue = originalTask.project_id ?? null;

    if (newProjectApiValue !== originalProjectApiValue) {
      updates.project_id = newProjectApiValue;
    }

    const newDueDate = editDueDate || null;
    const originalDueDateFormatted = originalTask.due_date
      ? formatToDateInput(originalTask.due_date)
      : null;
    if (newDueDate !== originalDueDateFormatted) {
      updates.due_date = newDueDate;
    }

    const normalizedPriority: TaskPriority | null =
      editPriority === "normal" ? null : editPriority;
    if (normalizedPriority !== (originalTask.priority ?? null)) {
      updates.priority = normalizedPriority as TaskPriority | null;
    }

    if (Object.keys(updates).length === 0) {
      setEditingId(null);
      return;
    }

    try {
      const finalProjectApiValue =
        updates.project_id !== undefined
          ? updates.project_id
          : originalTask.project_id ?? null;

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            ...updates,
            title: updates.title ?? t.title,
            project_id: finalProjectApiValue,
            project_name:
              finalProjectApiValue === null
                ? null
                : projects.find((p) => p.id === finalProjectApiValue)
                    ?.name ?? null,
            due_date:
              updates.due_date !== undefined
                ? updates.due_date
                : t.due_date,
            priority:
              updates.priority !== undefined
                ? updates.priority
                : t.priority,
          };
        })
      );

      await apiPut(`/tasks/${id}`, updates);
      setEditingId(null);
    } catch {
      alert("Failed to update task details. Refreshing list.");
      await load();
    }
  };

  const renderEditForm = (task: Task) => (
    <form
      onSubmit={(e) => onEditSubmit(e, task.id)}
      className="p-3 rounded border border-blue-300 bg-blue-50 space-y-2"
    >
      <div className="space-y-1">
        <Label htmlFor={`edit-title-${task.id}`} className="text-xs">
          Title
        </Label>
        <Input
          id={`edit-title-${task.id}`}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor={`edit-project-${task.id}`} className="text-xs">
            Project
          </Label>
          <Select
            value={editProjectId}
            onValueChange={(v: string) => setEditProjectId(v)}
          >
            <SelectTrigger className="mt-1 h-8 text-sm">
              <SelectValue placeholder="No project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No project</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edit-priority-${task.id}`} className="text-xs">
            Priority
          </Label>
          <Select
            value={editPriority ?? "normal"}
            onValueChange={(value: string) =>
              setEditPriority(value as TaskPriority)
            }
          >
            <SelectTrigger className="mt-1 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {priorityLabel(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`edit-due-date-${task.id}`} className="text-xs">
          Due Date
        </Label>
        <Input
          id={`edit-due-date-${task.id}`}
          type="date"
          className="mt-1 h-8"
          value={editDueDate}
          onChange={(e) => setEditDueDate(e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button type="submit" size="sm" className="flex-1">
          Save Changes
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditingId(null)}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  const grouped = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      done: tasks.filter((t) => t.status === "done"),
    }),
    [tasks]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onCreate}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
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
              <Select
                value={projectId}
                onValueChange={(v: string) => setProjectId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-sm text-muted-foreground">Loading…</div>
      )}
      {!loading && err && (
        <div className="text-sm text-red-600">{err}</div>
      )}

      {!loading && !err && (
        <div className="grid md:grid-cols-3 gap-4">
          {(["todo", "in_progress", "done"] as const).map((col) => (
            <Card key={col}>
              <CardHeader>
                <CardTitle className="capitalize">
                  {col.replace("_", " ")} ({grouped[col].length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[col].length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No tasks
                  </div>
                )}
                {grouped[col].map((t) =>
                  t.id === editingId ? (
                    <div key={t.id}>{renderEditForm(t)}</div>
                  ) : (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded border p-2"
                    >
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.project_name ?? "No project"}
                          {t.due_date &&
                            ` · Due ${formatToDateInput(t.due_date)}`}
                          {t.priority &&
                            t.priority !== "normal" &&
                            ` · ${t.priority.toUpperCase()}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditStart(t)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggle(t)}
                        >
                          {t.status === "done" ? "Reset" : "Advance"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(t.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
