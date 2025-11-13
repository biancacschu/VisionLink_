// src/components/ClientManagement.tsx
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

type Client = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  created_at?: string | null;
};

type Project = {
  id: number;
  name: string;
  client_id?: number | null;
  status?: string | null;
  due_date?: string | null;
};

type Task = {
  id: number;
  title: string;
  status: string;
  project_id?: number | null;
  due_date?: string | null;
};

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // CREATE form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // EDIT state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // DETAIL state
  const [selectedClientId, setSelectedClientId] = useState<
    number | null
  >(null);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) ?? null,
    [clients, selectedClientId]
  );

  const loadAll = async () => {
    try {
      setLoading(true);
      setErr(null);

      const [cs, ps, ts] = await Promise.all([
        apiGet<Client[]>("/clients"),
        apiGet<Project[]>("/projects"),
        apiGet<Task[]>("/tasks"),
      ]);

      setClients(Array.isArray(cs) ? cs : []);
      setProjects(Array.isArray(ps) ? ps : []);
      setTasks(Array.isArray(ts) ? ts : []);
    } catch {
      setErr("Could not load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // CREATE
  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await apiPost("/clients", {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      });
      setName("");
      setEmail("");
      setPhone("");
      await loadAll();
    } catch {
      alert("Failed to add client");
    }
  };

  // ARCHIVE / UNARCHIVE
  const onArchive = async (c: Client) => {
    const nextStatus = c.status === "archived" ? "active" : "archived";
    try {
      await apiPut(`/clients/${c.id}`, { status: nextStatus });
      setClients((prev) =>
        prev.map((x) =>
          x.id === c.id ? { ...x, status: nextStatus } : x
        )
      );
    } catch {
      alert("Failed to update client");
    }
  };

  // DELETE
  const onDelete = async (id: number) => {
    if (!confirm("Delete client?")) return;
    try {
      await apiDelete(`/clients/${id}`);
      setClients((prev) => prev.filter((c) => c.id !== id));
      if (selectedClientId === id) setSelectedClientId(null);
    } catch {
      alert("Failed to delete client");
    }
  };

  // START EDIT
  const onEditStart = (client: Client) => {
    setEditingId(client.id);
    setEditName(client.name);
    setEditEmail(client.email || "");
    setEditPhone(client.phone || "");
  };

  // SUBMIT EDIT
  const onEditSubmit = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const originalClient = clients.find((c) => c.id === id);
    if (!originalClient) return;

    const updates: Partial<Client> = {};

    if (editName.trim() !== originalClient.name)
      updates.name = editName.trim();

    const newEmail = editEmail.trim() || null;
    if (newEmail !== (originalClient.email ?? null)) {
      updates.email = newEmail;
    }

    const newPhone = editPhone.trim() || null;
    if (newPhone !== (originalClient.phone ?? null)) {
      updates.phone = newPhone;
    }

    if (Object.keys(updates).length === 0) {
      setEditingId(null);
      return;
    }

    try {
      // optimistic update
      setClients((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updates,
                name: editName.trim(),
                email: newEmail,
                phone: newPhone,
              }
            : c
        )
      );

      if (selectedClientId === id) {
        // keep detail view in sync
        setSelectedClientId(id);
      }

      await apiPut(`/clients/${id}`, updates);
      setEditingId(null);
    } catch {
      alert("Failed to update client details.");
      await loadAll(); // rollback
    }
  };

  const renderEditForm = (client: Client) => (
    <form
      onSubmit={(e) => onEditSubmit(e, client.id)}
      className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 rounded border border-blue-300 bg-blue-50"
    >
      <div className="space-y-1 md:col-span-2">
        <Label
          htmlFor={`edit-name-${client.id}`}
          className="text-xs"
        >
          Name
        </Label>
        <Input
          id={`edit-name-${client.id}`}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label
          htmlFor={`edit-email-${client.id}`}
          className="text-xs"
        >
          Email
        </Label>
        <Input
          id={`edit-email-${client.id}`}
          type="email"
          value={editEmail}
          onChange={(e) => setEditEmail(e.target.value)}
          placeholder="Email"
        />
      </div>
      <div className="space-y-1">
        <Label
          htmlFor={`edit-phone-${client.id}`}
          className="text-xs"
        >
          Phone
        </Label>
        <Input
          id={`edit-phone-${client.id}`}
          value={editPhone}
          onChange={(e) => setEditPhone(e.target.value)}
          placeholder="+27 ..."
        />
      </div>
      <div className="flex flex-col gap-1 items-end justify-end">
        <Button type="submit" className="w-full">
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditingId(null)}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  // Detail data for selected client
  const clientProjects = useMemo(() => {
    if (!selectedClient) return [];
    return projects.filter(
      (p) => p.client_id === selectedClient.id
    );
  }, [selectedClient, projects]);

  const clientProjectIds = useMemo(
    () => clientProjects.map((p) => p.id),
    [clientProjects]
  );

  const clientTasks = useMemo(() => {
    if (clientProjectIds.length === 0) return [];
    return tasks.filter((t) =>
      t.project_id ? clientProjectIds.includes(t.project_id) : false
    );
  }, [tasks, clientProjectIds]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clients</h1>

      {/* Create client */}
      <Card>
        <CardHeader>
          <CardTitle>Add Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onCreate}
            className="grid grid-cols-1 md:grid-cols-4 gap-3"
          >
            <div className="space-y-2">
              <Label htmlFor="cname">Name</Label>
              <Input
                id="cname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cemail">Email</Label>
              <Input
                id="cemail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cphone">Phone</Label>
              <Input
                id="cphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+27 ..."
              />
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

      {/* List + detail layout */}
      {!loading && !err && (
        <div className="grid gap-6 md:grid-cols-[1.5fr_minmax(0,1.2fr)]">
          {/* List */}
          <div className="space-y-3">
            {clients.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No clients yet.
              </div>
            )}
            {clients.map((c) =>
              c.id === editingId ? (
                <div key={c.id}>{renderEditForm(c)}</div>
              ) : (
                <div
                  key={c.id}
                  className={`rounded border p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                    selectedClientId === c.id
                      ? "border-blue-500 bg-blue-50/40"
                      : ""
                  }`}
                  onClick={() => setSelectedClientId(c.id)}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {c.name}
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase"
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {c.email || "—"} · {c.phone || "—"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditStart(c);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchive(c);
                      }}
                    >
                      {c.status === "archived"
                        ? "Unarchive"
                        : "Archive"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Detail */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {!selectedClient ? (
                <p className="text-muted-foreground">
                  Select a client from the list to view details.
                </p>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-semibold text-base">
                        {selectedClient.name}
                      </h2>
                      <Badge variant="outline">
                        {selectedClient.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        <span className="font-medium">
                          Email:
                        </span>{" "}
                        {selectedClient.email || "—"}
                      </div>
                      <div>
                        <span className="font-medium">
                          Phone:
                        </span>{" "}
                        {selectedClient.phone || "—"}
                      </div>
                      {selectedClient.created_at && (
                        <div>
                          <span className="font-medium">
                            Added:
                          </span>{" "}
                          {new Date(
                            selectedClient.created_at
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h3 className="font-medium text-xs uppercase tracking-wide mb-2">
                      Projects ({clientProjects.length})
                    </h3>
                    {clientProjects.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No projects linked to this client yet.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {clientProjects.map((p) => (
                          <li
                            key={p.id}
                            className="flex items-center justify-between rounded border px-2 py-1"
                          >
                            <div>
                              <div className="font-medium text-xs">
                                {p.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {p.status ?? "—"}
                                {p.due_date &&
                                  ` · Due ${p.due_date.substring(
                                    0,
                                    10
                                  )}`}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <h3 className="font-medium text-xs uppercase tracking-wide mb-2">
                      Open Tasks ({clientTasks.length})
                    </h3>
                    {clientTasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No tasks for this client&apos;s projects.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {clientTasks.map((t) => {
                          const proj = clientProjects.find(
                            (p) => p.id === t.project_id
                          );
                          return (
                            <li
                              key={t.id}
                              className="rounded border px-2 py-1"
                            >
                              <div className="font-medium text-xs">
                                {t.title}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {proj?.name ?? "No project"}
                                {t.due_date &&
                                  ` · Due ${t.due_date.substring(
                                    0,
                                    10
                                  )}`}
                                {` · ${t.status}`}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
