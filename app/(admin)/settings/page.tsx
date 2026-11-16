// app/(admin)/settings/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure kitchen details, delivery zones, cutoff times for order changes, and who on the
          team can access what.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nothing configurable yet</CardTitle>
          <CardDescription>
            Delivery zones and order cutoffs become editable here once the scheduling milestone
            ships.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Defaults are in use across the app for now.
        </CardContent>
      </Card>
    </div>
  );
}
