// app/(admin)/orders/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
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
        <CardHeader>
          <CardTitle>Order tracking is on the way</CardTitle>
          <CardDescription>
            Once live, this page lists every order with its status, customer, delivery slot, and any
            kitchen notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Orders will flow in automatically from the storefront — nothing to action here yet.
        </CardContent>
      </Card>
    </div>
  );
}
