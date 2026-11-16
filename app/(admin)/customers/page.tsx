// app/(admin)/customers/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomersPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Look up subscribers, manage delivery addresses and dietary preferences, and pause or
          resume tiffin plans.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer directory comes later</CardTitle>
          <CardDescription>
            Subscriber records, plan history, and pause requests will be searchable from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Customer data syncs from the storefront once subscriptions launch.
        </CardContent>
      </Card>
    </div>
  );
}
