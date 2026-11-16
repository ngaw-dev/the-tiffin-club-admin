# 1. Payments Are Immutable Facts

Date: 2026-11-16
Status: Accepted

## Context

The Tiffin Club is a same-day, pay-in-person cash business. Orders are small, and staff record
payments by hand through the admin API (`POST /payments`, default method cash). The obvious
future request is "add refunds" or "let me mark a payment as failed" — payment mutation.

Related decision: an Order with a non-zero paid sum cannot be cancelled through the admin API
(422). Cancelling a paid order would orphan money records or silently imply a refund.

## Decision

Payments are facts of history. The admin API supports creating payment records only. There is
no endpoint to edit, refund, delete, or fail a payment, and no endpoint to cancel an order
that has recorded payments. Corrections happen manually outside the API.

## Consequences

- Refund/void workflows require a conscious reversal of this ADR, not an incremental endpoint.
- The `cancelled` status is reachable only from orders with a zero paid sum.
- Staff friction in edge cases (pay-then-problem) is accepted deliberately: the scale of the
  business does not justify the complexity and audit risk of mutable money records.
- Money amounts in responses stay integer cents; requests take dollars. The asymmetry is
  documented in `admin-api.md`.
