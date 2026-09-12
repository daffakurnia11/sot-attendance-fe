"use client";

import { Alert, InputNumber } from "antd";
import { Fragment, useState } from "react";

import { Button, Field, FormSection, ResourceState, type Safebox, SafeboxToggle } from "@/components/atoms";
import { useI18n } from "@/i18n";
import { fetchSafeboxStockRoute, maxItemQuantity, type SafeboxStock, stockGroups } from "@/services/safebox-stock";

type Props = Readonly<{ initialData: SafeboxStock | null; isAdmin: boolean }>;

// The Go API requires a reason on every stock transaction; an adjustment made
// here is always the same kind of correction, so it is stamped rather than
// retyped. Deposits and withdrawals from Discord carry their own reasons.
const adjustmentReason = "Adjusting Stocks";

export function SafeboxStockSettings({ initialData, isAdmin }: Props) {
  const { t, translate } = useI18n();
  const [stock, setStock] = useState(initialData);
  const [box, setBox] = useState<Safebox>("public");
  // Only items the administrator actually retyped; everything else keeps the
  // balance the game and the Discord bot are maintaining.
  const [edits, setEdits] = useState<Record<string, number | null>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pendingRequest, setPendingRequest] = useState<{ key: string; input: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const items = (stock?.items ?? []).filter((item) => item.safebox === box);
  const disabled = !isAdmin || submitting;
  const changes = items.filter((item) => edits[item.item_key] != null && edits[item.item_key] !== item.quantity);
  const invalid = items.some((item) => {
    const value = edits[item.item_key];
    return value != null && (!Number.isInteger(value) || value < 0 || value > maxItemQuantity);
  });

  function reset() {
    setEdits({});
    setPendingRequest(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    if (invalid || !changes.length) {
      setFeedback({ type: "error", message: t("Enter a new quantity between 0 and 1,000,000 for at least one item.") });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const transaction = {
        safebox: box,
        action: "adjustment" as const,
        reason: adjustmentReason,
        items: changes.map((item) => ({ item_key: item.item_key, quantity: edits[item.item_key] as number })),
      };
      const input = JSON.stringify(transaction);
      // Reused when an identical payload is resubmitted, so a retry after a
      // timeout is deduplicated by the Go API rather than applied twice.
      const idempotencyKey = pendingRequest?.input === input ? pendingRequest.key : crypto.randomUUID();
      setPendingRequest({ key: idempotencyKey, input });
      const response = await fetch("/api/safebox-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...transaction, idempotency_key: idempotencyKey }),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        throw new Error(
          payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : t("Stock could not be adjusted."),
        );
      }
      reset();
      setFeedback({ type: "success", message: t("Stock adjusted.") });
      setStock(await fetchSafeboxStockRoute());
    } catch (error) {
      setFeedback({
        type: "error",
        message: translate(error instanceof Error ? error.message : t("Stock could not be adjusted.")),
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!stock) return <ResourceState state="unavailable" message="Safebox stock could not be loaded." />;

  return (
    <form onSubmit={submit}>
      <FormSection
        title={<>{t("Safebox stock settings")}</>}
        description={
          <>
            {isAdmin
              ? t("Set the current balance of an item. Deposits and withdrawals happen in Discord.")
              : t("Read-only. Administrator role required to edit.")}
          </>
        }
        footer={
          <>
            <div aria-live="polite">
              {feedback ? <Alert type={feedback.type} showIcon title={feedback.message} /> : null}
            </div>
            <Button
              className="h-11 px-6 font-extrabold uppercase"
              disabled={disabled || invalid || !changes.length}
              htmlType="submit"
              loading={submitting}
            >
              {isAdmin ? t("Save stock") : t("Admin required")}
            </Button>
          </>
        }
      >
        <SafeboxToggle
          className="sm:col-span-2"
          disabled={disabled}
          onChange={(value) => {
            setBox(value);
            reset();
            setFeedback(null);
          }}
          value={box}
        />

        {!items.length ? (
          <div className="sm:col-span-2">
            <ResourceState state="empty" message="No stock items configured." />
          </div>
        ) : null}

        {stockGroups
          .filter((group) => items.some((item) => item.stock_group === group.key))
          .map((group) => (
            <Fragment key={group.key}>
              <h3 className="text-xs font-extrabold tracking-[.2em] text-[var(--color-primary-muted)] uppercase sm:col-span-2">
                {translate(group.label)}
              </h3>
              {items
                .filter((item) => item.stock_group === group.key)
                .map((item) => {
                  const value = edits[item.item_key];
                  const changed = value != null && value !== item.quantity;
                  return (
                    <Field
                      key={item.item_key}
                      label={<>{item.name}</>}
                      help={
                        <>
                          {changed
                            ? t("Was {quantity}", { quantity: item.quantity.toLocaleString() })
                            : t("In stock: {quantity}", { quantity: item.quantity.toLocaleString() })}
                        </>
                      }
                    >
                      <InputNumber
                        aria-label={t("Current quantity of {item}", { item: item.name })}
                        // antd gives InputNumber its own fixed 90px width.
                        className="h-11 !w-full border-[var(--color-border)] bg-[var(--color-control-background)] px-3 text-base"
                        disabled={disabled}
                        max={maxItemQuantity}
                        min={0}
                        onChange={(next) => {
                          setEdits((current) => ({ ...current, [item.item_key]: next }));
                          setFeedback(null);
                        }}
                        precision={0}
                        value={value ?? item.quantity}
                      />
                    </Field>
                  );
                })}
            </Fragment>
          ))}
      </FormSection>
    </form>
  );
}
