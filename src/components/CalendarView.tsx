import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiDelete } from "../lib/api";

type Event = {
  id: number;
  title: string;
  description?: string;
  start_date: string; // ISO
  end_date?: string;  // ISO
  location?: string;
};

export default function CalendarView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");

  const canCreate = useMemo(() => title.trim() && start, [title, start]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const es = await apiGet("/events");
        if (!mounted) return;
        setEvents(es || []);
      } catch {
        setErr("Failed to load events.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    try {
      const created = await apiPost("/events", {
        title, description, start_date: start, end_date: end || undefined, location,
      });
      setEvents(prev => [created, ...prev]);
      setTitle(""); setDescription(""); setStart(""); setEnd(""); setLocation("");
    } catch { setErr("Could not create event."); }
  }

  async function deleteEvent(id: number) {
    if (!confirm("Delete this event?")) return;
    try {
      await apiDelete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch { setErr("Could not delete event."); }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted-foreground">Team schedule and milestones.</p>
      </header>

      <form onSubmit={createEvent} className="grid gap-3 md:grid-cols-2 bg-white rounded-2xl p-4 shadow">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Title</label>
          <input className="border rounded-md px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Location</label>
          <input className="border rounded-md px-3 py-2" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="grid gap-1 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea className="border rounded-md px-3 py-2 min-h-20" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Start</label>
          <input type="datetime-local" className="border rounded-md px-3 py-2" value={start} onChange={e => setStart(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">End</label>
          <input type="datetime-local" className="border rounded-md px-3 py-2" value={end} onChange={e => setEnd(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <button disabled={!canCreate} className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-40">
            Create event
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b"><h2 className="font-medium">Upcoming</h2></div>
        {loading ? <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        : err ? <p className="p-4 text-sm text-red-600">{err}</p>
        : events.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No events yet.</p>
        : (
          <ul className="divide-y">
            {events.map(ev => (
              <li key={ev.id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {ev.start_date ? new Date(ev.start_date).toLocaleString() : ""}
                    {ev.end_date ? ` – ${new Date(ev.end_date).toLocaleString()}` : ""}
                    {ev.location ? ` · ${ev.location}` : ""}
                  </div>
                  {ev.description && <div className="text-sm mt-1">{ev.description}</div>}
                </div>
                <button onClick={() => deleteEvent(ev.id)} className="px-3 py-1 rounded-md border hover:bg-gray-50">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


