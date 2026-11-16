# 01: Enforce one-way Order Status lifecycle

**What to build:** Staff can no longer move an Order backward or sideways through its lifecycle. `PATCH /orders/{id}` with an illegal transition (e.g. `completed → confirmed`, skipping a step forward, or changing a terminal order) returns 422 with a clear message. Legal moves follow the one-way lifecycle in GLOSSARY.md ("Order Status"): `confirmed → ready_for_pickup → out_for_delivery → completed`, with `cancelled` reachable from any non-terminal status. Re-sending the current status is a no-op: 200, no audit entry written. Legal transitions still write the `status_changed` audit entry as today.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Illegal or backward transition (including from `completed` or `cancelled`) returns 422
- [x] Forward transition along the documented chain succeeds and writes one audit entry
- [x] Cancelling from each non-terminal status succeeds
- [x] Re-sending the current status returns 200 and writes no audit entry
- [x] Tests cover each of the above in the admin API feature test suite

_Note: work happens in the Laravel API repo (`the-tiffin-club-api`), admin controllers + feature tests. Doc reference: `admin-api.md` in `the-tiffin-club-admin`._
