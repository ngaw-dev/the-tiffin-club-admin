// components/menus/menu-item-form.tsx
"use client";

import { useState } from "react";

import { ApiError, api } from "@/lib/api";
import { dollarsToCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { MenuItem, MenuItemType } from "@/app/(admin)/menu/types";

function fieldError(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  for (const messages of Object.values(error.errors)) {
    if (messages.length > 0) return messages[0]!;
  }
  return error.message;
}

export function MenuItemForm({
  menuId,
  item,
  defaultType,
  onSaved,
  onCancel,
}: {
  menuId: number;
  /** Present in edit mode. */
  item?: MenuItem;
  /** Used only when creating (edit mode keeps the item's existing type). */
  defaultType?: MenuItemType;
  /** Called with the saved item after a successful create or update. */
  onSaved: (item: MenuItem) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  // Prices are dollars in the UI, cents at the API boundary.
  const [price, setPrice] = useState(item ? (item.price / 100).toFixed(2) : "");
  const [sortOrder, setSortOrder] = useState(item ? String(item.sort_order) : "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (name.trim() === "") {
      setError("Name is required.");
      return;
    }
    const cents = dollarsToCents(price);
    if (Number.isNaN(cents)) {
      setError("Enter a valid price in dollars, e.g. 16.50.");
      return;
    }
    const parsedSort = sortOrder.trim() === "" ? undefined : Number.parseInt(sortOrder, 10);
    if (parsedSort !== undefined && Number.isNaN(parsedSort)) {
      setError("Sort order must be a whole number.");
      return;
    }
    setBusy(true);
    try {
      const type = item?.type ?? defaultType;
      if (type === undefined) throw new Error("A type is required for new items.");
      const body = {
        type,
        name: name.trim(),
        ...(description.trim() !== "" ? { description: description.trim() } : {}),
        price: cents,
        ...(parsedSort !== undefined ? { sort_order: parsedSort } : {}),
      };
      const saved =
        item === undefined
          ? await api.post<MenuItem>(`/menus/${menuId}/items`, body)
          : await api.patch<MenuItem>(`/menus/${menuId}/items/${item.id}`, body);
      onSaved(saved);
    } catch (catchError) {
      setError(fieldError(catchError) ?? "Could not save the item.");
    } finally {
      setBusy(false);
    }
  }

  const idPrefix = item === undefined ? `new-${defaultType}` : `edit-${item.id}`;

  return (
    <form className="flex flex-col gap-3" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-name`} className="text-sm font-medium">
            Name
          </label>
          <Input
            id={`${idPrefix}-name`}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-price`} className="text-sm font-medium">
            Price ($)
          </label>
          <Input
            id={`${idPrefix}-price`}
            inputMode="decimal"
            placeholder="16.50"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-description`} className="text-sm font-medium">
          Description (optional)
        </label>
        <Input
          id={`${idPrefix}-description`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-sort`} className="text-sm font-medium">
            Sort order (optional)
          </label>
          <Input
            id={`${idPrefix}-sort`}
            inputMode="numeric"
            className="w-28"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "Saving…" : item === undefined ? "Add item" : "Save"}
          </Button>
          {onCancel !== undefined && (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      {error !== null && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
