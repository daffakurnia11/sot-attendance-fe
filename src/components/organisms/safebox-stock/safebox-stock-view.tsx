"use client";

import { Alert, Input } from "antd";
import { useState } from "react";

import { Button, ItemQuantityCard, QuantityItemRow, ResourceState, SplitPanel } from "@/components/atoms";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import { cn } from "@/lib";
import { fetchSafeboxStockRoute, type SafeboxStock } from "@/services/safebox-stock";

type Safebox = "public" | "boss";
type StockGroup = "crafting" | "ammo" | "body-drugs" | "weapon" | "blueprint";
type Item = { key: string; name: string; quantity: number; group: StockGroup };
type TransactionRow = { id: number; key: string; quantity: number };

const groups: { key: StockGroup; label: string; short: string }[] = [
  { key: "crafting", label: "Crafting Stock", short: "Crafting" },
  { key: "ammo", label: "Ammo Stock", short: "Ammo" },
  { key: "body-drugs", label: "Body & Drugs Stock", short: "Body & Drugs" },
  { key: "weapon", label: "Weapon Stock", short: "Weapons" },
  { key: "blueprint", label: "Blueprint Stock", short: "Blueprints" },
];

type Props = Readonly<{ initialData: SafeboxStock | null }>;

function mapInitialData(data: SafeboxStock | null): Record<Safebox, Item[]> {
  if (!data?.items.length) return { public: [], boss: [] };
  return {
    public: data.items
      .filter((item) => item.safebox === "public")
      .map((item) => ({
        key: item.item_key,
        name: item.name,
        quantity: item.quantity,
        group: item.stock_group.replace("body_drugs", "body-drugs") as StockGroup,
      })),
    boss: data.items
      .filter((item) => item.safebox === "boss")
      .map((item) => ({
        key: item.item_key,
        name: item.name,
        quantity: item.quantity,
        group: item.stock_group.replace("body_drugs", "body-drugs") as StockGroup,
      })),
  };
}

export function SafeboxStockView({ initialData }: Props) {
  const { t, translate } = useI18n();
  const [box, setBox] = useState<Safebox>("public");
  const [bulkAction, setBulkAction] = useState<"deposit" | "withdraw">("deposit");
  const [bulkRows, setBulkRows] = useState<TransactionRow[]>([{ id: 1, key: "", quantity: 1 }]);
  const [nextRowID, setNextRowID] = useState(2);
  const [bulkReason, setBulkReason] = useState("");
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<{ key: string; input: string } | null>(null);
  const [transactionSubmitting, setTransactionSubmitting] = useState(false);
  const { data, failed, stale, retry, mutate, isLoading } = useLiveResource({
    initialData,
    path: "/api/safebox-stock",
    fetcher: fetchSafeboxStockRoute,
  });
  const items = mapInitialData(data);
  const currentItems = items[box];

  function resetTransaction() {
    setBulkRows([{ id: 1, key: "", quantity: 1 }]);
    setNextRowID(2);
    setBulkReason("");
    setTransactionError(null);
    setTransactionSuccess(null);
    setPendingRequest(null);
  }

  async function submitBulkTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (transactionSubmitting || !data || stale) return;
    if (!bulkReason.trim()) {
      setTransactionError("Reason is required.");
      return;
    }
    const changes = bulkRows
      .map((row) => ({
        item: currentItems.find((item) => item.key === row.key),
        quantity: row.quantity,
      }))
      .filter(
        (change): change is { item: Item; quantity: number } =>
          Boolean(change.item) && Number.isInteger(change.quantity) && change.quantity > 0 && change.quantity <= 10_000,
      );
    if (
      !changes.length ||
      changes.length !== bulkRows.length ||
      new Set(changes.map((change) => change.item.key)).size !== changes.length
    ) {
      setTransactionError("Choose unique items and enter valid quantities.");
      return;
    }
    if (bulkAction === "withdraw" && changes.some(({ item, quantity }) => item.quantity < quantity)) {
      setTransactionError("Withdraw quantity exceeds available stock.");
      return;
    }
    setTransactionSubmitting(true);
    setTransactionError(null);
    setTransactionSuccess(null);
    try {
      const transaction = {
        safebox: box,
        action: bulkAction,
        reason: bulkReason.trim(),
        items: changes.map(({ item, quantity }) => ({ item_key: item.key, quantity })),
      };
      const input = JSON.stringify(transaction);
      const idempotencyKey = pendingRequest?.input === input ? pendingRequest.key : crypto.randomUUID();
      setPendingRequest({ key: idempotencyKey, input });
      const response = await fetch("/api/safebox-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...transaction, idempotency_key: idempotencyKey }),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Safebox transaction failed.";
        throw new Error(message);
      }
      resetTransaction();
      setTransactionSuccess("Stock transaction completed.");
      void mutate().catch(() => setTransactionError("Stock changed, but latest quantities could not be loaded."));
    } catch (error) {
      setTransactionError(error instanceof Error ? error.message : "Safebox transaction failed.");
    } finally {
      setTransactionSubmitting(false);
    }
  }

  if (!data)
    return (
      <ResourceState
        state={isLoading ? "loading" : "unavailable"}
        message={isLoading ? "Loading data..." : "Safebox stock could not be loaded."}
        onRetry={() => void retry()}
      />
    );
  return (
    <>
      {failed || stale ? (
        <ResourceState
          state="stale"
          message={stale ? "Live updates stopped. Sign in again to resume." : "Safebox stock could not be refreshed."}
          onRetry={() => void retry()}
        />
      ) : null}
      <div className="mt-5" aria-live="polite">
        {transactionSuccess ? <Alert type="success" showIcon title={translate(transactionSuccess)} /> : null}
        {transactionError ? <Alert type="error" showIcon title={translate(transactionError)} /> : null}
      </div>

      <SplitPanel
        sidebar={
          <form className="grid content-start gap-4" onSubmit={submitBulkTransaction}>
            <div>
              <p className="text-[10px] font-extrabold tracking-[.2em] text-[var(--color-primary-muted)] uppercase">
                {translate("Stock transaction")}
              </p>
              <h2 className="mt-1 font-display text-xl font-normal uppercase">{translate("Item quantities")}</h2>
            </div>
            <div className="grid grid-cols-2 border border-[var(--color-border)] p-1">
              {(["deposit", "withdraw"] as const).map((action) => (
                <button
                  className={cn(
                    "h-8 text-xs font-extrabold uppercase text-[var(--color-foreground-muted)]",
                    bulkAction === action && "bg-[var(--color-primary)] text-[#160f05]",
                  )}
                  disabled={transactionSubmitting || stale}
                  key={action}
                  onClick={() => {
                    setBulkAction(action);
                    setTransactionError(null);
                  }}
                  type="button"
                >
                  {translate(action)}
                </button>
              ))}
            </div>
            <div className="grid max-h-[300px] gap-2 overflow-y-auto pr-1">
              {bulkRows.map((row, index) => {
                const selectedByOthers = new Set(
                  bulkRows.filter((candidate) => candidate.id !== row.id).map((candidate) => candidate.key),
                );
                return (
                  <QuantityItemRow
                    label={t("Item {number}", { number: index + 1 })}
                    key={row.id}
                    value={row.key}
                    quantity={row.quantity}
                    options={currentItems.map((item) => ({
                      label: item.name,
                      value: item.key,
                      disabled: selectedByOthers.has(item.key),
                    }))}
                    onItemChange={(key) => {
                      setBulkRows((current) =>
                        current.map((entry) => (entry.id === row.id ? { ...entry, key } : entry)),
                      );
                      setTransactionError(null);
                    }}
                    onQuantityChange={(quantity) => {
                      setBulkRows((current) =>
                        current.map((entry) => (entry.id === row.id ? { ...entry, quantity } : entry)),
                      );
                      setTransactionError(null);
                    }}
                    onRemove={() => setBulkRows((current) => current.filter((entry) => entry.id !== row.id))}
                    removeDisabled={bulkRows.length === 1}
                    disabled={transactionSubmitting || stale}
                  />
                );
              })}
            </div>
            <Button
              className="h-9 w-full border-dashed text-xs font-extrabold uppercase"
              intent="secondary"
              disabled={transactionSubmitting || stale || bulkRows.length >= currentItems.length}
              htmlType="button"
              onClick={() => {
                setBulkRows((current) => [...current, { id: nextRowID, key: "", quantity: 1 }]);
                setNextRowID((current) => current + 1);
              }}
            >
              {translate("+ Add item")}
            </Button>
            <Input
              aria-label={t("Transaction reason")}
              disabled={transactionSubmitting || stale}
              maxLength={500}
              className="h-9"
              onChange={(event) => {
                setBulkReason(event.target.value);
                setTransactionError(null);
              }}
              placeholder={t("Reason (required)")}
              value={bulkReason}
            />
            <Button
              className="mt-1 h-10 w-full font-extrabold uppercase"
              disabled={stale || transactionSubmitting || bulkRows.some((row) => !row.key) || !bulkReason.trim()}
              htmlType="submit"
              loading={transactionSubmitting}
            >
              {translate(bulkAction)}
            </Button>
          </form>
        }
      >
        <div className="min-w-0">
          <div
            className="flex justify-end border-b border-[var(--color-border)] p-3"
            role="group"
            aria-label={t("Safebox selection")}
          >
            <div className="flex border border-[var(--color-border)] p-1">
              {(["public", "boss"] as Safebox[]).map((value) => (
                <button
                  className={cn(
                    "border-0 px-4 py-2 text-xs font-extrabold tracking-[.12em] text-[var(--color-foreground-muted)] uppercase",
                    box === value && "bg-[var(--color-primary)] text-[#160f05]",
                  )}
                  key={value}
                  onClick={() => {
                    setBox(value);
                    resetTransaction();
                  }}
                  aria-pressed={box === value}
                  disabled={transactionSubmitting}
                  type="button"
                >
                  {value === "public" ? t("Public Safebox") : t("Boss Safebox")}
                </button>
              ))}
            </div>
          </div>

          {!currentItems.length ? <ResourceState state="empty" message="No stock items configured." /> : null}
          {groups
            .filter((entry) => currentItems.some((item) => item.group === entry.key))
            .map((entry) => {
              const groupedItems = currentItems.filter((item) => item.group === entry.key);
              return (
                <section className="bg-[rgba(13,10,6,.72)]" key={entry.key}>
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
                    <div>
                      <p className="text-[10px] font-extrabold tracking-[.2em] text-[var(--color-primary-muted)] uppercase">
                        {translate(entry.label)}
                      </p>
                      <h2 className="mt-0.5 font-display text-2xl font-normal uppercase">{translate("Stock items")}</h2>
                    </div>
                    <span className="text-[10px] font-extrabold tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
                      {t("{count} items", { count: groupedItems.length })}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 border-b border-[var(--color-border)] p-3 sm:grid-cols-2 xl:grid-cols-4">
                    {groupedItems.length ? (
                      groupedItems.map((item, index) => (
                        <ItemQuantityCard
                          key={item.key}
                          index={index + 1}
                          name={item.name}
                          quantity={item.quantity}
                          note={box === "public" ? "Public Safebox" : "Boss Safebox"}
                        />
                      ))
                    ) : (
                      <div className="col-span-full border border-dashed border-[var(--color-border)] px-5 py-6 text-center text-sm text-[var(--color-foreground-muted)]">
                        {translate("No items configured in this stock group.")}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
        </div>
      </SplitPanel>
    </>
  );
}
