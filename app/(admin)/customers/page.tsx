// app/(admin)/customers/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, ApiError, type ListEnvelope } from "@/lib/api";
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

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  suburb: string | null;
  order_count: number;
};

type Filters = { name: string; email: string; suburb: string };

const EMPTY_FILTERS: Filters = { name: "", email: "", suburb: "" };

export default function CustomersPage() {
  // Draft filter values, applied on submit.
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  // Applied filters drive the fetch.
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<ListEnvelope<Customer> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(
    () => ({
      "filter[name]": applied.name || undefined,
      "filter[email]": applied.email || undefined,
      "filter[suburb]": applied.suburb || undefined,
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
      .get<ListEnvelope<Customer>>("/customers", query)
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
  }, [query]);

  const meta = result?.meta;
  const lastPage = meta?.last_page ?? 1;

  function applyFilters(next: Filters) {
    setApplied(next);
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Browse subscribers, look up delivery details, and see how many orders each customer has
          placed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>Filter by name, email, or suburb.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              applyFilters(draft);
            }}
          >
            <Input
              aria-label="Filter by name"
              placeholder="Name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <Input
              aria-label="Filter by email"
              placeholder="Email"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
            <Input
              aria-label="Filter by suburb"
              placeholder="Suburb"
              value={draft.suburb}
              onChange={(e) => setDraft({ ...draft, suburb: e.target.value })}
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
              <option value="name">Name A–Z</option>
              <option value="-name">Name Z–A</option>
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
            <p className="py-4 text-sm text-muted-foreground">No customers match these filters.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Suburb</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || "—"}</TableCell>
                      <TableCell>{customer.suburb || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{customer.order_count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {meta?.total ?? result.data.length} customer
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
