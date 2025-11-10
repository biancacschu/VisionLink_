// src/lib/api.ts
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "";

export const TOKEN_KEY = "auth_token"; // This key is the source of truth

export function setToken(token: string) {
  // Uses sessionStorage (correct for persistence across refresh)
  sessionStorage.setItem(TOKEN_KEY, token);
}
export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
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

export const apiGet =    <T,>(path: string) => request<T>(path);
export const apiPost =   <T,>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
export const apiPut =    <T,>(path: string, body?: unknown) => request<T>(path, { method: "PUT",  body: JSON.stringify(body ?? {}) });
export const apiDelete = <T,>(path: string) => request<T>(path, { method: "DELETE" });

// apiLogin stores the token internally using setToken
export async function apiLogin(email: string, password: string) {
  const data = await apiPost<{ token?: string; user?: any }>(`/auth/login`, { email, password });
  // CRITICAL: Save the token immediately upon successful login response
  if (data?.token) setToken(data.token);
  return data;
}