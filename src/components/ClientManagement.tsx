import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Client = { id: number; name: string; email?: string | null; phone?: string | null; status: string };

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // States for CREATE form
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // States for EDIT functionality
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");


  const load = async () => {
    try {
      const out = await apiGet<Client[]>("/clients");
      setClients(Array.isArray(out) ? out : []);
      setErr(null);
    } catch {
      setErr("Could not load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await apiPost("/clients", { name, email: email || null, phone: phone || null });
      setName(""); setEmail(""); setPhone(""); await load();
    } catch { alert("Failed to add client"); }
  };

  const onArchive = async (c: Client) => {
    try {
      await apiPut(`/clients/${c.id}`, { status: c.status === "archived" ? "active" : "archived" });
      setClients(prev => prev.map(x => x.id === c.id ? { ...x, status: (x.status === "archived" ? "active" : "archived") } : x));
    } catch { alert("Failed to update client"); }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete client?")) return;
    try {
      await apiDelete(`/clients/${id}`);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch { alert("Failed to delete client"); }
  };
  
  const onEditStart = (client: Client) => {
      setEditingId(client.id);
      setEditName(client.name);
      setEditEmail(client.email || "");
      setEditPhone(client.phone || "");
  };
  
  const onEditSubmit = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!editName.trim()) return;
    
    const originalClient = clients.find(c => c.id === id);
    if (!originalClient) return;

    const updates: Partial<Client> = {};
    if (editName.trim() !== originalClient.name) updates.name = editName.trim();
    if ((editEmail.trim() || null) !== originalClient.email) updates.email = editEmail.trim() || null;
    if ((editPhone.trim() || null) !== originalClient.phone) updates.phone = editPhone.trim() || null;

    if (Object.keys(updates).length === 0) {
        setEditingId(null);
        return;
    }

    try {
        // Optimistic Update
        setClients(prev => prev.map(c => 
            c.id === id ? { ...c, ...updates, name: editName.trim(), email: editEmail.trim() || null, phone: editPhone.trim() || null } : c
        ));
        
        await apiPut(`/clients/${id}`, updates);
        setEditingId(null); 

    } catch {
        alert("Failed to update client details.");
        await load(); // Reload to revert optimistic change
    }
  };
  
  const renderEditForm = (client: Client) => (
      <form onSubmit={(e) => onEditSubmit(e, client.id)} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 rounded border border-blue-300 bg-blue-50">
          <div className="space-y-1 md:col-span-2">
              <Label htmlFor={`edit-name-${client.id}`} className="text-xs">Name</Label>
              <Input id={`edit-name-${client.id}`} size="sm" value={editName} onChange={(e)=>setEditName(e.target.value)} required />
          </div>
          <div className="space-y-1">
              <Label htmlFor={`edit-email-${client.id}`} className="text-xs">Email</Label>
              <Input id={`edit-email-${client.id}`} size="sm" type="email" value={editEmail} onChange={(e)=>setEditEmail(e.target.value)} placeholder="Email" />
          </div>
          <div className="space-y-1">
              <Label htmlFor={`edit-phone-${client.id}`} className="text-xs">Phone</Label>
              <Input id={`edit-phone-${client.id}`} size="sm" value={editPhone} onChange={(e)=>setEditPhone(e.target.value)} placeholder="Phone" />
          </div>
          <div className="flex flex-col gap-1 items-end justify-end">
              <Button type="submit" size="sm" className="w-full">Save</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)} className="w-full">Cancel</Button>
          </div>
      </form>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clients</h1>

      <Card>
        <CardHeader><CardTitle>Add Client</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cname">Name</Label>
              <Input id="cname" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Client name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cemail">Email</Label>
              <Input id="cemail" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="client@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cphone">Phone</Label>
              <Input id="cphone" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+27 ..." />
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
        <div className="grid gap-3">
          {clients.length === 0 && <div className="text-sm text-muted-foreground">No clients yet.</div>}
          {clients.map(c => (
              c.id === editingId ? (
                // Render the inline edit form if this client is being edited
                <div key={c.id}>
                    {renderEditForm(c)}
                </div>
              ) : (
                // Render the default view
                <div key={c.id} className="rounded border p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(c.email || "—")} · {(c.phone || "—")} · {c.status}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEditStart(c)}>
                        Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onArchive(c)}>
                      {c.status === "archived" ? "Unarchive" : "Archive"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(c.id)}>Delete</Button>
                  </div>
                </div>
              )
          ))}
        </div>
      )}
    </div>
  );
}