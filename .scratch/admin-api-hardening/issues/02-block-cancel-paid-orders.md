# 02: Block cancelling paid Orders

**What to build:** An Order with a recorded paid sum greater than zero cannot be cancelled through the admin API: `PATCH /orders/{id}` with `status: cancelled` returns 422 telling staff to handle the payment manually. Unpaid orders cancel as before. This enforces ADR 0001 ("payments are immutable") — cancelling a paid order would orphan money records.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Cancelling a fully or partially paid order returns 422
- [x] Cancelling an order with zero recorded payments succeeds
- [x] Other status transitions on a paid order are unaffected
- [x] Tests cover paid and unpaid cancellation paths

*Note: work happens in the Laravel API repo (`the-tiffin-club-api`), admin order controller + feature tests.*
