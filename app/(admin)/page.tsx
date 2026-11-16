// app/(admin)/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, ClipboardList, CreditCard, UtensilsCrossed } from "lucide-react";

import { ApiError, api } from "@/lib/api";
import { formatNzd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { isMenuPublished, type Menu } from "./menu/types";
import { type Paginated } from "./orders/types";

/** "YYYY-MM-DD" in the admin's local timezone. */
function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

type Settings = {
  order_cutoff_time?: string | null;
  pickup_start_time?: string | null;
  pickup_end_time?: string | null;
};

type Payment = {
  id: number;
  amount: number; // cents
  method?: string;
  paid_at?: string;
};

const OPEN_STATUSES = ["confirmed", "ready_for_pickup", "out_for_delivery"] as const;

/** True if the local time of day (minutes since midnight) is before the cutoff. */
function isBeforeCutoff(hhmm: string, now = new Date()): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (match === null) return false;
  const cutoffMinutes = Number(match[1]) * 60 + Number(match[2]);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes < cutoffMinutes;
}

function isTodayLocal(iso: string | undefined | null): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  return (
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}` === localToday()
  );
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export default function DashboardPage() {
  const today = localToday();

  const [menu, setMenu] = useState<Menu | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [openCounts, setOpenCounts] = useState<number[] | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [paymentsTotal, setPaymentsTotal] = useState<number | null>(null);
  const [paymentsCount, setPaymentsCount] = useState<number | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  const load = useCallback(async () => {
    void (async () => {
      try {
        const result = await api.get<Paginated<Menu>>("/menus", {
          "filter[menu_date]": today,
          per_page: "1",
        });
        setMenu(result.data[0] ?? null);
      } catch (error) {
        setMenuError(errorMessage(error, "Failed to load today's menu."));
      }
    })();

    void (async () => {
      try {
        const result = await api.get<Settings>("/settings");
        setSettings(result);
      } catch (error) {
        setSettingsError(errorMessage(error, "Failed to load settings."));
      }
    })();

    void (async () => {
      try {
        const results = await Promise.all(
          OPEN_STATUSES.map((status) =>
            api.get<Paginated<unknown>>("/orders", {
              "filter[status]": status,
              per_page: "1",
            }),
          ),
        );
        setOpenCounts(results.map((result) => result.meta?.total ?? result.data.length));
      } catch (error) {
        setOpenCounts([]);
        setOrdersError(errorMessage(error, "Failed to load orders."));
      }
    })();

    void (async () => {
      try {
        const result = await api.get<Paginated<Payment>>("/payments", {
          sort: "-paid_at",
          per_page: "100",
        });
        const todays = result.data.filter((payment) => isTodayLocal(payment.paid_at));
        setPaymentsCount(todays.length);
        setPaymentsTotal(todays.reduce((sum, payment) => sum + payment.amount, 0));
      } catch (error) {
        setPaymentsTotal(0);
        setPaymentsCount(0);
        setPaymentsError(errorMessage(error, "Failed to load payments."));
      }
    })();
  }, [today]);

  useEffect(() => {
    void load();
  }, [load]);

  const cutoff = menu?.cutoff_time ?? settings?.order_cutoff_time ?? null;
  const orderingOpen = cutoff !== null ? isBeforeCutoff(cutoff) : null;
  const openTotal = openCounts?.reduce((sum, count) => sum + count, 0) ?? null;

  const main = menu?.items.find((item) => item.type === "main") ?? null;
  const extras = menu?.items.filter((item) => item.type === "extra") ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Today at a glance: the menu, the ordering window, open orders, and payments taken.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Open orders</CardDescription>
            <ClipboardList className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            {ordersError !== null ? (
              <p className="text-sm text-destructive">{ordersError}</p>
            ) : openCounts === null ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <p className="text-2xl font-bold tabular-nums">{openTotal}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Confirmed {openCounts[0]} · Ready {openCounts[1]} · Out {openCounts[2]}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Ordering window</CardDescription>
            <CalendarClock className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            {settingsError !== null && menu?.cutoff_time == null ? (
              <p className="text-sm text-destructive">{settingsError}</p>
            ) : settings === null && menu?.cutoff_time == null ? (
              <Skeleton className="h-8 w-40" />
            ) : cutoff === null ? (
              <p className="text-2xl font-bold">No cutoff set</p>
            ) : (
              <>
                <p className="flex items-center gap-2 text-2xl font-bold">
                  <Badge variant={orderingOpen ? "default" : "secondary"}>
                    {orderingOpen ? `Open · orders close ${cutoff}` : `Closed · cutoff ${cutoff}`}
                  </Badge>
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {settings?.pickup_start_time && settings?.pickup_end_time
                    ? `Pickup ${settings.pickup_start_time}–${settings.pickup_end_time}.`
                    : "Pickup times not set."}
                  {menu?.cutoff_time ? " Cutoff set on today's menu." : ""}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Payments today</CardDescription>
            <CreditCard className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            {paymentsError !== null ? (
              <p className="text-sm text-destructive">{paymentsError}</p>
            ) : paymentsTotal === null ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-2xl font-bold tabular-nums">{formatNzd(paymentsTotal)}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {paymentsCount} payment{paymentsCount === 1 ? "" : "s"} recorded today.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="text-muted-foreground size-5" />
              <CardTitle>Today&apos;s menu</CardTitle>
            </div>
            {menu !== null && (
              <Badge variant={isMenuPublished(menu) ? "default" : "secondary"}>
                {isMenuPublished(menu) ? "Published" : "Draft"}
              </Badge>
            )}
          </div>
          <CardDescription>
            {menu !== null ? `${today} · cutoff ${menu.cutoff_time ?? "global setting"}` : today}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {menuError !== null ? (
            <p className="text-sm text-destructive">{menuError}</p>
          ) : menu === null ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <>
              {main === null ? (
                <p className="text-sm text-muted-foreground">No main set for today&apos;s menu.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="font-medium">
                    {main.name} · {formatNzd(main.price)}
                  </p>
                  {main.description && (
                    <p className="text-sm text-muted-foreground">{main.description}</p>
                  )}
                </div>
              )}
              {extras.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {extras.map((extra) => (
                    <li key={extra.id} className="text-sm">
                      <span className="font-medium">{extra.name}</span>{" "}
                      <span className="text-muted-foreground">· {formatNzd(extra.price)}</span>
                      {extra.description && (
                        <span className="text-muted-foreground"> — {extra.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No extras on today&apos;s menu.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
