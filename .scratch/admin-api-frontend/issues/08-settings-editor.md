# 08: Settings editor

**What it build:** Staff can view and edit global store settings at `/settings`: delivery suburbs, order cutoff, pickup window, phone/alternate phone, email, pickup address, and map URL. Times use HH:MM inputs. Unknown keys are never sent; a validation error from the API is surfaced on the field.

**Blocked by:** 01 (API client + login/logout shell)

**Status:** ready-for-agent

- [ ] Form over `GET /settings`, same shape as the public settings endpoint
- [ ] Partial update via `PUT /settings` with only known keys (delivery_suburbs array, order_cutoff_time / pickup_start_time / pickup_end_time HH:MM, store_phone, store_phone_alternate, store_email email, pickup_address, pickup_map_url url)
- [ ] Unknown-key 422 errors surfaced clearly; successful save confirmed
