"use client";

// app/(admin)/orders/[id]/page.tsx
// Order detail: items, payments, customer, totals; status change (PATCH /orders/{id});
// record cash payment (POST /payments). Money is cents at the API boundary only.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { dollarsToCents, formatNzd } from "@/lib/money";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { normalizeOrder, ORDER_STATUSES, STATUS_LABELS, type Order, type OrderStatus } from "../types";

type OrderItem = {
  id?: number;
  name?: string;
  /** Snapshot price in cents. */
  unit_price?: number;
  quantity?: number;
};

type OrderDetail = Order & {
  items?: OrderItem[];
  order_items?: OrderItem[];
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

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSaved, setStatusSaved] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSaved, setPaymentSaved] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<OrderDetail>(`/orders/${id}`);
      setOrder(normalizeOrder(result));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong loading this order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = useMemo(() => order?.order_items ?? order?.items ?? [], [order]);

  const payments = useMemo(
    () =>
      [...(order?.payments ?? [])].sort(
        (a, b) => new Date(b.paid_at ?? 0).getTime() - new Date(a.paid_at ?? 0).getTime(),
      ),
    [order],
  );

  const total = order?.total ?? 0;
  const paidSum = order?.paid_sum ?? 0;
  const outstanding = total - paidSum;
  const hasPayments = paidSum > 0;

  async function changeStatus(next: OrderStatus) {
    if (!order || next === order.status) return;
    setStatusBusy(true);
    setStatusError(null);
    setStatusSaved(null);
    try {
      await api.patch<OrderDetail>(`/orders/${order.id}`, { status: next });
      setStatusSaved(`Status updated to “${STATUS_LABELS[next]}”.`);
      await load();
    } catch (err) {
      setStatusError(err instanceof ApiError ? err.message : "Could not update the order status.");
    } finally {
      setStatusBusy(false);
    }
  }

  async function recordPayment(event: React.FormEvent) {
    event.preventDefault();
    if (!order) return;
    setPaymentError(null);
    setPaymentSaved(null);
    const cents = dollarsToCents(amount);
    if (Number.isNaN(cents) || cents <= 0) {
      setPaymentError("Enter a valid dollar amount, e.g. 16.50.");
      return;
    }
    setPaymentBusy(true);
    try {
      await api.post("/payments", { order_id: order.id, amount: cents });
      setPaymentSaved("Payment recorded.");
      setAmount("");
      await load();
    } catch (err) {
      setPaymentError(err instanceof ApiError ? err.message : "Could not record the payment.");
    } finally {
      setPaymentBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Skeleton className="h-9 w-64" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to orders
        </Link>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-start gap-2 py-8 text-sm text-destructive">
              <p>{error ?? "Order not found."}</p>
              <Button variant="outline" size="sm" onClick={() => void load()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to orders
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
        <p className="text-sm text-muted-foreground">
          Placed {order.placed_at ? new Date(order.placed_at).toLocaleString() : "—"} ·{" "}
          <span className="capitalize">{order.fulfilment}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1 pt-6">
            <p className="text-xs font-medium text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold tabular-nums">{formatNzd(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 pt-6">
            <p className="text-xs font-medium text-muted-foreground">Paid</p>
            <p className="text-2xl font-semibold tabular-nums">{formatNzd(paidSum)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 pt-6">
            <p className="text-xs font-medium text-muted-foreground">Outstanding</p>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                outstanding > 0 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {formatNzd(Math.max(0, outstanding))}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Badge variant={statusVariant(order.status)}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          Status
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground disabled:opacity-50"
            value={order.status}
            disabled={statusBusy}
            onChange={(e) => void changeStatus(e.target.value as OrderStatus)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s} disabled={s === "cancelled" && hasPayments}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        {statusSaved && <span className="text-sm text-muted-foreground">{statusSaved}</span>}
        {statusError && <span className="text-sm text-destructive">{statusError}</span>}
        {hasPayments && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help text-xs text-muted-foreground underline decoration-dotted">
                Why is Cancelled unavailable?
              </span>
            </TooltipTrigger>
            <TooltipContent>Order has recorded payments</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-lg font-semibold">Items</h2>
            {items.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No items recorded.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Line total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={item.id ?? i}>
                      <TableCell className="font-medium">{item.name ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.unit_price !== undefined ? formatNzd(item.unit_price) : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.quantity ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {item.unit_price !== undefined && item.quantity !== undefined
                          ? formatNzd(item.unit_price * item.quantity)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <h2 className="text-lg font-semibold">Customer</h2>
              <div className="flex flex-col gap-1 text-sm">
                <p className="font-medium">{order.customer?.name ?? "—"}</p>
                {order.customer_id !== undefined && (
                  <p className="text-muted-foreground">Customer #{order.customer_id}</p>
                )}
                {order.menu_id !== undefined && (
                  <p className="text-muted-foreground">Menu #{order.menu_id}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {outstanding > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-1 text-lg font-semibold">Record cash payment</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Outstanding balance: {formatNzd(outstanding)}
                </p>
                <form className="flex items-end gap-3" onSubmit={(e) => void recordPayment(e)}>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                    Amount (NZD)
                    <Input
                      className="h-9 w-32"
                      inputMode="decimal"
                      placeholder="e.g. 16.50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </label>
                  <Button type="submit" disabled={paymentBusy}>
                    {paymentBusy ? "Recording…" : "Record payment"}
                  </Button>
                </form>
                {paymentSaved && (
                  <p className="mt-3 text-sm text-muted-foreground">{paymentSaved}</p>
                )}
                {paymentError && <p className="mt-3 text-sm text-destructive">{paymentError}</p>}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Payments</h2>
          {payments.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No payments recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paid at</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-muted-foreground">
                      {payment.paid_at ? new Date(payment.paid_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="capitalize">{payment.method ?? "cash"}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatNzd(payment.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
