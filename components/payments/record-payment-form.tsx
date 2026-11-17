// components/payments/record-payment-form.tsx
// Shared cash-only record-payment form (POST /payments). Used on the order
// detail page (fixed order) and the payments list dialog (order id picker).

"use client";

import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { dollarsToCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PaymentMethod } from "@/app/(admin)/payments/types";

const PAYMENT_METHOD: PaymentMethod = "cash";

/** First 422 field error, falling back to the general message. */
function paymentFieldError(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  for (const messages of Object.values(error.errors)) {
    if (messages.length > 0) return messages[0]!;
  }
  return error.message;
}

export type RecordPaymentFormProps = {
  /** When set, payments are recorded against this order (no order picker). */
  orderId?: number;
  /** Amount to prefill, in dollars ("16.50"). Re-applied when it changes. */
  initialAmount?: string;
  /** Called after a payment is successfully recorded. */
  onRecorded?: () => void;
};

export function RecordPaymentForm({ orderId, initialAmount = "", onRecorded }: RecordPaymentFormProps) {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [amount, setAmount] = useState(initialAmount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const effectiveOrderId = orderId ?? orderIdInput.trim();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(null);
    if (!effectiveOrderId) {
      setError("Enter an order id.");
      return;
    }
    const cents = dollarsToCents(amount);
    if (Number.isNaN(cents) || cents <= 0) {
      setError("Enter a valid dollar amount, e.g. 16.50.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/payments", {
        order_id: Number(effectiveOrderId),
        amount: cents,
        method: PAYMENT_METHOD,
      });
      setSaved("Payment recorded.");
      onRecorded?.();
    } catch (err) {
      setError(paymentFieldError(err) ?? "Could not record the payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={(e) => void submit(e)}>
      <div className="flex flex-wrap items-end gap-3">
        {orderId === undefined && (
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Order ID
            <Input
              className="h-9 w-32"
              inputMode="numeric"
              placeholder="e.g. 42"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
            />
          </label>
        )}
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Amount (NZD)
          <Input
            className="h-9 w-32"
            inputMode="decimal"
            placeholder="e.g. 16.50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Method
          <Input className="h-9 w-32" value="Cash" disabled />
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? "Recording…" : "Record payment"}
        </Button>
      </div>
      {saved && <p className="text-sm text-muted-foreground">{saved}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
