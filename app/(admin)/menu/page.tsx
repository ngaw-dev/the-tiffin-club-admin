import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MenuPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Menu</h1>
        <p className="text-sm text-muted-foreground">
          Plan the weekly tiffin menu, mark dishes as vegetarian or vegan, and publish the schedule
          customers see on the storefront.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Menu planner arrives next</CardTitle>
          <CardDescription>
            This is where you&apos;ll build the weekly rotation, set portions, and lock the menu for
            the coming delivery week.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No menu is published yet — check back after the menu milestone lands.
        </CardContent>
      </Card>
    </div>
  );
}
