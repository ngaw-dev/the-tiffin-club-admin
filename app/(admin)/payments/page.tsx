// app/(admin)/payments/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { formatNzd } from "@/lib/money";
import { RecordPaymentForm } from "@/components/payments/record-payment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import type { Payment, PaymentListEnvelope } from "./types";

type Filters = { method: string; customerId: string };

const EMPTY_FILTERS: Filters = { method: "", customerId: "" };

const SORTS = [
  { value: "-paid_at", label: "Newest paid first" },
  { value: "paid_at", label: "Oldest paid first" },
  { value: "-amount", label: "Amount high–low" },
  { value: "amount", label: "Amount low–high" },
] as const;

function formatPaidAt(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-NZ", { dateStyle: "medium", timeStyle: "short" });
}

export default function PaymentsPage() {
  // Draft filter values, applied on submit.
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  // Applied filters drive the fetch.
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<string>("-paid_at");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<PaymentListEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordOpen, setRecordOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo(
    () => ({
      "filter[method]": applied.method || undefined,
      "filter[customer_id]": applied.customerId || undefined,
      sort,
      page: page > 1 ? String(page) : undefined,
    }),
    [applied, sort, page],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<PaymentListEnvelope>("/payments", query)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Something went wrong.");
          setResult(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  const meta = result?.meta;
  const lastPage = meta?.last_page ?? 1;
  // Sum of the payments on the current page, for cash reconciliation.
  const totalShown = result?.data.reduce((sum, p) => sum + p.amount, 0) ?? 0;

  function applyFilters(next: Filters) {
    setApplied(next);
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">
            Payments are immutable records — browse them by method, customer, or order.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Total shown:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {formatNzd(totalShown)}
            </span>
          </p>
          <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
            <DialogTrigger asChild>
              <Button>Record payment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Record payment</DialogTitle>
                <DialogDescription>
                  Record a cash payment against an order. Amounts are in NZD.
                </DialogDescription>
              </DialogHeader>
              <RecordPaymentForm
                onRecorded={() => {
                  setRecordOpen(false);
                  setReloadKey((k) => k + 1);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Filter by method or customer ID.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              applyFilters(draft);
            }}
          >
            <select
              aria-label="Filter by method"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={draft.method}
              onChange={(e) => setDraft({ ...draft, method: e.target.value })}
            >
              <option value="">All methods</option>
              <option value="cash">Cash</option>
            </select>
            <Input
              aria-label="Filter by customer ID"
              placeholder="Customer ID"
              inputMode="numeric"
              value={draft.customerId}
              onChange={(e) => setDraft({ ...draft, customerId: e.target.value })}
            />
            <select
              aria-label="Sort"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                Filter
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDraft(EMPTY_FILTERS);
                  applyFilters(EMPTY_FILTERS);
                }}
              >
                Clear
              </Button>
            </div>
          </form>

          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : !result || result.data.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No payments match these filters.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paid at</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatPaidAt(payment.paid_at)}</TableCell>
                      <TableCell className="font-medium">
                        {payment.customer ? (
                          <Link
                            href={`/customers/${payment.customer.id}`}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {payment.customer.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/orders/${payment.order_id}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          #{payment.order_id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {payment.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNzd(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {meta?.total ?? result.data.length} payment
                  {(meta?.total ?? result.data.length) === 1 ? "" : "s"}
                  {meta?.from != null && meta.to != null
                    ? ` · showing ${meta.from}–${meta.to}`
                    : ""}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(meta?.current_page ?? 1) <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(meta?.current_page ?? 1) >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
