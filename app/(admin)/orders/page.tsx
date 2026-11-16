"use client";

// app/(admin)/orders/page.tsx
// Orders list: Spatie query-builder filters/sorts + pagination against GET /orders.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { formatNzd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FULFILMENTS,
  ORDER_STATUSES,
  STATUS_LABELS,
  type Order,
  type OrderStatus,
  type Paginated,
  normalizeOrder,
} from "./types";

const PER_PAGE = "15";

type SortKey = "placed_at" | "total";

type Filters = {
  status: string;
  fulfilment: string;
  customer_id: string;
  menu_id: string;
};

const EMPTY_FILTERS: Filters = {
  status: "",
  fulfilment: "",
  customer_id: "",
  menu_id: "",
};

function statusVariant(status: OrderStatus) {
  switch (status) {
    case "completed":
      return "default" as const;
    case "cancelled":
      return "destructive" as const;
    case "out_for_delivery":
    case "ready_for_pickup":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("placed_at");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Paginated<Order>["meta"]>(undefined);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sort = useMemo(() => (sortDesc ? `-${sortKey}` : sortKey), [sortKey, sortKey]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<Paginated<Order>>("/orders", {
        "filter[status]": applied.status || undefined,
        "filter[fulfilment]": applied.fulfilment || undefined,
        "filter[customer_id]": applied.customer_id || undefined,
        "filter[menu_id]": applied.menu_id || undefined,
        sort,
        page: String(page),
        per_page: PER_PAGE,
      });
      setOrders((result.data ?? []).map(normalizeOrder));
      setMeta(result.meta);
      setHasPrev(Boolean(result.links?.prev));
      setHasNext(Boolean(result.links?.next));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong loading orders.");
    } finally {
      setLoading(false);
    }
  }, [applied, page, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  function applyFilters(next: Filters) {
    setFilters(next);
    setApplied(next);
    setPage(1);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(key === "placed_at"); // newest first by default
    }
    setPage(1);
  }

  const sortIndicator = (key: SortKey) => (sortKey === key ? (sortDesc ? " ↓" : " ↑") : "");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track tiffin orders from placement through delivery, flag issues, and keep the day&apos;s
          delivery run on schedule.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Status
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
              value={filters.status}
              onChange={(e) => applyFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Fulfilment
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
              value={filters.fulfilment}
              onChange={(e) => applyFilters({ ...filters, fulfilment: e.target.value })}
            >
              <option value="">All</option>
              {FULFILMENTS.map((f) => (
                <option key={f} value={f}>
                  {f === "pickup" ? "Pickup" : "Delivery"}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Customer ID
            <Input
              className="h-9 w-28"
              inputMode="numeric"
              placeholder="e.g. 12"
              value={filters.customer_id}
              onChange={(e) => setFilters({ ...filters, customer_id: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters(filters);
              }}
              onBlur={() => {
                if (filters.customer_id !== applied.customer_id) applyFilters(filters);
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Menu ID
            <Input
              className="h-9 w-28"
              inputMode="numeric"
              placeholder="e.g. 3"
              value={filters.menu_id}
              onChange={(e) => setFilters({ ...filters, menu_id: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters(filters);
              }}
              onBlur={() => {
                if (filters.menu_id !== applied.menu_id) applyFilters(filters);
              }}
            />
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFilters(EMPTY_FILTERS)}
            disabled={
              !applied.status && !applied.fulfilment && !applied.customer_id && !applied.menu_id
            }
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {error ? (
            <div className="flex flex-col items-start gap-2 py-8 text-sm text-destructive">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={() => void load()}>
                Retry
              </Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col gap-2 py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">No orders match these filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>
                    <button
                      type="button"
                      className="font-medium hover:text-foreground"
                      onClick={() => toggleSort("placed_at")}
                    >
                      Placed{sortIndicator("placed_at")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button
                      type="button"
                      className="font-medium hover:text-foreground"
                      onClick={() => toggleSort("total")}
                    >
                      Total{sortIndicator("total")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Fulfilment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/orders/${order.id}`}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        #{order.id}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customer?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.placed_at ? new Date(order.placed_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatNzd(order.total)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatNzd(order.paid_sum)}
                    </TableCell>
                    <TableCell className="capitalize">{order.fulfilment}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(order.status)}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {meta?.total !== undefined && meta.total > 0
            ? `${meta.total} order${meta.total === 1 ? "" : "s"}`
            : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span>
            Page {meta?.current_page ?? page}
            {meta?.last_page ? ` of ${meta.last_page}` : ""}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
