# 05: Reject unknown settings keys

**What to build:** `PUT /settings` with any key outside the known list returns 422 naming the offending key, instead of silently ignoring it. Known keys update partially exactly as today.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Request containing an unknown key returns 422 and changes nothing
- [x] Partial update of known keys still works
- [x] Tests cover both paths

_Note: work happens in the Laravel API repo (`the-tiffin-club-api`), admin settings controller + feature tests._
