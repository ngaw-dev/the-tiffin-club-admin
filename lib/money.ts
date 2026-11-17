// lib/money.ts

// All API money values are integer cents (NZD). Convert only at the boundary:
// format for display and parse dollar inputs here; keep cents everywhere else.

export function formatNzd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Convert integer cents to a plain dollar string ("16.50"), e.g. for prefilling a form. */
export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Parse a dollar amount ("16", "16.5", "16.50") to integer cents. Returns NaN on invalid input. */
export function dollarsToCents(input: string): number {
  const trimmed = input.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return Number.NaN;
  return Math.round(Number.parseFloat(trimmed) * 100);
}
