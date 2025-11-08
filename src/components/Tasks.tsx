import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

// --- Type Definitions ---
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

// --- Constants ---
const TASK_PRIORITIES = ["low", "normal", "high"] as const;

// --- Helper Functions ---
function formatToDateInput(isoString: string | null | undefined): string {
    if (!isoString) return '';
    try {
        // Takes YYYY-MM-DDTHH:MM:SS.sssZ and returns YYYY-MM-DD
        return isoString.substring(0, 10);
    } catch {
        return '';
    }
}

// --- Main Component ---
export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // States for CREATE form
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>("none"); // Sentinel for no project

  // States for EDIT functionality
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editProjectId, setEditProjectId] = useState<string>("none");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState<Task['priority']>("normal");

  const load = async () => {
    try {
      const [t, p] = await Promise.all([
        apiGet<Task[]>("/tasks"),
        apiGet<Project[]>("/projects"),
      ]);
      
      const projectList = Array.isArray(p) ? p : [];
      const projectsMap = new Map(projectList.map(project => [project.id, project.name]));
      
      // Manually enhance tasks with project_name for display
      const enhancedTasks = (Array.isArray(t) ? t : []).map(task => ({
          ...task,
          project_name: task.project_id ? projectsMap.get(task.project_id) : null,
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
  
  // --- Edit Handlers ---

  const onEditStart = (task: Task) => {
      setEditingId(task.id);
      setEditTitle(task.title);
      // Convert project_id to string for the Select component ('none' or 'ID')
      setEditProjectId(String(task.project_id ?? 'none'));
      // Format ISO date string to YYYY-MM-DD for the date input
      setEditDueDate(formatToDateInput(task.due_date));
      setEditPriority(task.priority ?? "normal");
  };

  const onEditSubmit = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    
    const originalTask = tasks.find(t => t.id === id);
    if (!originalTask) return;

    // Prepare updates object
    const updates: Partial<Task> = {};
    if (editTitle.trim() !== originalTask.title) updates.title = editTitle.trim();
    
    // 1. Project ID Fix: Normalize to API types (number or null) for robust comparison
    const newProjectApiValue = editProjectId === 'none' ? null : Number(editProjectId);
    const originalProjectApiValue = originalTask.project_id ?? null; // Ensure undefined/null are both treated as null

    if (newProjectApiValue !== originalProjectApiValue) {
        // If the two final API values are strictly different, include the update.
        updates.project_id = newProjectApiValue;
    }
    
    // YYYY-MM-DD format from input, set to null if empty
    const newDueDate = editDueDate || null; 
    const originalDueDateFormatted = originalTask.due_date ? formatToDateInput(originalTask.due_date) : null;
    if (newDueDate !== originalDueDateFormatted) updates.due_date = newDueDate;

    const newPriority = editPriority === "normal" ? null : editPriority; 
    if (newPriority !== originalTask.priority) updates.priority = newPriority as Task['priority'] | null;


    if (Object.keys(updates).length === 0) {
        setEditingId(null);
        return;
    }

    try {
        // Determine the project_id value for the optimistic update
        const finalProjectApiValue = updates.project_id !== undefined 
            ? updates.project_id 
            : originalTask.project_id ?? null;
        
        // Optimistic Update
        setTasks(prev => prev.map(t => {
            if (t.id !== id) return t;
            
            return { 
                ...t, 
                ...updates,
                title: updates.title ?? t.title,
                project_id: finalProjectApiValue,
                
                // Ensure project_name is updated correctly using the project list and the final ID
                project_name: finalProjectApiValue === null 
                    ? null 
                    : projects.find(p => p.id === finalProjectApiValue)?.name ?? null,

                due_date: updates.due_date !== undefined ? updates.due_date : t.due_date,
                priority: updates.priority !== undefined ? updates.priority : t.priority,
            }
        }));
        
        await apiPut(`/tasks/${id}`, updates);
        setEditingId(null); 

    } catch {
        alert("Failed to update task details. Refreshing list.");
        await load(); // Reload to revert optimistic change and refresh data
    }
  };

  const renderEditForm = (task: Task) => (
      <form onSubmit={(e) => onEditSubmit(e, task.id)} className="p-3 rounded border border-blue-300 bg-blue-50 space-y-2">
          
          <div className="space-y-1">
              <Label htmlFor={`edit-title-${task.id}`} className="text-xs">Title</Label>
              <Input 
                id={`edit-title-${task.id}`} 
                size="sm" 
                value={editTitle} 
                onChange={(e)=>setEditTitle(e.target.value)} 
                required 
              />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <Label htmlFor={`edit-project-${task.id}`} className="text-xs">Project</Label>
                <Select value={editProjectId} onValueChange={setEditProjectId}>
                    <SelectTrigger className="mt-1 h-8 text-sm">
                        <SelectValue placeholder="No project" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {projects.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor={`edit-priority-${task.id}`} className="text-xs">Priority</Label>
                <Select value={editPriority} onValueChange={(v: Task['priority']) => setEditPriority(v)}>
                    <SelectTrigger className="mt-1 h-8 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {TASK_PRIORITIES.map(p => (
                            // Display the priority with a capitalized first letter
                            <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="space-y-1">
              <Label htmlFor={`edit-due-date-${task.id}`} className="text-xs">Due Date</Label>
              <Input 
                id={`edit-due-date-${task.id}`} 
                type="date" 
                size="sm" 
                className="mt-1 h-8"
                value={editDueDate} 
                onChange={(e)=>setEditDueDate(e.target.value)} 
              />
          </div>

          <div className="flex gap-2 pt-2 border-t">
              <Button type="submit" size="sm" className="flex-1">Save Changes</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)} className="flex-1">Cancel</Button>
          </div>
      </form>
  );

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
                  t.id === editingId ? (
                    <div key={t.id}>{renderEditForm(t)}</div>
                  ) : (
                    <div key={t.id} className="flex items-center justify-between rounded border p-2">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.project_name ?? "No project"}
                          {t.due_date && ` · Due ${formatToDateInput(t.due_date)}`}
                          {t.priority && t.priority !== "normal" && ` · ${t.priority.toUpperCase()}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEditStart(t)}>
                            Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onToggle(t)}>
                          {t.status === "done" ? "Reset" : "Advance"}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(t.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  )
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}