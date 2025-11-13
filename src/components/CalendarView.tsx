// src/components/CalendarView.tsx
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiDelete } from "../lib/api";

// --- Types coming from your API ---
type DBEvent = {
  id: number;
  title: string;
  date: string;             // "YYYY-MM-DD"
  type?: string | null;
  time?: string | null;     // "HH:MM"
  project_id?: number | null;
};

type Task = {
  id: number;
  title: string;
  status: string;
  due_date?: string | null;
  project_id?: number | null;
  priority?: string | null;
};

type Project = {
  id: number;
  name: string;
};

// Unified event type for the calendar (events + tasks)
type CalendarEvent = {
  id: string;                   // "event-1" | "task-3"
  dbId?: number;                // real DB id for events only
  title: string;
  date: string;                 // "YYYY-MM-DD"
  type: string;                 // "meeting" | "deadline" | "task" | ...
  time: string | null;          // "HH:MM" or null
  project_id: number | null;
  source: "event" | "task";
  status?: string;
  priority?: string | null;
};

function formatKey(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const [events, setEvents] = useState<DBEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Event creation form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // UI-only
  const [start, setStart] = useState("");             // datetime-local
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");       // UI-only
  const [eventProjectId, setEventProjectId] = useState<string>("none");
  const [submitting, setSubmitting] = useState(false);

  const canCreate = useMemo(
    () => title.trim().length > 0 && start.length > 0 && !submitting,
    [title, start, submitting]
  );

  // --- Load events, tasks & projects from API ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [evs, ts, pjs] = await Promise.all([
          apiGet<DBEvent[]>("/events"),
          apiGet<Task[]>("/tasks"),
          apiGet<Project[]>("/projects"),
        ]);

        if (!mounted) return;
        setEvents(Array.isArray(evs) ? evs : []);
        setTasks(Array.isArray(ts) ? ts : []);
        setProjects(Array.isArray(pjs) ? pjs : []);
      } catch {
        if (!mounted) return;
        setErr("Failed to load calendar data.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Build unified list of calendar events (events + task due-dates) ---
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];

    // Real events from DB
    for (const ev of events) {
      if (!ev.date) continue;
      list.push({
        id: `event-${ev.id}`,
        dbId: ev.id,
        title: ev.title,
        date: ev.date.substring(0, 10),
        type: ev.type || "meeting",
        time: ev.time ?? null,
        project_id: ev.project_id ?? null,
        source: "event",
      });
    }

    // Task due dates as "task" events (like Design-Studio)
    for (const t of tasks) {
      if (!t.due_date) continue;
      list.push({
        id: `task-${t.id}`,
        title: t.title,
        date: t.due_date.substring(0, 10),
        type: "task",
        time: null, // all-day task indicator
        project_id: t.project_id ?? null,
        source: "task",
        status: t.status,
        priority: t.priority ?? null,
      });
    }

    return list;
  }, [events, tasks]);

  // Map date -> events for that date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of calendarEvents) {
      const key = ev.date.substring(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    }
    return map;
  }, [calendarEvents]);

  const months = [
    { name: "January", value: 0 },
    { name: "February", value: 1 },
    { name: "March", value: 2 },
    { name: "April", value: 3 },
    { name: "May", value: 4 },
    { name: "June", value: 5 },
    { name: "July", value: 6 },
    { name: "August", value: 7 },
    { name: "September", value: 8 },
    { name: "October", value: 9 },
    { name: "November", value: 10 },
    { name: "December", value: 11 },
  ];
  const startYear = 1950;
  const endYear = 2050;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Build calendar grid for current month
  const { calendarDays, year, monthIndex } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= lastDayOfMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);

    return { calendarDays: days, year, monthIndex: month };
  }, [currentDate]);

  const today = new Date();
  const todayKey = formatKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const selectedDateEvents = useMemo(() => {
    if (!selectedKey) return [];
    return eventsByDate.get(selectedKey) ?? [];
  }, [selectedKey, eventsByDate]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setCurrentDate(
      (prevDate) => new Date(newYear, prevDate.getMonth(), 1)
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      (prevDate) =>
        new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prevDate) =>
        new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1)
    );
  };

  // --- Create new event (real DB event, not task) ---
  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    try {
      setSubmitting(true);
      const [datePart, timePart] = start.split("T");

      const payload: Partial<DBEvent> = {
        title: title.trim(),
        date: datePart,
        time: timePart || null,
        type: "meeting",
        project_id:
          eventProjectId === "none" ? null : Number(eventProjectId),
      };

      const created = await apiPost<DBEvent>("/events", payload);
      setEvents((prev) => [...prev, created]);

      // Move calendar to month of created event
      if (datePart) {
        const [y, m, d] = datePart.split("-").map(Number);
        if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
          const newDate = new Date(y, m - 1, d);
          setCurrentDate(newDate);
          setSelectedKey(formatKey(y, m - 1, d));
        }
      }

      // Reset form (description/location are UI-only)
      setTitle("");
      setDescription("");
      setLocation("");
      setStart("");
      setEnd("");
      setEventProjectId("none");
    } catch {
      alert("Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete ONLY real events (not tasks)
  async function handleDeleteEvent(ev: CalendarEvent) {
    if (!ev.dbId) return; // tasks are read-only here
    if (!confirm("Delete this event?")) return;
    try {
      await apiDelete(`/events/${ev.dbId}`);
      setEvents((prev) => prev.filter((e) => e.id !== ev.dbId));
    } catch {
      alert("Failed to delete event.");
    }
  }

  // Small helper to style different event types
  function pillClasses(ev: CalendarEvent) {
    if (ev.type === "task") {
      return "bg-amber-100 text-amber-900";
    }
    if (ev.type === "deadline") {
      return "bg-red-100 text-red-800";
    }
    return "bg-blue-100 text-blue-800";
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Meetings, deadlines and task due dates.
        </p>
      </header>

      {loading && (
        <div className="text-sm text-muted-foreground">Loading…</div>
      )}
      {!loading && err && (
        <div className="text-sm text-red-600 mb-2">{err}</div>
      )}

      {/* --- Month View Calendar --- */}
      <div className="bg-white rounded-2xl shadow overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100"
          >
            &lt;
          </button>

          <div className="flex items-center gap-3">
            <select
              value={monthIndex}
              onChange={handleMonthChange}
              className="text-xl font-semibold border rounded-md p-1"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={handleYearChange}
              className="text-xl font-semibold border rounded-md p-1"
            >
              {years.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100"
          >
            &gt;
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-t py-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 divide-x divide-y border-b">
          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={index}
                  className="h-24 p-2 text-right text-sm bg-gray-50 text-gray-400"
                />
              );
            }

            const key = formatKey(year, monthIndex, day);
            const dayEvents = eventsByDate.get(key) ?? [];
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;

            return (
              <button
                type="button"
                key={index}
                onClick={() =>
                  setSelectedKey((prev) => (prev === key ? null : key))
                }
                className={`h-24 p-2 text-right text-sm border-0 w-full ${
                  isSelected
                    ? "bg-blue-50"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className={`font-semibold text-right ${
                    isToday ? "text-blue-600" : ""
                  }`}
                >
                  {day}
                </div>

                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={`text-[10px] px-1 py-0.5 rounded truncate ${pillClasses(
                        ev
                      )}`}
                    >
                      {ev.type === "task" ? "Task · " : ""}
                      {ev.time ? `${ev.time} · ` : ""}
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected-day event list (events + tasks) */}
      {selectedKey && (
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">
              Schedule on {selectedKey}
            </h2>
            <button
              className="text-xs text-muted-foreground"
              onClick={() => setSelectedKey(null)}
            >
              Clear selection
            </button>
          </div>
          {selectedDateEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items on this day.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {selectedDateEvents.map((ev) => {
                const project = projects.find(
                  (p) => p.id === ev.project_id
                );
                return (
                  <li
                    key={ev.id}
                    className="flex items-center justify-between border rounded-md px-3 py-2"
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <span>{ev.title}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${pillClasses(
                            ev
                          )}`}
                        >
                          {ev.type === "task"
                            ? ev.priority
                              ? `Task · ${ev.priority}`
                              : "Task"
                            : ev.type}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-x-2">
                        <span>{ev.time || "All day"}</span>
                        {project && (
                          <span>· {project.name}</span>
                        )}
                        {ev.type === "task" && ev.status && (
                          <span>· {ev.status}</span>
                        )}
                      </div>
                    </div>
                    {ev.source === "event" && ev.dbId && (
                      <button
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                        onClick={() => handleDeleteEvent(ev)}
                      >
                        Delete
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* --- Event Creation Form (still only creates real events) --- */}
      <form
        onSubmit={createEvent}
        className="grid gap-3 md:grid-cols-2 bg-white rounded-2xl p-4 shadow"
      >
        <div className="grid gap-1">
          <label className="text-sm font-medium">Title</label>
          <input
            className="border rounded-md px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Project</label>
          <select
            className="border rounded-md px-3 py-2"
            value={eventProjectId}
            onChange={(e) => setEventProjectId(e.target.value)}
          >
            <option value="none">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="border rounded-md px-3 py-2 min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Location</label>
          <input
            className="border rounded-md px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Start</label>
          <input
            type="datetime-local"
            className="border rounded-md px-3 py-2"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">End</label>
          <input
            type="datetime-local"
            className="border rounded-md px-3 py-2"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <button
            disabled={!canCreate}
            className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-40"
          >
            {submitting ? "Creating…" : "Create event"}
          </button>
        </div>
      </form>
    </div>
  );
}
