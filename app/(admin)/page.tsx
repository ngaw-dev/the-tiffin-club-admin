import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card>
        <CardHeader>
          <CardTitle>Coming in a later milestone</CardTitle>
          <CardDescription>
            Live counts for today&apos;s tiffins, outstanding deliveries, and kitchen load will
            appear here once order tracking lands.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Until then, use the sidebar to manage the weekly menu and look up customers.
        </CardContent>
      </Card>
    </div>
  );
}
