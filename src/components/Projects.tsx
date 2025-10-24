import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type Client = { id: number; name: string };
type Project = {
  id: number; name: string; status: string; budget?: number | null; due_date?: string | null;
  client_id?: number | null; client_name?: string | null;
};

export default function Projects() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  // IMPORTANT: use a non-empty sentinel instead of ""
  const [clientId, setClientId] = useState<string>("none");

  const load = async () => {
    try {
      const [pjs, cls] = await Promise.all([
        apiGet<Project[]>("/projects"),
        apiGet<Client[]>("/clients"),
      ]);
      setProjects(Array.isArray(pjs) ? pjs : []);
      setClients(Array.isArray(cls) ? cls : []);
      setErr(null);
    } catch {
      setErr("Could not load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const client_id = clientId === "none" ? null : Number(clientId);
      await apiPost("/projects", { name, client_id });
      setName("");
      setClientId("none"); // reset to sentinel
      await load();
    } catch {
      alert("Failed to create project");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>

      <Card>
        <CardHeader>
          <CardTitle>New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  {/* non-empty sentinel item */}
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {!loading && err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="grid gap-3">
          {projects.length === 0 && (
            <div className="text-sm text-muted-foreground">No projects yet.</div>
          )}
          {projects.map(p => (
            <div key={p.id} className="rounded border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.client_name ?? "No client"} · {p.status}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {p.due_date ? `Due ${p.due_date}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
