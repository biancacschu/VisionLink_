// src/lib/api.ts
// In dev, set VITE_API_BASE_URL="http://localhost:5000".
// If not set, it falls back to http://localhost:5000.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

// ===== Auth token helpers =====

export const TOKEN_KEY = "auth_token"; // This key is the source of truth

export function setToken(token: string) {
  // Uses sessionStorage for persistence across refresh
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ===== Internal helpers =====

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

export const apiGet    = <T,>(path: string) => request<T>(path);
export const apiPost   = <T,>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
export const apiPut    = <T,>(path: string, body?: unknown) =>
  request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) });
export const apiDelete = <T,>(path: string) =>
  request<T>(path, { method: "DELETE" });

// apiLogin stores the token internally using setToken
export async function apiLogin(email: string, password: string) {
  const data = await apiPost<{ token?: string; user?: any }>(`/auth/login`, { email, password });
  if (data?.token) setToken(data.token);
  return data;
}

// ===== Feature-specific fetch helpers =====
// These now consistently hit /api/... via apiGet()
export async function fetchStaff() {
  return apiGet(`/staff`);
}
export async function createStaffMember(payload: {
  name: string;
  email: string;
  role: string;
  department?: string | null;
  status?: string;
  joinDate?: string;
  phone?: string;
  location?: string;
  projectsActive?: number;
}) {
  return apiPost("/staff", payload);
}

export async function fetchClients() {
  return apiGet(`/clients`);
}

export async function fetchClientDetails(id: number) {
  return apiGet(`/clients/${id}`);
}

export async function fetchFiles() {
  return apiGet(`/files`);
}

export async function fetchEvents() {
  return apiGet(`/events`);
}

export async function fetchMessageChannels() {
  return apiGet(`/message-channels`);
}

export async function fetchMessages(channelId: number) {
  return apiGet(`/message-channels/${channelId}/messages`);
}

export async function fetchDashboard() {
  return apiGet(`/dashboard`);
}
