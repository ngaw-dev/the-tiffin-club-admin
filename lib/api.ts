// lib/api.ts
"use client";

// API client for the admin API (`/api/v1/admin`, see admin-api.md).
// - Base URL from NEXT_PUBLIC_ADMIN_API_BASE_URL (e.g. http://localhost:8000/api/v1/admin)
// - Bearer token from localStorage
// - Unwraps the `{ success, message, data }` envelope
// - 401 clears the session and redirects to /login
// - 403 surfaces "not authorized" and logs out

import { clearSession } from "@/lib/session";

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? "http://localhost:8000/api/v1/admin";

export class ApiError extends Error {
  status: number;
  /** Field-name → messages map for 422 validation errors, if present. */
  errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("admin.token");
}

type Envelope = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

/** List envelope: `{ data: { resource, links, meta } }`. */
export type ListEnvelope<T> = {
  data: T[];
  links?: { first?: string; last?: string; prev?: string; next?: string };
  meta?: {
    current_page?: number;
    last_page?: number;
    from?: number | null;
    to?: number | null;
    total?: number;
    per_page?: number;
  };
};

async function request<T>(
  method: string,
  path: string,
  options: { body?: unknown; query?: Record<string, string | undefined> } = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  if (response.status === 401) {
    clearSession();
    redirectToLogin();
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (response.status === 403) {
    clearSession();
    throw new ApiError(403, "Your account isn't authorized for the admin panel.");
  }

  let payload: Envelope | null = null;
  try {
    payload = (await response.json()) as Envelope;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ?? `Request failed (${response.status})`,
      (payload as { errors?: Record<string, string[]> } | null)?.errors ?? {},
    );
  }

  let data = payload?.data ?? null;

  // List envelope: `{ data: { resource, links, meta } }` — normalize `resource`
  // to `data` so callers always get `{ data: T[], links, meta }`.
  if (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "resource" in data &&
    Array.isArray((data as { resource?: unknown }).resource)
  ) {
    const list = data as { resource: unknown[]; links?: unknown; meta?: unknown };
    data = { data: list.resource, links: list.links, meta: list.meta };
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, query?: Record<string, string | undefined>) =>
    request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

function redirectToLogin() {
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.assign("/login");
  }
}
