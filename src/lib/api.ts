// src/lib/api.ts
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "";

const TOKEN_KEY = "auth_token";

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function buildUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p;
}

function authHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = buildUrl(`/api${path}`);
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers: { ...authHeaders(), ...(opts.headers || {}) },
    body: opts.body,
    credentials: "include",
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    console.error(`[API ${res.status}] ${url}\n${text}`);
    throw new Error(text || `API ${res.status} ${url}`);
  }
  const ct = res.headers.get("content-type") || "";
  return (ct.includes("application/json") ? JSON.parse(text || "{}") : (undefined as unknown)) as T;
}

export const apiGet =    <T,>(path: string) => request<T>(path);
export const apiPost =   <T,>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
export const apiPut =    <T,>(path: string, body?: unknown) => request<T>(path, { method: "PUT",  body: JSON.stringify(body ?? {}) });
export const apiDelete = <T,>(path: string) => request<T>(path, { method: "DELETE" });

// Optional helper if you want a one-liner:
export async function login(email: string, password: string) {
  const data = await apiPost<{ token?: string; user?: any }>(`/auth/login`, { email, password });
  if (data?.token) setToken(data.token);
  return data;
}
