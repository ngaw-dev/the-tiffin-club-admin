// app/(admin)/menu/page.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MenuItem = {
  name: string;
  description: string;
  /** Price in cents (NZD). */
  price: number;
};

type OrderingWindow = {
  state: "open" | "closed" | "closing_soon";
  open: boolean;
  closing_soon: boolean;
  opens_at: string;
  closes_at: string;
};

const DAILY_MENU = {
  date: "2026-11-16",
  main: {
    name: "Butter Chicken with Jeera Rice",
    description:
      "Tandoori chicken simmered in a tomato-butter gravy, served with cumin rice and a wedge of lemon.",
    price: 1600,
  } satisfies MenuItem,
  extras: [
    {
      name: "Garlic Naan",
      description: "Hand-stretched naan brushed with garlic butter and fresh coriander.",
      price: 400,
    },
    {
      name: "Paneer Pakora (6 pc)",
      description: "Crisp gram-flour battered paneer bites with mint chutney.",
      price: 550,
    },
    {
      name: "Kheer",
      description: "Chilled rice pudding with cardamom, raisins, and toasted almonds.",
      price: 450,
    },
  ] satisfies MenuItem[],
  ordering: {
    state: "open",
    open: true,
    closing_soon: false,
    opens_at: "09:00",
    closes_at: "16:30",
  } satisfies OrderingWindow,
} as const;

function formatNzd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const ORDERING_BADGE: Record<
  OrderingWindow["state"],
  { label: string; variant: "default" | "destructive" | "secondary" }
> = {
  open: { label: "Ordering open", variant: "default" },
  closing_soon: { label: "Closing soon", variant: "secondary" },
  closed: { label: "Ordering closed", variant: "destructive" },
};

export default function MenuPage() {
  const { main, extras, ordering, date } = DAILY_MENU;
  const badge = ORDERING_BADGE[ordering.state];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Today&apos;s Menu —{" "}
            {new Date(`${date}T00:00:00`).toLocaleDateString("en-NZ", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h1>
          <p className="text-sm text-muted-foreground">
            The daily menu customers see on the storefront, with the current ordering window.
          </p>
        </div>
        <Badge variant={badge.variant}>
          {badge.label} · {ordering.opens_at}–{ordering.closes_at}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Main</CardTitle>
          <CardDescription>One main tiffin per day.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <p className="font-medium">{main.name}</p>
          <p className="text-sm text-muted-foreground">{main.description}</p>
          <p className="text-sm font-medium">{formatNzd(main.price)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extras</CardTitle>
          <CardDescription>Optional add-ons available with today&apos;s main.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extras.map((extra) => (
                <TableRow key={extra.name}>
                  <TableCell className="font-medium">{extra.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {extra.description}
                  </TableCell>
                  <TableCell className="text-right">{formatNzd(extra.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
