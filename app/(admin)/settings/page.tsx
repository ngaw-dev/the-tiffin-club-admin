// app/(admin)/settings/page.tsx
"use client";

import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";

/** GET /settings — same shape as the public settings endpoint. */
type Settings = {
  delivery_suburbs: string[];
  order_cutoff_time: string | null; // HH:MM
  pickup_start_time: string | null; // HH:MM
  pickup_end_time: string | null; // HH:MM
  store_phone: string;
  store_phone_alternate: string;
  store_email: string;
  pickup_address: string;
  pickup_map_url: string;
};

/** The only keys PUT /settings accepts; nothing else is ever sent. */
/** The only keys PUT /settings accepts (see SettingsPayload below); nothing else is ever sent. */
/** PUT /settings payload — exactly the known keys. */
type SettingsPayload = {
  delivery_suburbs: string[];
  order_cutoff_time: string | null;
  pickup_start_time: string | null;
  pickup_end_time: string | null;
  store_phone: string | null;
  store_phone_alternate: string | null;
  store_email: string | null;
  pickup_address: string | null;
  pickup_map_url: string | null;
};

type FormState = Omit<Settings, "delivery_suburbs"> & { suburbsText: string };

function toForm(settings: Settings): FormState {
  return {
    ...settings,
    order_cutoff_time: settings.order_cutoff_time ?? "",
    pickup_start_time: settings.pickup_start_time ?? "",
    pickup_end_time: settings.pickup_end_time ?? "",
    suburbsText: settings.delivery_suburbs.join("\n"),
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let cancelled = false;
    api
      .get<Settings>("/settings")
      .then((data) => {
        if (!cancelled) setForm(toForm(data));
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(err instanceof ApiError ? err.message : "Failed to load settings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError(null);
    setFieldErrors({});
    setSaved(false);

    const body: SettingsPayload = {
      delivery_suburbs: form.suburbsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      order_cutoff_time: form.order_cutoff_time || null,
      pickup_start_time: form.pickup_start_time || null,
      pickup_end_time: form.pickup_end_time || null,
      store_phone: form.store_phone,
      store_phone_alternate: form.store_phone_alternate,
      store_email: form.store_email,
      pickup_address: form.pickup_address,
      pickup_map_url: form.pickup_map_url,
    };

    try {
      await api.put<Settings>("/settings", body);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setFieldErrors(err.errors ?? {});
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  function fieldError(key: string): string | null {
    const messages = fieldErrors[key];
    return messages && messages.length > 0 ? messages.join(" ") : null;
  }

  function renderField(
    key: Exclude<keyof FormState, "suburbsText">,
    label: string,
    type: string,
    props: { placeholder?: string; autoComplete?: string } = {},
  ) {
    const error = fieldError(key);
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={key} className="text-sm font-medium">
          {label}
        </label>
        <Input
          id={key}
          type={type}
          value={form?.[key] ?? ""}
          onChange={(e) => set(key, e.target.value)}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          {saved && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3" /> Saved
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Configure kitchen details, delivery zones, cutoff times for order changes, and the pickup
          window.
        </p>
      </div>

      {loading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!loading && loadError && (
        <Card>
          <CardHeader>
            <CardTitle>Couldn&apos;t load settings</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {!loading && !loadError && form && (
        <form onSubmit={onSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Store settings</CardTitle>
              <CardDescription>
                Changes apply immediately to the storefront once saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {formError && (
                <p className="text-destructive text-sm" role="alert">
                  {formError}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="delivery_suburbs" className="text-sm font-medium">
                  Delivery suburbs
                </label>
                <textarea
                  id="delivery_suburbs"
                  className="border-input bg-transparent dark:bg-input/30 flex min-h-32 w-full rounded-md border px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                  placeholder={"One suburb per line, e.g.\nParramatta\nHarris Park"}
                  value={form.suburbsText}
                  onChange={(e) => set("suburbsText", e.target.value)}
                  aria-invalid={fieldError("delivery_suburbs") ? true : undefined}
                />
                <p className="text-muted-foreground text-xs">One suburb per line.</p>
                {fieldError("delivery_suburbs") && (
                  <p className="text-destructive text-sm" role="alert">
                    {fieldError("delivery_suburbs")}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {renderField("order_cutoff_time", "Order cutoff time", "time")}
                {renderField("pickup_start_time", "Pickup window start", "time")}
                {renderField("pickup_end_time", "Pickup window end", "time")}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {renderField("store_phone", "Store phone", "tel", { autoComplete: "tel" })}
                {renderField("store_phone_alternate", "Alternate phone", "tel")}
                {renderField("store_email", "Store email", "email", { autoComplete: "email" })}
                {renderField("pickup_map_url", "Pickup map URL", "url", {
                  placeholder: "https://maps.example.com/…",
                })}
              </div>

              {renderField("pickup_address", "Pickup address", "text", {
                autoComplete: "street-address",
              })}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save settings"}
                </Button>
                {saved && (
                  <span className="text-muted-foreground text-sm" role="status">
                    Settings updated.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
