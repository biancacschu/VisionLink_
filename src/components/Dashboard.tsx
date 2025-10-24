import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Update = { id: number; title: string; created_at?: string };

export function Dashboard() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const out = await apiGet<Update[]>("/updates");
        setUpdates(Array.isArray(out) ? out : []);
      } catch {
        setErr("Could not load recent updates");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <Card>
        <CardHeader><CardTitle>Recent Updates</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {!loading && err && <div className="text-sm text-red-600">{err}</div>}
          {!loading && !err && updates.length === 0 && (
            <div className="text-sm text-muted-foreground">No updates yet.</div>
          )}
          {!loading && !err && updates.map(u => (
            <div key={u.id} className="rounded-md border p-3">
              <div className="font-medium">{u.title}</div>
              {u.created_at && (
                <div className="text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
