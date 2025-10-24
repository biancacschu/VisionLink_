# Writes updated VisionLink components in src/components
param(
  [string]$Root = "."
)

$outDir = Join-Path $Root "src/components"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$content_StaffManager_tsx = @'
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type Staff = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: "designer" | "draughtsman" | "project_manager" | "admin";
  status: "active" | "archived";
};

export default function StaffManager() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // IMPORTANT: use a non-empty sentinel for Select
  const [role, setRole] = useState<string>("designer");

  const load = async () => {
    try {
      const out = await apiGet<Staff[]>("/staff");
      setStaff(Array.isArray(out) ? out : []);
      setErr(null);
    } catch {
      setErr("Could not load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    try {
      const payload = { name, email, phone: phone || null, role, status: "active" as const };
      await apiPost("/staff", payload);
      setName(""); setEmail(""); setPhone(""); setRole("designer");
      await load();
    } catch {
      alert("Failed to add staff member");
    }
  };

  const onToggleArchive = async (row: Staff) => {
    try {
      const next = row.status === "archived" ? "active" : "archived";
      await apiPut(`/staff/${row.id}`, { status: next });
      setStaff(prev => prev.map(s => s.id === row.id ? { ...s, status: next } : s));
    } catch {
      alert("Failed to update staff status");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this staff member?")) return;
    try {
      await apiDelete(`/staff/${id}`);
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch {
      alert("Failed to delete staff member");
    }
  };

  const grouped = useMemo(() => ({
    active: staff.filter(s => s.status === "active"),
    archived: staff.filter(s => s.status === "archived"),
  }), [staff]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Staff</h1>

      <Card>
        <CardHeader><CardTitle>Add Staff Member</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sname">Name</Label>
              <Input id="sname" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semail">Email</Label>
              <Input id="semail" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="name@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sphone">Phone</Label>
              <Input id="sphone" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+27 ..." />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="draughtsman">Draughtsman</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4 flex items-end">
              <Button type="submit" className="w-full md:w-auto">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {!loading && err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="grid md:grid-cols-2 gap-4">
          {(["active","archived"] as const).map(section => (
            <Card key={section}>
              <CardHeader>
                <CardTitle className="capitalize">{section} ({grouped[section].length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[section].length === 0 && <div className="text-sm text-muted-foreground">No staff</div>}
                {grouped[section].map(s => (
                  <div key={s.id} className="flex items-center justify-between rounded border p-2">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.email} · {s.role.replace("_"," ")}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={()=>onToggleArchive(s)}>
                        {s.status === "archived" ? "Restore" : "Archive"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={()=>onDelete(s.id)}>Delete</Button>
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
'@
Set-Content -Path $outDir/'StaffManager.tsx' -Value $content_StaffManager_tsx -Encoding UTF8

$content_SearchInterface_tsx = @'
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type SearchType = "all" | "projects" | "tasks" | "files" | "messages" | "clients";

type Result = {
  id: number | string;
  type: SearchType;
  title: string;
  description?: string | null;
  project_name?: string | null;
  created_at?: string | null;
};

export default function SearchInterface() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<SearchType>("all");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const out = await apiGet<Result[]>(`/search?q=${encodeURIComponent(q)}&type=${type}`);
      setResults(Array.isArray(out) ? out : []);
      setErr(null);
    } catch {
      setErr("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    const by: Record<SearchType, Result[]> = { all: [], projects: [], tasks: [], files: [], messages: [], clients: [] };
    for (const r of results) (by[r.type] ?? by.all).push(r);
    return by;
  }, [results]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Search</h1>

      <Card>
        <CardHeader><CardTitle>Find anything</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="q">Keywords</Label>
              <Input id="q" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="e.g. kitchen island, client name…" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v)=>setType(v as SearchType)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="tasks">Tasks</SelectItem>
                  <SelectItem value="files">Files</SelectItem>
                  <SelectItem value="messages">Messages</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 flex items-end">
              <Button type="submit" className="w-full md:w-auto">Search</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && <div className="text-sm text-muted-foreground">Searching…</div>}
      {!loading && err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && results.length > 0 && (
        <div className="grid gap-4">
          {(type === "all" ? (["projects","tasks","files","messages","clients"] as const) : [type]).map(section => (
            <Card key={section}>
              <CardHeader><CardTitle className="capitalize">{section} ({(type==="all"?grouped[section]:results).length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(type==="all"?grouped[section]:results).filter(r => type==="all" ? true : r.type===type).map(r => (
                  <div key={`${r.type}-${r.id}`} className="rounded border p-2">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.project_name ?? r.type} {r.created_at ? `· ${new Date(r.created_at).toLocaleString()}` : ""}
                    </div>
                    {r.description && <div className="text-sm mt-1">{r.description}</div>}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !err && results.length === 0 && (
        <div className="text-sm text-muted-foreground">No results yet. Try a search.</div>
      )}
    </div>
  );
}
'@
Set-Content -Path $outDir/'SearchInterface.tsx' -Value $content_SearchInterface_tsx -Encoding UTF8

$content_Reports_tsx = @'
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Summary = {
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  tasks_done: number;
  tasks_overdue: number;
};

type Row = { name: string; value: number };

export default function Reports() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [topProjects, setTopProjects] = useState<Row[]>([]);
  const [topUsers, setTopUsers] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, p, u] = await Promise.all([
          apiGet<Summary>("/reports/summary"),
          apiGet<Row[]>("/reports/top-projects"),
          apiGet<Row[]>("/reports/top-users"),
        ]);
        setSummary(s ?? null);
        setTopProjects(Array.isArray(p) ? p : []);
        setTopUsers(Array.isArray(u) ? u : []);
        setErr(null);
      } catch {
        setErr("Could not load reports");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {!loading && err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && summary && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Total Projects", value: summary.total_projects },
            { label: "Active Projects", value: summary.active_projects },
            { label: "Total Tasks", value: summary.total_tasks },
            { label: "Done Tasks", value: summary.tasks_done },
            { label: "Overdue Tasks", value: summary.tasks_overdue },
          ].map((m, i) => (
            <Card key={i}><CardHeader><CardTitle>{m.label}</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{m.value ?? 0}</CardContent></Card>
          ))}
        </div>
      )}

      {!loading && !err && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Top Projects by Completed Tasks</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {topProjects.length === 0 && <div className="text-sm text-muted-foreground">No data.</div>}
              {topProjects.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded border p-2">
                  <div>{r.name}</div><div className="text-sm text-muted-foreground">{r.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top Contributors</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {topUsers.length === 0 && <div className="text-sm text-muted-foreground">No data.</div>}
              {topUsers.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded border p-2">
                  <div>{r.name}</div><div className="text-sm text-muted-foreground">{r.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
'@
Set-Content -Path $outDir/'Reports.tsx' -Value $content_Reports_tsx -Encoding UTF8

$content_Profile_tsx = @'
import { useEffect, useState } from "react";
import { apiGet, apiPut } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Me = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
};

export default function Profile() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // editable copies
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const load = async () => {
    try {
      const out = await apiGet<Me>("/me");
      setMe(out ?? null);
      if (out) {
        setFirst(out.first_name || ""); setLast(out.last_name || "");
        setEmail(out.email || ""); setPhone(out.phone || "");
      }
      setErr(null);
    } catch {
      setErr("Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPut("/me", { first_name: first, last_name: last, email, phone: phone || null });
      await load();
      alert("Profile saved");
    } catch {
      alert("Failed to save profile");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Profile</h1>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {!loading && err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && me && (
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first">First name</Label>
                <Input id="first" value={first} onChange={(e)=>setFirst(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last">Last name</Label>
                <Input id="last" value={last} onChange={(e)=>setLast(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+27 ..." />
              </div>
              <div className="md:col-span-2 flex items-end">
                <Button type="submit" className="w-full md:w-auto">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
'@
Set-Content -Path $outDir/'Profile.tsx' -Value $content_Profile_tsx -Encoding UTF8

$content_Messages_tsx = @'
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Conversation = { id: number; name: string; project_id?: number | null };
type Message = { id: number; conversation_id: number; body: string; author_name?: string; created_at?: string };

export default function Messages() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const out = await apiGet<Conversation[]>("/messages/conversations");
      const list = Array.isArray(out) ? out : [];
      setConvos(list);
      setSelected(list[0]?.id ?? null);
      setErr(null);
    } catch {
      setErr("Could not load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    (async () => {
      if (!selected) return;
      try {
        const msgs = await apiGet<Message[]>(`/messages?conversation_id=${selected}`);
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch {
        // keep quiet
      }
    })();
  }, [selected]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !body.trim()) return;
    try {
      await apiPost("/messages", { conversation_id: selected, body });
      setBody("");
      const msgs = await apiGet<Message[]>(`/messages?conversation_id=${selected}`);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch {
      alert("Failed to send");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Messages</h1>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {!loading && err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardHeader><CardTitle>Conversations</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {convos.length === 0 && <div className="text-sm text-muted-foreground">No conversations.</div>}
              {convos.map(c => (
                <button key={c.id} onClick={()=>setSelected(c.id)} className={`w-full text-left rounded border p-2 ${selected===c.id ? "bg-muted" : ""}`}>
                  <div className="font-medium">{c.name}</div>
                  {c.project_id && <div className="text-xs text-muted-foreground">Project #{c.project_id}</div>}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Thread</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 max-h-[50vh] overflow-auto pr-2">
                {messages.length === 0 && <div className="text-sm text-muted-foreground">No messages yet.</div>}
                {messages.map(m => (
                  <div key={m.id} className="rounded border p-2">
                    <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {m.author_name ?? "Unknown"}{m.created_at ? ` · ${new Date(m.created_at).toLocaleString()}` : ""}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={onSend} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-3">
                  <Label htmlFor="body" className="sr-only">Message</Label>
                  <Input id="body" value={body} onChange={(e)=>setBody(e.target.value)} placeholder="Type a message…" />
                </div>
                <div>
                  <Button type="submit" className="w-full">Send</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
'@
Set-Content -Path $outDir/'Messages.tsx' -Value $content_Messages_tsx -Encoding UTF8

$content_FileManagement_tsx = @'
import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type FileRow = {
  id: number;
  name: string;
  size?: number | null;
  version?: number | null;
  project_id?: number | null;
  uploaded_at?: string | null;
  url?: string | null;
};

export default function FileManagement() {
  const [rows, setRows] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    try {
      const out = await apiGet<FileRow[]>("/files");
      setRows(Array.isArray(out) ? out : []);
      setErr(null);
    } catch {
      setErr("Could not load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      // NOTE: using fetch directly to allow multipart form upload
      const res = await fetch("/files", { method: "POST", body: fd });
      if (!res.ok) throw new Error("upload failed");
      setFile(null);
      await load();
    } catch {
      alert("Failed to upload file");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete file?")) return;
    try {
      await apiDelete(`/files/${id}`);
      setRows(prev => prev.filter(r => r.id !== id));
    } catch {
      alert("Failed to delete file");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Files</h1>

      <Card>
        <CardHeader><CardTitle>Upload</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onUpload} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="f">Choose file</Label>
              <Input id="f" type="file" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" type="submit" disabled={!file}>Upload</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {!loading && err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && (
        <Card>
          <CardHeader><CardTitle>All Files</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {rows.length === 0 && <div className="text-sm text-muted-foreground">No files uploaded.</div>}
            {rows.map(r => (
              <div key={r.id} className="flex items-center justify-between rounded border p-2">
                <div>
                  <div className="font-medium">{r.name}{r.version ? ` · v${r.version}` : ""}</div>
                  <div className="text-xs text-muted-foreground">
                    {(r.size ? `${Math.round(r.size/1024)} KB` : "")}{r.uploaded_at ? ` · ${new Date(r.uploaded_at).toLocaleString()}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  {r.url && <a className="underline text-sm" href={r.url} target="_blank" rel="noreferrer">Open</a>}
                  <Button variant="destructive" size="sm" onClick={()=>onDelete(r.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
'@
Set-Content -Path $outDir/'FileManagement.tsx' -Value $content_FileManagement_tsx -Encoding UTF8

$content_CalendarView_tsx = @'
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type EventRow = {
  id: number;
  title: string;
  date: string; // ISO yyyy-mm-dd
  project_id?: number | null;
};

export default function CalendarView() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const load = async () => {
    try {
      const out = await apiGet<EventRow[]>("/events");
      setEvents(Array.isArray(out) ? out : []);
      setErr(null);
    } catch {
      setErr("Could not load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    try {
      await apiPost("/events", { title, date });
      setTitle(""); setDate("");
      await load();
    } catch {
      alert("Failed to add event");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete event?")) return;
    try {
      await apiDelete(`/events/${id}`);
      setEvents(prev => prev.filter(ev => ev.id !== id));
    } catch {
      alert("Failed to delete event");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Calendar</h1>

      <Card>
        <CardHeader><CardTitle>Add Event</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="etitle">Title</Label>
              <Input id="etitle" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Meeting…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edate">Date</Label>
              <Input id="edate" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
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
        <Card>
          <CardHeader><CardTitle>Upcoming</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {events.length === 0 && <div className="text-sm text-muted-foreground">No events.</div>}
            {events.map(ev => (
              <div key={ev.id} className="flex items-center justify-between rounded border p-2">
                <div>
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(ev.date).toLocaleDateString()}</div>
                </div>
                <Button variant="destructive" size="sm" onClick={()=>onDelete(ev.id)}>Delete</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
'@
Set-Content -Path $outDir/'CalendarView.tsx' -Value $content_CalendarView_tsx -Encoding UTF8

$content_AppSidebar_tsx = @'
import { ReactNode } from "react";
import { Button } from "./ui/button";

type Item = { href: string; label: string };

const items: Item[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/calendar", label: "Calendar" },
  { href: "/files", label: "Files" },
  { href: "/messages", label: "Messages" },
  { href: "/clients", label: "Clients" },
  { href: "/staff", label: "Staff" },
  { href: "/reports", label: "Reports" },
  { href: "/search", label: "Search" },
];

export default function AppSidebar() {
  return (
    <aside className="w-full md:w-64 p-3 border-r">
      <div className="grid gap-2">
        {items.map(it => (
          <a key={it.href} href={it.href}>
            <Button variant="ghost" className="w-full justify-start">{it.label}</Button>
          </a>
        ))}
      </div>
    </aside>
  );
}
'@
Set-Content -Path $outDir/'AppSidebar.tsx' -Value $content_AppSidebar_tsx -Encoding UTF8

$content_AddProjectForm_tsx = @'
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type Client = { id: number; name: string };

export default function AddProjectForm({ onCreated }: { onCreated?: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState<string>("none");

  useEffect(() => {
    (async () => {
      try {
        const out = await apiGet<Client[]>("/clients");
        setClients(Array.isArray(out) ? out : []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const client_id = clientId === "none" ? null : Number(clientId);
      await apiPost("/projects", { name, client_id });
      setName(""); setClientId("none");
      onCreated?.();
    } catch {
      alert("Failed to create project");
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="space-y-2">
        <Label htmlFor="pname">Project name</Label>
        <Input id="pname" value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Restaurant fit-out" />
      </div>
      <div className="space-y-2">
        <Label>Client</Label>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger><SelectValue placeholder="No client" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No client</SelectItem>
            {clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full">Create</Button>
      </div>
    </form>
  );
}
'@
Set-Content -Path $outDir/'AddProjectForm.tsx' -Value $content_AddProjectForm_tsx -Encoding UTF8

Write-Host '✅ Components updated in' $outDir
