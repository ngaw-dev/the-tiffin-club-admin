# 04: Optional `method` on Manual Payments

**What to build:** `POST /payments` accepts an optional `method` field, validated against the accepted payment-method vocabulary — currently only `cash`. Omitting it defaults to `cash` (today's behaviour). Supplying an unaccepted method returns 422 instead of being silently ignored. Amounts are integer cents (matching the rest of the admin API).

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Omitted `method` stores `cash`
- [x] Explicit `"method": "cash"` stores `cash`
- [x] Any other method value returns 422
- [x] Tests cover all three paths

*Note: work happens in the Laravel API repo (`the-tiffin-club-api`), admin payment controller + feature tests.*
