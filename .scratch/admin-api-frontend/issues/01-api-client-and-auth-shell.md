# 01: API client + login/logout shell

**What it build:** A staff member can log in with their email/password, see the admin shell with their name, and log out. Unauthenticated visits to any admin page redirect to login. A 401 response clears the session and redirects to login; a 403 shows a clear "Your account isn't authorized for the admin panel" message and logs out.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] API client with configurable base URL (env var), Bearer token from localStorage, unwrapping the `{ success, message, data }` envelope and the `{ data: { resource, links, meta } }` list envelope
- [ ] Login page wired to `POST /api/v1/admin/login`, token + user persisted, name shown in the shell
- [ ] Logout calls `POST /api/v1/admin/logout` (deleting the server token) then clears local session
- [ ] All `(admin)` routes gated: no token → redirect to login
- [ ] 403 on any call → "not authorized" message then logged out (per Q4 decision)
