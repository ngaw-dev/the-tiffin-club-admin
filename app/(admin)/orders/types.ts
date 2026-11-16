// Shared types for the admin orders UI (see admin-api.md → Orders).
// All money fields are integer cents (NZD); convert to dollars only at render.

export const ORDER_STATUSES = [
  "confirmed",
  "ready_for_pickup",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const FULFILMENTS = ["pickup", "delivery"] as const;
export type Fulfilment = (typeof FULFILMENTS)[number];

export type OrderPayment = {
  id: number;
  amount: number; // cents
  method?: string;
  paid_at?: string;
};

export type OrderItem = {
  name: string | null;
  quantity: number;
  unit_price: number; // cents (snapshot)
  line_total?: number; // cents
};

export type Order = {
  id: number;
  status: OrderStatus;
  fulfilment: Fulfilment;
  total: number; // cents
  /** Sum of recorded payments, in cents (`paid` on the API when payments are loaded). */
  paid_sum: number;
  placed_at: string; // ISO timestamp
  updated_at?: string; // ISO timestamp of last change (status, payments)
  customer_id?: number;
  menu_id?: number;
  customer?: { id: number; name: string };
  items?: OrderItem[];
  payments?: OrderPayment[];
};

/** Normalize an API order: compute paid_sum from `paid` or payments when absent. */
export function normalizeOrder<T extends { paid?: number; payments?: { amount: number }[] }>(
  order: T,
): Omit<T, "paid"> & { paid_sum: number } {
  const paidSum =
    order.paid !== undefined
      ? order.paid
      : (order.payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const { paid: _paid, ...rest } = order;
  return { ...rest, paid_sum: paidSum };
}

/** List payload as returned by lib/api.ts (envelope `data` already unwrapped). */
export type Paginated<T> = {
  data: T[];
  links?: { first?: string; last?: string; prev?: string; next?: string };
  meta?: {
    current_page?: number;
    last_page?: number;
    from?: number | null;
    to?: number | null;
    total?: number;
    per_page?: number;
  };
};

export type StatusTransition = { to: OrderStatus; label: string };

/**
 * Next legal status transition for an Order, branched by Fulfilment
 * (see docs/adr/0003): pickup orders go confirmed → ready_for_pickup →
 * completed; delivery orders go confirmed → out_for_delivery → completed.
 * Returns undefined for terminal or fulfilment-impossible states.
 */
export function nextStatusTransition(
  status: OrderStatus,
  fulfilment: Fulfilment,
): StatusTransition | undefined {
  if (fulfilment === "pickup") {
    switch (status) {
      case "confirmed":
        return { to: "ready_for_pickup", label: "Mark ready for pickup" };
      case "ready_for_pickup":
        return { to: "completed", label: "Mark completed" };
      default:
        return undefined;
    }
  }
  switch (status) {
    case "confirmed":
      return { to: "out_for_delivery", label: "Mark out for delivery" };
    case "out_for_delivery":
      return { to: "completed", label: "Mark completed" };
    default:
      return undefined;
  }
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: "Confirmed",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};
