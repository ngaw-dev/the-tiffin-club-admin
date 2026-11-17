// Shared types for the admin payments UI (see admin-api.md → Payments).
// All money fields are integer cents (NZD); convert to dollars only at render.
// Payments are immutable facts (docs/adr/0001): create + list only.

import type { ListEnvelope } from "@/lib/api";

export type PaymentMethod = "cash";

/** Payment as returned by GET /payments (AdminPaymentResource). */
export type Payment = {
  id: number;
  order_id: number;
  customer?: { id: number; name: string } & Record<string, unknown>;
  amount: number; // cents
  method: PaymentMethod | string;
  paid_at?: string; // ISO timestamp
  created_at?: string;
  updated_at?: string;
};

/** List payload for GET /payments. */
export type PaymentListEnvelope = ListEnvelope<Payment>;
