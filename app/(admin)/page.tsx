// app/(admin)/page.tsx
import { CalendarClock, ClipboardList, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Today at a glance: orders in progress, delivery loads, and anything that needs attention
          before the next run leaves the kitchen.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Today&apos;s orders</CardDescription>
            <ClipboardList className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">—</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Tiffins ordered for today&apos;s kitchen run.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Active customers</CardDescription>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">0</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Subscribers currently on a meal plan.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Ordering window</CardDescription>
            <CalendarClock className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2 text-2xl font-bold">
              <Badge variant="default">Open · 09:00–16:30</Badge>
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Customers can place orders while the window is open.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders today</CardTitle>
          <CardDescription>
            No orders yet. Once customers start ordering, each tiffin appears here with its pickup
            or delivery status.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Orders will show up here as soon as the first one comes in.
        </CardContent>
      </Card>
    </div>
  );
}
