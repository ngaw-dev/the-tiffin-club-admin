// app/(admin)/payments/page.tsx
// Payments list: amolsw ServerDataTable in manual (server) mode over GET /payments.
// Filter/sort/page/per_page state lives in the URL and is serialized to
// Spatie query-builder params (filter[...], sort, page, per_page).

"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import {
  ServerDataTable,
  useServerTableQuery,
  type ServerTableState,
} from "@/components/amolsw/data-table/server-data-table";
import { api } from "@/lib/api";
import { formatNzd } from "@/lib/money";
import { RecordPaymentForm } from "@/components/payments/record-payment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Payment, PaymentListEnvelope } from "./types";

const DEFAULT_PER_PAGE = 15;

function formatPaidAt(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-NZ", { dateStyle: "medium", timeStyle: "short" });
}

export default function PaymentsPage() {
  const [recordOpen, setRecordOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Sum of the payments on the current page, for cash reconciliation.
  const [totalShown, setTotalShown] = useState(0);

  const query = useServerTableQuery({
    filterKeys: ["method", "customer_id"],
    defaultSortField: "paid_at",
    defaultSortDirection: "desc",
    defaultPerPage: DEFAULT_PER_PAGE,
  });

  const selectFilters = useMemo(
    () => [
      {
        key: "method",
        label: "Method",
        placeholder: "All methods",
        options: [{ value: "cash", label: "Cash" }],
      },
      {
        key: "customer_id",
        label: "Customer ID",
        placeholder: "e.g. 12",
        options: [],
      },
    ],
    [],
  );

  // The API has no free-text payment search — the search box maps to the
  // numeric customer_id filter (ignored when non-numeric), as on Orders.
  const fetchPage = useCallback(
    async (state: ServerTableState, params: Record<string, string | undefined>) => {
      const { "filter[customer_id]": _selectCustomerId, ...rest } = params;
      const customerId =
        state.filters.customer_id || (/^\d+$/.test(state.search) ? state.search : undefined);
      const result = await api.get<PaymentListEnvelope>("/payments", {
        ...rest,
        "filter[customer_id]": customerId,
      });
      const rows = result.data ?? [];
      setTotalShown(rows.reduce((sum, p) => sum + p.amount, 0));
      return { ...result, data: rows };
    },
    [],
  );

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "paid_at",
        header: "Paid at",
        cell: ({ row }) => formatPaidAt(row.original.paid_at),
      },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) =>
          row.original.customer ? (
            <Link
              href={`/customers/${row.original.customer.id}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {row.original.customer.name}
            </Link>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "order_id",
        header: "Order",
        cell: ({ row }) => (
          <Link
            href={`/orders/${row.original.order_id}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            #{row.original.order_id}
          </Link>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize">
            {row.original.method}
          </Badge>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        meta: { className: "text-right" },
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{formatNzd(row.original.amount)}</span>
        ),
      },
    ],
    [],
  );

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
        <CardContent>
          <ServerDataTable
            columns={columns}
            query={query}
            fetchPage={fetchPage}
            selectFilters={selectFilters}
            searchPlaceholder="Search by customer ID..."
            emptyTitle="No payments found"
            emptyDescription="No payments match these filters. Try adjusting or clearing the filters."
            reloadKey={reloadKey}
          />
        </CardContent>
      </Card>
    </div>
  );
}
