# Admin API

Token-authenticated API for the admin SPA. All routes are prefixed with `/api/v1/admin`.

## Authentication

Sanctum personal access tokens. Access is limited to the staff email allowlist (`ADMIN_EMAILS` env / `config/staff.php`) — the same allowlist as the legacy staff web panel.

```
POST /api/v1/admin/login      { "email": "...", "password": "..." }  → { "data": { "token": "1|...", "user": { "name", "email" } } }
POST /api/v1/admin/logout     (Bearer token)                        → deletes the current token
```

All other endpoints require `Authorization: Bearer <token>` and return **401** without it, **403** if the account is not on the allowlist.

## Conventions

- Responses use the app's standard envelope: `{ success, message, data }`; lists are `{ data: { resource, links, meta } }`.
- List endpoints support Spatie Query Builder params: `?filter[...]=`, `?sort=` (prefix `-` for descending), `?page=`, `?per_page=` (default 15).
- All money amounts in **responses** are integer cents. Payment **requests** take dollars (`"amount": 20.00`); cents are stored. Mind the asymmetry.
- Fulfilment values: `pickup` | `delivery`.

## Orders

| Method | Path           | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/orders`      | Filters: `status`, `fulfilment`, `customer_id`, `menu_id`. Sorts: `placed_at`, `total`. Default `-placed_at`. Includes customer + payments (with `paid` sum).                                                                                                                                                                                                                                                                                                             |
| GET    | `/orders/{id}` | Includes items, payments, customer.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| PATCH  | `/orders/{id}` | `{ "status": "..." }` — status only. Lifecycle is one-way: `confirmed → ready_for_pickup → out_for_delivery → completed`; `cancelled` reachable from any non-terminal status; `completed`/`cancelled` terminal. Backward/invalid transitions → 422. Cancelling an order with a non-zero paid sum → 422 (handle the payment manually). Writes an audit entry (`status_changed`, actor `staff`) — audit entries are not exposed via this API. Order contents are immutable. |

## Payments

| Method | Path        | Notes                                                                                                                                                                                                            |
| ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/payments` | Filters: `method`, `order_id`, `customer_id`. Sorts: `paid_at`, `amount`. Default `-paid_at`.                                                                                                                    |
| POST   | `/payments` | `{ "order_id": 1, "amount": 20.00, "method": "cash"? }` — records a manual payment (dollars in, cents stored; `method` optional, defaults to `cash`). 422 if the amount exceeds the order's outstanding balance. |

Refunds / marking payments failed are not supported.

## Customers

| Method | Path              | Notes                                                                                                                             |
| ------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/customers`      | Filters: `name`, `email`, `suburb`. Sort: `name`. Includes `order_count`.                                                         |
| GET    | `/customers/{id}` | Includes orders (with payments), newest first.                                                                                    |
| PATCH  | `/customers/{id}` | Any of `name`, `email`, `phone`, `address`, `suburb`. Email is lowercased, phone normalized to digits. No create/delete/blocking. |

## Menus

| Method | Path                         | Notes                                                                                                                                                              |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/menus`                     | Filter: `menu_date`. Sort: `menu_date`. Default `-menu_date`. Includes items.                                                                                      |
| POST   | `/menus`                     | `{ "menu_date": "YYYY-MM-DD", "cutoff_time": "HH:MM"? }` — unique date.                                                                                            |
| GET    | `/menus/{id}`                | Includes items.                                                                                                                                                    |
| PATCH  | `/menus/{id}`                | `menu_date`, `cutoff_time`, and/or `publish: true/false` (sets/clears `published_at`). Unpublishing closes the Ordering Window immediately; existing orders stand. |
| DELETE | `/menus/{id}`                | Deletes the menu and its items (orders keep snapshot prices). **409** if any order references the menu. Does not delete orders.                                    |
| POST   | `/menus/{id}/items`          | `{ type, name, description?, price, sort_order? }` — `type`: `main` \| `extra`.                                                                                    |
| PATCH  | `/menus/{id}/items/{itemId}` | Same fields, all optional.                                                                                                                                         |
| DELETE | `/menus/{id}/items/{itemId}` | Safe for existing orders — `order_items` snapshot `unit_price`.                                                                                                    |

## Global Settings

| Method | Path        | Notes                                                                                                                                                                                                                                                                   |
| ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/settings` | Same shape as public `GET /v1/settings`.                                                                                                                                                                                                                                |
| PUT    | `/settings` | Partial update of any known key: `delivery_suburbs` (array), `order_cutoff_time`, `pickup_start_time`, `pickup_end_time` (`HH:MM`), `store_phone`, `store_phone_alternate`, `store_email` (email), `pickup_address`, `pickup_map_url` (url). Unknown keys are rejected. |

## Notes

- The legacy staff web panel (`/staff/*`) remains in place and untouched.
- The Filament panel at `/admin` is unrelated to this API (`/api/v1/admin`).
- Tests: `tests/Feature/AdminApiTest.php`.
- The admin SPA composes its "today" view from `GET /menus?filter[menu_date]=<date>` + `GET /orders`; no dashboard/summary endpoint exists in v1.
- `PUT /settings` is intentionally a partial update ("send the keys you want changed"); unknown keys are rejected.
