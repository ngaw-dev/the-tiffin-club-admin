# 3. Order Status Lifecycle Is Branched by Fulfilment

Date: 2026-11-17
Status: Accepted

## Context

Orders are fulfilled two ways: pickup or delivery. The original status workflow was a single
shared chain — confirmed → ready_for_pickup → out_for_delivery → completed — so pickup orders
passed through "out for delivery" and delivery orders through "ready for pickup". Staff had to
click through a nonsense step for every order of one kind or the other, and the status badge
lied about what was physically happening.

The API already accepts any of the five statuses via `PATCH /orders/{id}` and audits every
change; it does not itself enforce the sequence. Only the admin UI's offered transitions
needed to change.

## Decision

The Order Status workflow branches on the Order's Fulfilment:

- pickup: confirmed → ready_for_pickup → completed
- delivery: confirmed → out_for_delivery → completed

Cancelled remains reachable from any non-terminal status (subject to ADR 0001: no cancellation
once payments exist). A pickup order never holds `out_for_delivery` and a delivery order never
holds `ready_for_pickup`; the API accepts any listed status but the admin UI only ever offers
the legal next step, so those combinations are never produced.

## Consequences

- Status-filtered lists mix fulfilments, so a "Ready for pickup" filter is implicitly
  pickup-only and "Out for delivery" implicitly delivery-only.
- Any future third fulfilment mode (e.g. courier) needs an explicit lifecycle branch here.
- The single `completed` terminal status stays; there is no separate "picked up" state.
