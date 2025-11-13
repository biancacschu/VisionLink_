// src/components/Projects.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
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
import { Folder, X, RefreshCw } from "lucide-react";

type Client = { id: number; name: string };

type Project = {
  id: number;
  name: string;
  status: "Planning" | "Active" | "On Hold" | "Completed";
  budget?: number | null;
  due_date?: string | null;
  client_id?: number | null;
  client_name?: string | null;
  description: string;
};

const PROJECT_STATUSES: Project["status"][] = [
  "Planning",
  "Active",
  "On Hold",
  "Completed",
];

function getStatusClass(status: string) {
  switch (status) {
    case "Active":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "On Hold":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
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

export default function Projects() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // CREATE form
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState<string>("none");

  const loadProjectsAndClients = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const pjs = await apiGet<Project[]>("/projects");
      const cls = await apiGet<Client[]>("/clients");

      const projectList = Array.isArray(pjs) ? pjs : [];
      const clientList = Array.isArray(cls) ? cls : [];

      setProjects(projectList);
      setClients(clientList);

      // keep current selection updated
      setSelectedProject((prevSelected) => {
        if (prevSelected) {
          const updated = projectList.find((p) => p.id === prevSelected.id);
          return updated || null;
        }
        return null;
      });
    } catch {
      setErr("Could not load initial data (Projects or Clients).");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjectsAndClients();
  }, [loadProjectsAndClients]);

  // CREATE
  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const client_id = clientId === "none" ? null : Number(clientId);
      await apiPost("/projects", {
        name: name.trim(),
        client_id,
        status: "Planning",
        description: "New project created.",
        due_date: null,
      });
      setName("");
      setClientId("none");
      await loadProjectsAndClients();
    } catch {
      alert("Failed to create project");
    }
  };

  // UPDATE
  const handleProjectUpdate = useCallback(
    async (projectId: number, updates: Partial<Project>) => {
      const originalProject = projects.find((p) => p.id === projectId);
      // optimistic
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
      );
      setSelectedProject((prev) =>
        prev ? { ...prev, ...updates } : null
      );

      try {
        await apiPut(`/projects/${projectId}`, updates);
      } catch {
        // rollback
        if (originalProject) {
          setProjects((prev) =>
            prev.map((p) =>
              p.id === projectId ? originalProject : p
            )
          );
          setSelectedProject(originalProject);
        }
        setErr("Failed to update project attributes. Reverting changes.");
        await loadProjectsAndClients();
      }
    },
    [projects, loadProjectsAndClients]
  );

  // DELETE
  const handleDeleteProject = useCallback(
    async (projectId: number) => {
      if (
        !window.confirm(
          "Are you sure you want to permanently delete this project? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        await apiDelete(`/projects/${projectId}`);
        setSelectedProject(null);
        await loadProjectsAndClients();
      } catch {
        alert("Failed to delete project.");
        await loadProjectsAndClients();
      }
    },
    [loadProjectsAndClients]
  );

  // DETAIL PANE
  const ProjectDetail = useMemo(() => {
    if (!selectedProject) {
      return (
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-center h-full text-muted-foreground border-l">
          <p>Select a project from the left to view details.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow h-full flex flex-col overflow-hidden border-l">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">{selectedProject.name}</h2>
          <button
            onClick={() => setSelectedProject(null)}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <p className="text-sm text-muted-foreground">
            {selectedProject.description}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Client */}
            <div>
              <Label>Client</Label>
              <Select
                value={String(selectedProject.client_id ?? "none")}
                onValueChange={(newClientIdStr) =>
                  handleProjectUpdate(selectedProject.id, {
                    client_id:
                      newClientIdStr === "none"
                        ? null
                        : parseInt(newClientIdStr, 10),
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem
                      key={client.id}
                      value={String(client.id)}
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select
                value={selectedProject.status}
                onValueChange={(newStatus: Project["status"]) =>
                  handleProjectUpdate(selectedProject.id, {
                    status: newStatus,
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due date */}
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                className="mt-1"
                value={formatToDateInput(selectedProject.due_date)}
                onChange={(e) =>
                  handleProjectUpdate(selectedProject.id, {
                    due_date: e.target.value || null,
                  })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t mt-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handleDeleteProject(selectedProject.id)}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    );
  }, [selectedProject, handleProjectUpdate, clients, handleDeleteProject]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>

      <Card>
        <CardHeader>
          <CardTitle>New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onCreate}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <div className="space-y-2">
              <Label htmlFor="pname">Name</Label>
              <Input
                id="pname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
              />
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="No client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-[1fr_2fr] gap-6 min-h-[500px]">
        {/* List */}
        <div className="bg-white rounded-2xl shadow overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <h2 className="font-medium text-lg flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Project List
            </h2>
            <button
              onClick={loadProjectsAndClients}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              aria-label="Refresh projects"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">
              Loading projects...
            </p>
          ) : err ? (
            <p className="p-4 text-sm text-red-600">{err}</p>
          ) : projects.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No projects found.
            </p>
          ) : (
            <ul className="divide-y overflow-y-auto">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedProject?.id === p.id
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : ""
                  }`}
                  onClick={() => setSelectedProject(p)}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground flex justify-between items-center mt-1">
                    <span>{p.client_name ?? "No Client"}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusClass(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        {ProjectDetail}
      </div>
    </div>
  );
}
