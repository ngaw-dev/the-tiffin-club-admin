// app/(admin)/customers/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { formatNzd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type Payment = {
  id: number;
  amount: number;
  method: string | null;
  paid_at: string | null;
};

type Order = {
  id: number;
  status: string;
  fulfilment: "pickup" | "delivery" | string;
  total: number;
  placed_at: string | null;
  payments: Payment[];
};

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  suburb: string | null;
  order_count?: number;
  orders?: Order[];
};

const EDITABLE_FIELDS = ["name", "email", "phone", "address", "suburb"] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];
type EditValues = Record<EditableField, string>;

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "secondary",
  cancelled: "destructive",
};

function paidSum(order: Order): number {
  return order.payments.reduce((sum, p) => sum + p.amount, 0);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function toEditValues(customer: Customer): EditValues {
  return {
    name: customer.name ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    suburb: customer.suburb ?? "",
  };
}

export default function CustomerDetailPage(props: PageProps<"/customers/[id]">) {
  const { id } = use(props.params);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<EditValues | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<Customer>(`/customers/${id}`)
      .then((data) => {
        if (!cancelled) setCustomer(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Something went wrong.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Skeleton className="h-9 w-64" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Customer</h1>
        <p className="text-sm text-destructive">{error ?? "Customer not found."}</p>
        <Button asChild variant="outline" className="w-fit">
          <Link href="/customers">Back to customers</Link>
        </Button>
      </div>
    );
  }

  const orders = [...(customer.orders ?? [])].sort((a, b) => {
    const at = a.placed_at ? Date.parse(a.placed_at) : 0;
    const bt = b.placed_at ? Date.parse(b.placed_at) : 0;
    return bt - at;
  });

  function startEditing() {
    setValues(toEditValues(customer!));
    setFieldErrors({});
    setFormError(null);
    setSaved(false);
    setEditing(true);
  }

  async function save() {
    if (!values || !customer) return;
    setSaving(true);
    setFieldErrors({});
    setFormError(null);
    setSaved(false);
    const body: Record<string, string> = {};
    for (const field of EDITABLE_FIELDS) {
      body[field] = values[field];
    }
    try {
      const updated = await api.patch<Customer>(`/customers/${customer.id}`, body);
      setCustomer(updated);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.errors) setFieldErrors(err.errors);
      } else {
        setFormError("Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  }

  function fieldError(field: EditableField): string | null {
    return fieldErrors[field]?.[0] ?? null;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/customers" className="hover:text-foreground">
            Customers
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{customer.name}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
          {saved && <Badge variant="secondary">Saved</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            {editing
              ? "Update contact and delivery details. Email is lowercased and phone normalized to digits by the server."
              : "Contact and delivery information."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {editing && values ? (
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              {(
                [
                  ["name", "Name", "text"],
                  ["email", "Email", "email"],
                  ["phone", "Phone", "tel"],
                  ["suburb", "Suburb", "text"],
                ] as const
              ).map(([field, label, type]) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor={`edit-${field}`}>
                    {label}
                  </label>
                  <Input
                    id={`edit-${field}`}
                    type={type}
                    aria-invalid={fieldError(field) ? true : undefined}
                    value={values[field]}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                  />
                  {fieldError(field) && (
                    <p className="text-xs text-destructive">{fieldError(field)}</p>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-sm font-medium" htmlFor="edit-address">
                  Address
                </label>
                <Input
                  id="edit-address"
                  aria-invalid={fieldError("address") ? true : undefined}
                  value={values.address}
                  onChange={(e) => setValues({ ...values, address: e.target.value })}
                />
                {fieldError("address") && (
                  <p className="text-xs text-destructive">{fieldError("address")}</p>
                )}
              </div>
              {formError && <p className="text-sm text-destructive sm:col-span-2">{formError}</p>}
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["Email", customer.email],
                  ["Phone", customer.phone || "—"],
                  ["Address", customer.address || "—"],
                  ["Suburb", customer.suburb || "—"],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="text-sm font-medium">{label}</dt>
                  <dd className="text-sm text-muted-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {!editing && (
            <Button variant="outline" className="w-fit" onClick={startEditing}>
              Edit details
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {orders.length > 0
              ? `${orders.length} order${orders.length === 1 ? "" : "s"}, newest first.`
              : "No orders yet."}
          </CardDescription>
        </CardHeader>
        {orders.length > 0 && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fulfilment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Payments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const paid = paidSum(order);
                  return (
                    <TableRow key={order.id}>
                      <TableCell>{formatDate(order.placed_at)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[order.status] ?? "outline"}>
                          {order.status.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{order.fulfilment}</TableCell>
                      <TableCell className="text-right">{formatNzd(order.total)}</TableCell>
                      <TableCell className="text-right">{formatNzd(paid)}</TableCell>
                      <TableCell>
                        {order.payments.length === 0 ? (
                          <span className="text-muted-foreground">None</span>
                        ) : (
                          <span className="flex flex-col gap-0.5">
                            {order.payments.map((payment) => (
                              <span key={payment.id} className="text-muted-foreground">
                                {formatNzd(payment.amount)}
                                {payment.method ? ` · ${payment.method}` : ""}
                                {payment.paid_at ? ` · ${formatDate(payment.paid_at)}` : ""}
                              </span>
                            ))}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
