// src/components/FileManagement.tsx
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiDelete, getToken } from "../lib/api";

// Authenticated uploader for multipart file upload
async function uploadWithAuth(path: string, formData: FormData) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Upload error:", res.status, text);
    throw new Error("Upload failed");
  }
  return await res.json();
}

type Project = { id: number; name: string };
type FileItem = {
  id: number;
  filename: string;
  original_name?: string;
  mime_type?: string;
  size?: number;
  project_id?: number;
  version?: number;
  created_at?: string;
  notes?: string;
};

export default function FileManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [projectId, setProjectId] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canUpload = useMemo(
    () => file && typeof projectId === "number",
    [file, projectId]
  );

  // Load projects once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ps = await apiGet<Project[]>("/projects");
        if (!mounted) return;
        setProjects(Array.isArray(ps) ? ps : []);
      } catch {
        setErr("Failed to load projects.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function refreshFiles(pid: number) {
    try {
      setLoading(true);
      setErr(null);
      const list = await apiGet<FileItem[]>(`/files?project_id=${pid}`);
      setFiles(Array.isArray(list) ? list : []);
    } catch {
      setErr("Failed to load files.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof projectId === "number") {
      refreshFiles(projectId);
    } else {
      setFiles([]);
    }
  }, [projectId]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!canUpload) return;
    try {
      const fd = new FormData();
      fd.append("file", file as Blob);
      fd.append("project_id", String(projectId));
      if (notes.trim()) fd.append("notes", notes.trim());

      const created = await uploadWithAuth("/files", fd);
      setFiles((prev) => [created, ...prev]);

      setFile(null);
      setNotes("");
      const el = document.getElementById(
        "file-input"
      ) as HTMLInputElement | null;
      if (el) el.value = "";
    } catch {
      setErr("Upload failed.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this file?")) return;
    try {
      await apiDelete(`/files/${id}`);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch {
      setErr("Could not delete file.");
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Files & Versioning</h1>
        <p className="text-sm text-muted-foreground">
          Upload drawings and documents per project.
        </p>
      </header>

      {/* Select project */}
      <div className="bg-white rounded-2xl p-4 shadow grid gap-3 md:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Project</label>
          <select
            className="border rounded-md px-3 py-2"
            value={projectId}
            onChange={(e) =>
              setProjectId(
                e.target.value ? Number(e.target.value) : ""
              )
            }
          >
            <option value="">Select project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload */}
      <form
        onSubmit={handleUpload}
        className="grid gap-3 md:grid-cols-2 bg-white rounded-2xl p-4 shadow"
      >
        <div className="grid gap-1">
          <label className="text-sm font-medium">File</label>
          <input
            id="file-input"
            type="file"
            className="border rounded-md px-3 py-2"
            onChange={(e) =>
              setFile(e.target.files?.[0] ?? null)
            }
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">
            Notes (optional)
          </label>
          <input
            className="border rounded-md px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <button
            disabled={!canUpload}
            className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-40"
          >
            Upload
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-medium">Files</h2>
          <span className="text-xs text-muted-foreground">
            {typeof projectId === "number"
              ? projects.find((p) => p.id === projectId)?.name
              : "Select a project"}
          </span>
        </div>

        {!projectId ? (
          <p className="p-4 text-sm text-muted-foreground">
            Choose a project to view files.
          </p>
        ) : loading ? (
          <p className="p-4 text-sm text-muted-foreground">
            Loading…
          </p>
        ) : err ? (
          <p className="p-4 text-sm text-red-600">{err}</p>
        ) : files.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No files yet.
          </p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Version</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Size</th>
                <th className="text-left px-4 py-2">Uploaded</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-4 py-2">
                    {f.original_name ?? f.filename}
                  </td>
                  <td className="px-4 py-2">{f.version ?? 1}</td>
                  <td className="px-4 py-2">
                    {f.mime_type ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    {f.size ? formatBytes(f.size) : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {f.created_at
                      ? new Date(
                          f.created_at
                        ).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <a
                      className="px-3 py-1 rounded-md border hover:bg-gray-50 inline-block"
                      href={`/api/files/${f.id}/download`}
                    >
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="px-3 py-1 rounded-md border hover:bg-gray-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do {
    bytes = bytes / 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);
  return `${bytes.toFixed(1)} ${units[i]}`;
}
