// lib/session.ts
"use client";

// Session persistence: token + user in localStorage.

export type SessionUser = { name: string; email: string };

export function clearSession() {
  window.localStorage.removeItem("admin.token");
  window.localStorage.removeItem("admin.user");
}

export function loadSession(): { token: string; user: SessionUser } | null {
  const token = window.localStorage.getItem("admin.token");
  const rawUser = window.localStorage.getItem("admin.user");
  if (!token || !rawUser) return null;
  try {
    return { token, user: JSON.parse(rawUser) as SessionUser };
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: SessionUser) {
  window.localStorage.setItem("admin.token", token);
  window.localStorage.setItem("admin.user", JSON.stringify(user));
}
