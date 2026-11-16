// app/(admin)/menu/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError, api } from "@/lib/api";
import { formatNzd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "cn";

import { MenuItemForm } from "@/components/menus/menu-item-form";

import { isMenuPublished, type Menu, type MenuItem } from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-NZ", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mainName(menu: Menu): string {
  return menu.items.find((item) => item.type === "main")?.name ?? "No main set";
}

function fieldError(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  for (const messages of Object.values(error.errors)) {
    if (messages.length > 0) return messages[0]!;
  }
  return error.message;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [creating, setCreating] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newCutoff, setNewCutoff] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const loadMenus = useCallback(async (filterDate: string) => {
    setListError(null);
    try {
      const list = await api.get<Menu[] | { data?: Menu[] }>("/menus", {
        sort: "-menu_date",
        "filter[menu_date]": filterDate || undefined,
      });
      // Server may return a raw array or the normalized list envelope.
      setMenus(Array.isArray(list) ? list : (list.data ?? []));
    } catch (error) {
      setMenus([]);
      setListError(error instanceof ApiError ? error.message : "Failed to load menus.");
    }
  }, []);

  useEffect(() => {
    void loadMenus(dateFilter);
  }, [loadMenus, dateFilter]);

  const selected = useMemo(
    () => menus?.find((menu) => menu.id === selectedId) ?? null,
    [menus, selectedId],
  );

  useEffect(() => {
    if (
      menus &&
      menus.length > 0 &&
      (selectedId === null || !menus.some((m) => m.id === selectedId))
    ) {
      setSelectedId(menus[0]!.id);
    }
  }, [menus, selectedId]);

  async function createMenu(event: React.FormEvent) {
    event.preventDefault();
    setCreateError(null);
    if (!DATE_RE.test(newDate)) {
      setCreateError("Enter a date in YYYY-MM-DD format.");
      return;
    }
    if (newCutoff !== "" && !TIME_RE.test(newCutoff)) {
      setCreateError("Cutoff time must be in HH:MM (24-hour) format.");
      return;
    }
    setCreating(true);
    try {
      const menu = await api.post<Menu>("/menus", {
        menu_date: newDate,
        ...(newCutoff !== "" ? { cutoff_time: newCutoff } : {}),
      });
      setNewDate("");
      setNewCutoff("");
      setDateFilter("");
      setSelectedId(menu.id);
      await loadMenus("");
    } catch (error) {
      setCreateError(fieldError(error) ?? "Could not create the menu.");
    } finally {
      setCreating(false);
    }
  }

  async function patchMenu(menu: Menu, body: Record<string, unknown>) {
    // Optimistically update; revert on failure.
    const previous = menus;
    setMenus((current) =>
      current
        ? current.map((m) =>
            m.id === menu.id
              ? {
                  ...m,
                  ...body,
                  ...("publish" in body
                    ? { published_at: body.publish ? new Date().toISOString() : null }
                    : {}),
                }
              : m,
          )
        : current,
    );
    try {
      const updated = await api.patch<Menu>(`/menus/${menu.id}`, body);
      setMenus((current) =>
        current ? current.map((m) => (m.id === updated.id ? updated : m)) : current,
      );
    } catch (error) {
      setMenus(previous);
      setListError(fieldError(error) ?? "Update failed.");
    }
  }

  function replaceMenu(updated: Menu) {
    setMenus((current) =>
      current ? current.map((m) => (m.id === updated.id ? updated : m)) : current,
    );
  }

  function itemSaved(updated: Menu) {
    replaceMenu(updated);
  }

  function itemDeleted(menuId: number, itemId: number) {
    setMenus((current) =>
      current
        ? current.map((m) =>
            m.id === menuId ? { ...m, items: m.items.filter((item) => item.id !== itemId) } : m,
          )
        : current,
    );
  }

  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function deleteMenu(menu: Menu) {
    setDeleteError(null);
    try {
      await api.delete(`/menus/${menu.id}`);
      setSelectedId(null);
      await loadMenus(dateFilter);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setDeleteError(error.message);
      } else {
        setDeleteError(fieldError(error) ?? "Could not delete the menu.");
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Menus</h1>
        <p className="text-sm text-muted-foreground">
          Plan the daily tiffin menus, set ordering cutoffs, and publish them to the storefront.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="menu-date-filter" className="text-sm font-medium">
            Filter by date
          </label>
          <Input
            id="menu-date-filter"
            type="date"
            className="w-44"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </div>
        {dateFilter !== "" && (
          <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>
            Clear
          </Button>
        )}
      </div>

      {listError !== null && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {listError}
        </p>
      )}

      {deleteError !== null && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {deleteError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Menus</CardTitle>
              <CardDescription>Newest first.</CardDescription>
            </CardHeader>
            <CardContent>
              {menus === null && listError === null ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : menus !== null && menus.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {dateFilter !== ""
                    ? `No menu for ${dateFilter}.`
                    : "No menus yet — create the first one below."}
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {menus?.map((menu) => (
                    <li key={menu.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(menu.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                          menu.id === selectedId ? "border-ring bg-accent" : "border-transparent",
                        )}
                      >
                        <span className="flex flex-col">
                          <span className="font-medium">{formatDate(menu.menu_date)}</span>
                          <span className="text-xs text-muted-foreground">
                            {mainName(menu)} · {menu.items.length} item
                            {menu.items.length === 1 ? "" : "s"}
                          </span>
                        </span>
                        <Badge variant={isMenuPublished(menu) ? "default" : "secondary"}>
                          {isMenuPublished(menu) ? "Published" : "Draft"}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create menu</CardTitle>
              <CardDescription>One menu per date. Cutoff time is optional (HH:MM).</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-3" onSubmit={createMenu}>
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="new-menu-date" className="text-sm font-medium">
                      Date
                    </label>
                    <Input
                      id="new-menu-date"
                      type="date"
                      required
                      value={newDate}
                      onChange={(event) => setNewDate(event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="new-menu-cutoff" className="text-sm font-medium">
                      Cutoff time
                    </label>
                    <Input
                      id="new-menu-cutoff"
                      type="time"
                      value={newCutoff}
                      onChange={(event) => setNewCutoff(event.target.value)}
                    />
                  </div>
                </div>
                {createError !== null && <p className="text-sm text-destructive">{createError}</p>}
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create menu"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <MenuDetail
          menu={selected}
          onPatch={patchMenu}
          onDelete={deleteMenu}
          onItemSaved={itemSaved}
          onItemDeleted={itemDeleted}
        />
      </div>
    </div>
  );
}

function MenuDetail({
  menu,
  onPatch,
  onDelete,
  onItemSaved,
  onItemDeleted,
}: {
  menu: Menu | null;
  onPatch: (menu: Menu, body: Record<string, unknown>) => Promise<void>;
  onDelete: (menu: Menu) => Promise<void>;
  onItemSaved: (menu: Menu) => void;
  onItemDeleted: (menuId: number, itemId: number) => void;
}) {
  const [cutoff, setCutoff] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingMain, setAddingMain] = useState(false);
  const [addingExtra, setAddingExtra] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    setCutoff(menu?.cutoff_time ?? "");
  }, [menu?.id, menu?.cutoff_time]);

  useEffect(() => {
    setAddingMain(false);
    setAddingExtra(false);
    setEditingId(null);
    setItemError(null);
  }, [menu?.id]);

  if (menu === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Menu details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a menu to see its items.</p>
        </CardContent>
      </Card>
    );
  }

  const main = menu.items.find((item) => item.type === "main") ?? null;
  const extras = menu.items.filter((item) => item.type === "extra");
  const published = isMenuPublished(menu);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{formatDate(menu.menu_date)}</CardTitle>
            <Badge variant={published ? "default" : "secondary"}>
              {published ? "Published" : "Draft"}
            </Badge>
          </div>
          <CardDescription>
            Ordering cutoff {menu.cutoff_time ?? "inherits global setting"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor={`cutoff-${menu.id}`} className="text-sm font-medium">
                Cutoff time
              </label>
              <Input
                id={`cutoff-${menu.id}`}
                type="time"
                className="w-32"
                value={cutoff}
                onChange={(event) => setCutoff(event.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={saving || cutoff === (menu.cutoff_time ?? "")}
              onClick={async () => {
                setSaving(true);
                await onPatch(
                  menu,
                  cutoff === "" ? { cutoff_time: null } : { cutoff_time: cutoff },
                );
                setSaving(false);
              }}
            >
              {saving ? "Saving…" : "Save cutoff"}
            </Button>
            <Button
              variant={published ? "outline" : "default"}
              size="sm"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await onPatch(menu, { publish: !published });
                setSaving(false);
              }}
            >
              {published ? "Unpublish" : "Publish"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                await onDelete(menu);
                setDeleting(false);
              }}
            >
              {deleting ? "Deleting…" : "Delete menu"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave the cutoff empty to use the global order cutoff time from Settings. Deleting a
            menu fails with a clear message if any order references it; existing orders keep their
            snapshot prices.
          </p>
        </CardContent>
      </Card>

      {itemError !== null && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {itemError}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Main</CardTitle>
          <CardDescription>One main tiffin per day.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {main === null && !addingMain ? (
            <p className="text-sm text-muted-foreground">No main set for this menu yet.</p>
          ) : null}
          {main !== null && editingId === main.id ? (
            <MenuItemForm
              menuId={menu.id}
              item={main}
              onSaved={(saved) => {
                onItemSaved({
                  ...menu,
                  items: menu.items.map((i) => (i.id === saved.id ? saved : i)),
                });
                setEditingId(null);
                setItemError(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : main !== null ? (
            <MenuItemRow
              item={main}
              onEdit={() => {
                setAddingMain(false);
                setEditingId(main.id);
              }}
              onDelete={async () => {
                setItemError(null);
                try {
                  await api.delete(`/menus/${menu.id}/items/${main.id}`);
                  onItemDeleted(menu.id, main.id);
                } catch (error) {
                  setItemError(fieldError(error) ?? "Could not delete the item.");
                }
              }}
            />
          ) : null}
          {addingMain && main === null ? (
            <MenuItemForm
              menuId={menu.id}
              defaultType="main"
              onSaved={(saved) => {
                onItemSaved({ ...menu, items: [...menu.items, saved] });
                setAddingMain(false);
                setItemError(null);
              }}
              onCancel={() => setAddingMain(false)}
            />
          ) : null}
          {!addingMain && main === null ? (
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setAddingMain(true)}
            >
              Add main
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extras</CardTitle>
          <CardDescription>
            Optional add-ons available with the main. Deleting an item is safe for existing orders —
            they keep the price they were charged.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {extras.length === 0 && !addingExtra && editingId === null ? (
            <p className="text-sm text-muted-foreground">No extras on this menu.</p>
          ) : null}
          {extras.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extras.map((extra) =>
                  editingId === extra.id ? (
                    <TableRow key={extra.id}>
                      <TableCell colSpan={4}>
                        <MenuItemForm
                          menuId={menu.id}
                          item={extra}
                          onSaved={(saved) => {
                            onItemSaved({
                              ...menu,
                              items: menu.items.map((i) => (i.id === saved.id ? saved : i)),
                            });
                            setEditingId(null);
                            setItemError(null);
                          }}
                          onCancel={() => setEditingId(null)}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={extra.id}>
                      <TableCell className="font-medium">{extra.name}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {extra.description}
                      </TableCell>
                      <TableCell className="text-right">{formatNzd(extra.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAddingExtra(false);
                              setEditingId(extra.id);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={async () => {
                              setItemError(null);
                              try {
                                await api.delete(`/menus/${menu.id}/items/${extra.id}`);
                                onItemDeleted(menu.id, extra.id);
                              } catch (error) {
                                setItemError(fieldError(error) ?? "Could not delete the item.");
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          ) : null}
          {addingExtra ? (
            <MenuItemForm
              menuId={menu.id}
              defaultType="extra"
              onSaved={(saved) => {
                onItemSaved({ ...menu, items: [...menu.items, saved] });
                setAddingExtra(false);
                setItemError(null);
              }}
              onCancel={() => setAddingExtra(false)}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setAddingExtra(true)}
            >
              Add extra
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MenuItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-medium">{item.name}</p>
      <p className="text-sm text-muted-foreground">{item.description}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{formatNzd(item.price)}</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
