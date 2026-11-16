import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Today at a glance: orders in progress, delivery loads, and anything that needs attention
          before the next run leaves the kitchen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Today&apos;s orders</CardDescription>
            <CardTitle className="text-3xl tabular-nums">—</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tiffins ordered for today&apos;s kitchen run.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active customers</CardDescription>
            <CardTitle className="text-3xl tabular-nums">0</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Subscribers currently on a meal plan.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ordering window</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Badge variant="default">Open · 09:00–16:30</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Customers can place orders while the window is open.
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
